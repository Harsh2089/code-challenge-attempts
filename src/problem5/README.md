# Express CRUD API

A simple but powerful REST API built with Express, TypeScript, and MongoDB. Handles user management and product catalog with proper authentication and validation.

## What's included

**Basic stuff:**
- User registration and login with JWT tokens
- Full CRUD for users and products
- Role-based permissions (admin vs regular users)
- Input validation and error handling
- MongoDB integration with Mongoose

**Security:**
- Password hashing with bcrypt
- JWT authentication
- Rate limiting to prevent spam
- CORS configuration
- Security headers with Helmet

**Developer tools:**
- TypeScript for better code quality
- Hot reloading with nodemon
- ESLint for code formatting
- Request logging
- Interactive API docs with Swagger

## Requirements

You'll need:
- Node.js 16+ 
- MongoDB running locally
- npm or yarn

## Getting started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your environment:**
   ```bash
   cp env.example .env
   ```
   
   Then edit `.env` with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/express-crud-api
   JWT_SECRET=your-secret-key-here
   ```

3. **Make sure MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## API Documentation

Once the server is running, you can check out the interactive docs:

- **Swagger UI**: `http://localhost:5000/api-docs` - Test the API directly in your browser
- **Health Check**: `http://localhost:5000/api/health` - Make sure everything's working
- **API Info**: `http://localhost:5000/api/docs` - Basic endpoint info

The Swagger docs let you test all endpoints with proper authentication and see exactly what data to send.

## Other commands

```bash
npm run lint      # Check code style
npm run lint:fix  # Fix code style issues
npm test          # Run tests
```

## API Endpoints

Base URL: `http://localhost:5000/api`

**Authentication:** Include `Authorization: Bearer <token>` header for protected routes.

**Public endpoints:**
- `GET /api/products` - List products
- `GET /api/products/:id` - Get single product  
- `GET /api/products/categories` - Get categories
- `POST /api/users/login` - Login

**User profile:**
- `GET /api/users/profile` - Get your profile

**Admin only:**
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Authentication

Login to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

You'll get back a token. Use it in requests:

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer your-token-here"
```

## Examples

**Get products:**
```bash
curl -X GET http://localhost:5000/api/products
```

**Create a product (admin only):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"name":"iPhone","price":999,"category":"Electronics","stock":10}'
```

**Filter products:**
```bash
curl -X GET "http://localhost:5000/api/products?category=Electronics&search=phone"
```

## Query Parameters

**Pagination:**
- `?page=1&limit=10` - Page and items per page

**Filtering:**
- `?search=laptop` - Search in name/description
- `?category=Electronics` - Filter by category
- `?isActive=true` - Filter by status

**Sorting:**
- `?sort=price&order=ASC` - Sort by field

## Database

Uses MongoDB with two collections:

**Users:** username, email, password (hashed), role, isActive, timestamps
**Products:** name, description, price, category, stock, isActive, timestamps

## That's it!

The API is pretty straightforward - login to get a token, then use it for protected routes. Check out the Swagger docs at `http://localhost:5000/api-docs` to test everything out.
