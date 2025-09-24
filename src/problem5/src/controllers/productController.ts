import { Request, Response } from "express";
import { Product, IProduct } from "../models/Product";
import {
  CreateProductRequest,
  UpdateProductRequest,
  QueryParams,
  ApiResponse,
  PaginationInfo,
} from "../types";
import { CustomError, asyncHandler } from "../middleware/errorHandler";

// Create a new product
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, price, category, stock }: CreateProductRequest =
      req.body;

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      throw new CustomError("Product with this name already exists", 409);
    }

    // Create product
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
    });

    await newProduct.save();

    const response: ApiResponse<IProduct> = {
      success: true,
      message: "Product created successfully",
      data: newProduct,
    };

    res.status(201).json(response);
  }
);

// Get all products with pagination and filtering
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "DESC",
    search,
    category,
    isActive,
  }: QueryParams = req.query;

  const skip = (page - 1) * limit;
  const query: any = {};

  // Add search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Add category filter
  if (category) {
    query.category = category;
  }

  // Add active filter
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Get total count
  const total = await Product.countDocuments(query);

  // Get products
  const sortOrder = order === "ASC" ? 1 : -1;
  const products = await Product.find(query)
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(limit);

  const pagination: PaginationInfo = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };

  const response: ApiResponse<IProduct[]> = {
    success: true,
    message: "Products retrieved successfully",
    data: products,
    pagination,
  };

  res.json(response);
});

// Get product by ID
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    const response: ApiResponse<IProduct> = {
      success: true,
      message: "Product retrieved successfully",
      data: product,
    };

    res.json(response);
  }
);

// Update product
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateProductRequest = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new CustomError("Product not found", 404);
    }

    // Check for duplicate name if being updated
    if (updateData.name) {
      const duplicateProduct = await Product.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });
      if (duplicateProduct) {
        throw new CustomError("Product with this name already exists", 409);
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    const response: ApiResponse<IProduct> = {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct!,
    };

    res.json(response);
  }
);

// Delete product
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new CustomError("Product not found", 404);
    }

    // Soft delete (set isActive to false)
    await Product.findByIdAndUpdate(id, { isActive: false });

    const response: ApiResponse = {
      success: true,
      message: "Product deleted successfully",
    };

    res.json(response);
  }
);

// Get product categories
export const getProductCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Product.distinct("category", { isActive: true });

    const response: ApiResponse<string[]> = {
      success: true,
      message: "Product categories retrieved successfully",
      data: categories,
    };

    res.json(response);
  }
);

// Get product statistics
export const getProductStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalStock: { $sum: "$stock" },
        },
      },
    ]);

    const response: ApiResponse<any> = {
      success: true,
      message: "Product statistics retrieved successfully",
      data: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalStock: 0,
      },
    };

    res.json(response);
  }
);
