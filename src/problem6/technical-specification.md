# Scoreboard API Module - Technical Specification

## Implementation Guidelines for Backend Engineering Team

### 1. Project Structure

```
scoreboard-api/
├── src/
│   ├── controllers/
│   │   ├── scoreController.ts
│   │   └── leaderboardController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   ├── validation.ts
│   │   └── antiCheat.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Score.ts
│   │   └── Action.ts
│   ├── services/
│   │   ├── scoreService.ts
│   │   ├── leaderboardService.ts
│   │   ├── websocketService.ts
│   │   └── cacheService.ts
│   ├── routes/
│   │   ├── scores.ts
│   │   └── leaderboard.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── metrics.ts
│   │   └── helpers.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.md
│   └── deployment.md
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

### 2. Core Implementation Requirements

#### 2.1 Score Update Controller

```typescript
// src/controllers/scoreController.ts
export class ScoreController {
  async updateScore(req: Request, res: Response): Promise<void> {
    try {
      const { userId, scoreIncrement, actionId, timestamp } = req.body;
      
      // Validate input
      await this.validateScoreUpdate(req.body);
      
      // Check authentication
      const user = await this.authService.validateToken(req.headers.authorization);
      
      // Anti-cheat validation
      await this.antiCheatService.validateAction(userId, actionId, scoreIncrement);
      
      // Update score
      const result = await this.scoreService.updateScore({
        userId,
        scoreIncrement,
        actionId,
        timestamp
      });
      
      // Broadcast real-time update
      await this.websocketService.broadcastScoreUpdate(result);
      
      res.json({
        success: true,
        message: "Score updated successfully",
        newScore: result.newScore,
        leaderboardPosition: result.leaderboardPosition
      });
      
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
```

#### 2.2 Anti-Cheat Service

```typescript
// src/services/antiCheatService.ts
export class AntiCheatService {
  async validateAction(userId: string, actionId: string, scoreIncrement: number): Promise<void> {
    // Check if action already completed
    const existingAction = await this.actionRepository.findByUserAndAction(userId, actionId);
    if (existingAction) {
      throw new Error('DUPLICATE_ACTION');
    }
    
    // Validate score increment bounds
    if (scoreIncrement < 1 || scoreIncrement > 1000) {
      throw new Error('INVALID_SCORE_INCREMENT');
    }
    
    // Check time constraints (action must be completed within reasonable time)
    const timeDiff = Date.now() - timestamp;
    if (timeDiff > 300000) { // 5 minutes
      throw new Error('ACTION_TIMEOUT');
    }
    
    // Additional behavioral analysis
    await this.analyzeUserBehavior(userId, scoreIncrement);
  }
}
```

#### 2.3 WebSocket Service

```typescript
// src/services/websocketService.ts
export class WebSocketService {
  async broadcastScoreUpdate(scoreData: ScoreUpdateData): Promise<void> {
    const event = {
      type: 'score_update',
      data: {
        userId: scoreData.userId,
        newScore: scoreData.newScore,
        rank: scoreData.rank,
        leaderboardPosition: scoreData.leaderboardPosition
      }
    };
    
    // Broadcast to all connected clients
    this.io.emit('score_update', event);
    
    // If user is in top 10, broadcast leaderboard update
    if (scoreData.leaderboardPosition <= 10) {
      await this.broadcastLeaderboardUpdate();
    }
  }
  
  async broadcastLeaderboardUpdate(): Promise<void> {
    const leaderboard = await this.leaderboardService.getTop10();
    const event = {
      type: 'leaderboard_update',
      data: {
        leaderboard,
        updatedAt: new Date().toISOString()
      }
    };
    
    this.io.emit('leaderboard_update', event);
  }
}
```

### 3. Database Implementation

#### 3.1 Database Migrations

```sql
-- Migration: 001_create_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration: 002_create_user_scores_table.sql
CREATE TABLE user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  rank INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),
  total_actions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: 003_create_completed_actions_table.sql
CREATE TABLE completed_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_id VARCHAR(100) NOT NULL,
  score_increment INTEGER NOT NULL CHECK (score_increment > 0),
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, action_id)
);

