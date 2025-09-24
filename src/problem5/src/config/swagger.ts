import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express CRUD API",
    version: "1.0.0",
    description:
      "A comprehensive RESTful API built with Express.js, TypeScript, and MongoDB",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://your-production-url.com/api"
          : "http://localhost:5000/api",
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          id: {
            type: "string",
            description: "User ID",
            example: "507f1f77bcf86cd799439011",
          },
          username: {
            type: "string",
            description: "Username",
            minLength: 3,
            maxLength: 30,
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john@example.com",
          },
          role: {
            type: "string",
            enum: ["admin", "user"],
            description: "User role",
            example: "user",
          },
          isActive: {
            type: "boolean",
            description: "User active status",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "User creation date",
            example: "2024-01-01T00:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "User last update date",
            example: "2024-01-01T00:00:00.000Z",
          },
        },
      },
      Product: {
        type: "object",
        required: ["name", "price", "category", "stock"],
        properties: {
          id: {
            type: "string",
            description: "Product ID",
            example: "507f1f77bcf86cd799439011",
          },
          name: {
            type: "string",
            description: "Product name",
            minLength: 1,
            maxLength: 100,
            example: "Laptop Pro",
          },
          description: {
            type: "string",
            description: "Product description",
            maxLength: 500,
            example: "High-performance laptop for professionals",
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Product price",
            example: 1299.99,
          },
          category: {
            type: "string",
            description: "Product category",
            minLength: 1,
            maxLength: 50,
            example: "Electronics",
          },
          stock: {
            type: "number",
            minimum: 0,
            description: "Product stock quantity",
            example: 50,
          },
          isActive: {
            type: "boolean",
            description: "Product active status",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Product creation date",
            example: "2024-01-01T00:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Product last update date",
            example: "2024-01-01T00:00:00.000Z",
          },
        },
      },
      CreateUser: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: {
            type: "string",
            description: "Username",
            minLength: 3,
            maxLength: 30,
            pattern: "^[a-zA-Z0-9]+$",
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john@example.com",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "User password",
            example: "password123",
          },
          role: {
            type: "string",
            enum: ["admin", "user"],
            description: "User role",
            example: "user",
          },
        },
      },
      UpdateUser: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Username",
            minLength: 3,
            maxLength: 30,
            pattern: "^[a-zA-Z0-9]+$",
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john@example.com",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "User password",
            example: "password123",
          },
          role: {
            type: "string",
            enum: ["admin", "user"],
            description: "User role",
            example: "user",
          },
          isActive: {
            type: "boolean",
            description: "User active status",
            example: true,
          },
        },
      },
      CreateProduct: {
        type: "object",
        required: ["name", "price", "category", "stock"],
        properties: {
          name: {
            type: "string",
            description: "Product name",
            minLength: 1,
            maxLength: 100,
            example: "Laptop Pro",
          },
          description: {
            type: "string",
            description: "Product description",
            maxLength: 500,
            example: "High-performance laptop for professionals",
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Product price",
            example: 1299.99,
          },
          category: {
            type: "string",
            description: "Product category",
            minLength: 1,
            maxLength: 50,
            example: "Electronics",
          },
          stock: {
            type: "number",
            minimum: 0,
            description: "Product stock quantity",
            example: 50,
          },
        },
      },
      UpdateProduct: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Product name",
            minLength: 1,
            maxLength: 100,
            example: "Laptop Pro",
          },
          description: {
            type: "string",
            description: "Product description",
            maxLength: 500,
            example: "High-performance laptop for professionals",
          },
          price: {
            type: "number",
            minimum: 0,
            description: "Product price",
            example: 1299.99,
          },
          category: {
            type: "string",
            description: "Product category",
            minLength: 1,
            maxLength: 50,
            example: "Electronics",
          },
          stock: {
            type: "number",
            minimum: 0,
            description: "Product stock quantity",
            example: 50,
          },
          isActive: {
            type: "boolean",
            description: "Product active status",
            example: true,
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "admin@example.com",
          },
          password: {
            type: "string",
            description: "User password",
            example: "admin123",
          },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Response success status",
            example: true,
          },
          message: {
            type: "string",
            description: "Response message",
            example: "Operation successful",
          },
          data: {
            type: "object",
            description: "Response data",
          },
          error: {
            type: "string",
            description: "Error message",
            example: "Validation Error",
          },
          pagination: {
            type: "object",
            properties: {
              page: {
                type: "number",
                description: "Current page number",
                example: 1,
              },
              limit: {
                type: "number",
                description: "Items per page",
                example: 10,
              },
              total: {
                type: "number",
                description: "Total number of items",
                example: 100,
              },
              totalPages: {
                type: "number",
                description: "Total number of pages",
                example: 10,
              },
              hasNext: {
                type: "boolean",
                description: "Whether there is a next page",
                example: true,
              },
              hasPrev: {
                type: "boolean",
                description: "Whether there is a previous page",
                example: false,
              },
            },
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          field: {
            type: "string",
            description: "Field name with error",
            example: "email",
          },
          message: {
            type: "string",
            description: "Error message",
            example: "Email is required",
          },
          value: {
            type: "string",
            description: "Invalid value provided",
            example: "",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "Products",
      description: "Product management endpoints",
    },
    {
      name: "Health",
      description: "Health check and system information",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
