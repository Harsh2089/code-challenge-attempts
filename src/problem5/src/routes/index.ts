import { Router } from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";
import { Request, Response } from "express";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API documentation information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API documentation information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API Documentation
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: GET /api/health
 *                     users:
 *                       type: object
 *                       properties:
 *                         login:
 *                           type: string
 *                           example: POST /api/users/login
 *                         profile:
 *                           type: string
 *                           example: GET /api/users/profile
 *                         create:
 *                           type: string
 *                           example: POST /api/users (admin only)
 *                         list:
 *                           type: string
 *                           example: GET /api/users (admin only)
 *                         get:
 *                           type: string
 *                           example: GET /api/users/:id (admin only)
 *                         update:
 *                           type: string
 *                           example: PUT /api/users/:id (admin only)
 *                         delete:
 *                           type: string
 *                           example: DELETE /api/users/:id (admin only)
 *                     products:
 *                       type: object
 *                       properties:
 *                         list:
 *                           type: string
 *                           example: GET /api/products
 *                         get:
 *                           type: string
 *                           example: GET /api/products/:id
 *                         create:
 *                           type: string
 *                           example: POST /api/products (admin only)
 *                         update:
 *                           type: string
 *                           example: PUT /api/products/:id (admin only)
 *                         delete:
 *                           type: string
 *                           example: DELETE /api/products/:id (admin only)
 *                         categories:
 *                           type: string
 *                           example: GET /api/products/categories
 *                         stats:
 *                           type: string
 *                           example: GET /api/products/stats
 *                 authentication:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Bearer Token
 *                     header:
 *                       type: string
 *                       example: Authorization: Bearer <token>
 *                     login:
 *                       type: string
 *                       example: POST /api/users/login with email and password
 *                 queryParameters:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: string
 *                       example: ?page=1&limit=10
 *                     sorting:
 *                       type: string
 *                       example: ?sort=name&order=ASC
 *                     filtering:
 *                       type: string
 *                       example: ?search=keyword&category=Electronics&isActive=true
 */
router.get("/docs", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API Documentation",
    endpoints: {
      health: "GET /api/health",
      users: {
        login: "POST /api/users/login",
        profile: "GET /api/users/profile",
        create: "POST /api/users (admin only)",
        list: "GET /api/users (admin only)",
        get: "GET /api/users/:id (admin only)",
        update: "PUT /api/users/:id (admin only)",
        delete: "DELETE /api/users/:id (admin only)",
      },
      products: {
        list: "GET /api/products",
        get: "GET /api/products/:id",
        create: "POST /api/products (admin only)",
        update: "PUT /api/products/:id (admin only)",
        delete: "DELETE /api/products/:id (admin only)",
        categories: "GET /api/products/categories",
        stats: "GET /api/products/stats",
      },
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <token>",
      login: "POST /api/users/login with email and password",
    },
    queryParameters: {
      pagination: "?page=1&limit=10",
      sorting: "?sort=name&order=ASC",
      filtering: "?search=keyword&category=Electronics&isActive=true",
    },
  });
});

// Route handlers
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