-- Migration: 004_create_indexes.sql
CREATE INDEX idx_user_scores_score ON user_scores(score DESC);
CREATE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_user_scores_rank ON user_scores(rank);
CREATE INDEX idx_completed_actions_user_action ON completed_actions(user_id, action_id);
CREATE INDEX idx_completed_actions_completed_at ON completed_actions(completed_at);
```

#### 3.2 Database Service Layer

```typescript
// src/services/databaseService.ts
export class DatabaseService {
  async updateUserScore(scoreData: ScoreUpdateData): Promise<ScoreUpdateResult> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user score
      const scoreResult = await client.query(
        'UPDATE user_scores SET score = score + $1, last_updated = NOW() WHERE user_id = $2 RETURNING score',
        [scoreData.scoreIncrement, scoreData.userId]
      );
      
      // Record completed action
      await client.query(
        'INSERT INTO completed_actions (user_id, action_id, score_increment) VALUES ($1, $2, $3)',
        [scoreData.userId, scoreData.actionId, scoreData.scoreIncrement]
      );
      
      // Update ranks
      await this.updateRanks(client);
      
      await client.query('COMMIT');
      
      return {
        newScore: scoreResult.rows[0].score,
        leaderboardPosition: await this.getLeaderboardPosition(scoreData.userId)
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### 4. Caching Strategy

#### 4.1 Redis Implementation

```typescript
// src/services/cacheService.ts
export class CacheService {
  private redis: Redis;
  
  async getLeaderboard(): Promise<LeaderboardEntry[] | null> {
    const cached = await this.redis.get('leaderboard:top10');
    return cached ? JSON.parse(cached) : null;
  }
  
  async setLeaderboard(leaderboard: LeaderboardEntry[]): Promise<void> {
    await this.redis.setex('leaderboard:top10', 30, JSON.stringify(leaderboard));
  }
  
  async invalidateLeaderboard(): Promise<void> {
    await this.redis.del('leaderboard:top10');
  }
  
  async getUserScore(userId: string): Promise<UserScore | null> {
    const cached = await this.redis.get(`user:${userId}:score`);
    return cached ? JSON.parse(cached) : null;
  }
  
  async setUserScore(userId: string, score: UserScore): Promise<void> {
    await this.redis.setex(`user:${userId}:score`, 300, JSON.stringify(score));
  }
}
```

### 5. Rate Limiting Implementation

#### 5.1 Rate Limiter Middleware

```typescript
// src/middleware/rateLimiter.ts
export class RateLimiter {
  private redis: Redis;
  
  async checkRateLimit(userId: string, ip: string): Promise<boolean> {
    const userKey = `rate_limit:user:${userId}`;
    const ipKey = `rate_limit:ip:${ip}`;
    
    const [userCount, ipCount] = await Promise.all([
      this.redis.incr(userKey),
      this.redis.incr(ipKey)
    ]);
    
    if (userCount === 1) {
      await this.redis.expire(userKey, 60); // 1 minute window
    }
    
    if (ipCount === 1) {
      await this.redis.expire(ipKey, 3600); // 1 hour window
    }
    
    return userCount <= 100 && ipCount <= 1000;
  }
}
```

### 6. Monitoring and Logging

#### 6.1 Structured Logging

```typescript
// src/utils/logger.ts
export class Logger {
  static logScoreUpdate(userId: string, scoreIncrement: number, actionId: string): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'score_update',
      userId,
      scoreIncrement,
      actionId,
      service: 'scoreboard-api'
    }));
  }
  
  static logSecurityEvent(event: string, userId: string, details: any): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      event: 'security_event',
      securityEvent: event,
      userId,
      details,
      service: 'scoreboard-api'
    }));
  }
}
```

#### 6.2 Metrics Collection

```typescript
// src/utils/metrics.ts
export class Metrics {
  static recordScoreUpdate(duration: number, success: boolean): void {
    // Record to your metrics system (Prometheus, DataDog, etc.)
    console.log(JSON.stringify({
      metric: 'score_update_duration',
      value: duration,
      tags: { success: success.toString() }
    }));
  }
  
  static recordRateLimitHit(userId: string): void {
    console.log(JSON.stringify({
      metric: 'rate_limit_hit',
      value: 1,
      tags: { userId }
    }));
  }
}
```

### 7. Testing Implementation

#### 7.1 Unit Tests

```typescript
// tests/unit/scoreController.test.ts
describe('ScoreController', () => {
  it('should update score successfully', async () => {
    const mockRequest = {
      body: {
        userId: 'user123',
        scoreIncrement: 100,
        actionId: 'action456',
        timestamp: Date.now()
      },
      headers: { authorization: 'Bearer valid-token' }
    };
    
    const mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    await scoreController.updateScore(mockRequest, mockResponse);
    
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Score updated successfully',
      newScore: expect.any(Number),
      leaderboardPosition: expect.any(Number)
    });
  });
});
```

#### 7.2 Integration Tests

```typescript
// tests/integration/scoreboard.test.ts
describe('Scoreboard API Integration', () => {
  it('should handle complete score update flow', async () => {
    const response = await request(app)
      .post('/api/scores/update')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userId: 'user123',
        scoreIncrement: 100,
        actionId: 'action456',
        timestamp: Date.now()
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 8. Deployment Configuration

#### 8.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### 8.2 Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  scoreboard-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/scoreboard
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=scoreboard
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 9. Performance Optimization Guidelines

#### 9.1 Database Optimization

1. **Connection Pooling**: Use pg-pool with 20-50 connections
2. **Query Optimization**: Use prepared statements for frequent queries
3. **Indexing Strategy**: Monitor query performance and add indexes as needed
4. **Read Replicas**: Implement read replicas for leaderboard queries

#### 9.2 Caching Strategy

1. **Leaderboard Cache**: 30-second TTL for top 10
2. **User Score Cache**: 5-minute TTL for individual scores
3. **Cache Warming**: Pre-populate cache during low-traffic periods
4. **Cache Invalidation**: Smart invalidation based on score changes

#### 9.3 WebSocket Optimization

1. **Connection Limits**: Maximum 10,000 concurrent connections
2. **Message Batching**: Batch multiple updates into single messages
3. **Room-based Broadcasting**: Only send updates to relevant clients
4. **Connection Health**: Implement heartbeat and reconnection logic

### 10. Security Implementation Checklist

- [ ] JWT token validation with RS256
- [ ] Rate limiting per user and IP
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configuration
- [ ] HTTPS/WSS enforcement
- [ ] Request logging and monitoring
- [ ] Error message sanitization
- [ ] Database connection encryption

### 11. Monitoring and Alerting

#### 11.1 Key Metrics to Monitor

1. **Performance Metrics**:
   - API response times
   - Database query performance
   - WebSocket connection count
   - Cache hit/miss ratios

2. **Business Metrics**:
   - Score updates per minute
   - Leaderboard changes
   - User engagement
   - Anti-cheat violations

3. **System Metrics**:
   - CPU and memory usage
   - Database connections
   - Redis memory usage
   - Network throughput

#### 11.2 Alerting Rules

```yaml
# Example alerting configuration
alerts:
  - name: HighResponseTime
    condition: avg(response_time) > 1000ms
    severity: warning
  
  - name: DatabaseConnectionPoolExhausted
    condition: active_connections >= max_connections * 0.9
    severity: critical
  
  - name: HighRateLimitHits
    condition: rate_limit_hits > 100/minute
    severity: warning
```

This technical specification provides the backend engineering team with detailed implementation guidance, code examples, and best practices for building a robust, secure, and scalable scoreboard API module.
