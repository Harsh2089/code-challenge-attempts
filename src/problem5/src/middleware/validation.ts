import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../types";

// Validation schemas
export const userValidationSchemas = {
  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "user").optional(),
  }),

  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid("admin", "user").optional(),
    isActive: Joi.boolean().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const productValidationSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().required(),
    category: Joi.string().min(1).max(50).required(),
    stock: Joi.number().integer().min(0).required(),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().optional(),
    category: Joi.string().min(1).max(50).optional(),
    stock: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const queryValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sort: Joi.string().optional(),
  order: Joi.string().valid("ASC", "DESC").optional(),
  search: Joi.string().max(100).optional(),
  category: Joi.string().max(50).optional(),
  isActive: Joi.boolean().optional(),
});

// Validation middleware factory
export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const data =
      source === "body"
        ? req.body
        : source === "query"
        ? req.query
        : req.params;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(
        (detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        })
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "Validation Error",
        details: validationErrors,
      });
    }

    // Replace the original data with validated and sanitized data
    if (source === "body") {
      req.body = value;
    } else if (source === "query") {
      req.query = value;
    } else {
      req.params = value;
    }

    next();
  };
};

// ID validation middleware
export const validateId = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID provided",
      error: "ID must be a positive integer",
    });
  }

  req.params.id = id.toString();
  next();
};
