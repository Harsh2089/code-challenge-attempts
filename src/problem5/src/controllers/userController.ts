import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import {
  CreateUserRequest,
  UpdateUserRequest,
  QueryParams,
  ApiResponse,
  PaginationInfo,
} from "../types";
import { CustomError, asyncHandler } from "../middleware/errorHandler";
import { generateToken } from "../middleware/auth";

// Create a new user
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    role = "user",
  }: CreateUserRequest = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new CustomError(
      "User with this email or username already exists",
      409
    );
  }

  // Create user (password will be hashed by pre-save middleware)
  const newUser = new User({
    username,
    email,
    password,
    role,
  });

  await newUser.save();

  const response: ApiResponse<IUser> = {
    success: true,
    message: "User created successfully",
    data: newUser,
  };

  res.status(201).json(response);
});

// Get all users with pagination and filtering
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "DESC",
    search,
    isActive,
  }: QueryParams = req.query;

  const skip = (page - 1) * limit;
  const query: any = {};

  // Add search filter
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Add active filter
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Get total count
  const total = await User.countDocuments(query);

  // Get users
  const sortOrder = order === "ASC" ? 1 : -1;
  const users = await User.find(query)
    .select("-password")
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

  const response: ApiResponse<IUser[]> = {
    success: true,
    message: "Users retrieved successfully",
    data: users,
    pagination,
  };

  res.json(response);
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const response: ApiResponse<IUser> = {
    success: true,
    message: "User retrieved successfully",
    data: user,
  };

  res.json(response);
});

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateUserRequest = req.body;

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new CustomError("User not found", 404);
  }

  // Check for duplicate email/username if being updated
  if (updateData.email || updateData.username) {
    const duplicateQuery: any = { _id: { $ne: id } };
    if (updateData.email && updateData.username) {
      duplicateQuery.$or = [
        { email: updateData.email },
        { username: updateData.username },
      ];
    } else if (updateData.email) {
      duplicateQuery.email = updateData.email;
    } else if (updateData.username) {
      duplicateQuery.username = updateData.username;
    }

    const duplicateUser = await User.findOne(duplicateQuery);
    if (duplicateUser) {
      throw new CustomError(
        "User with this email or username already exists",
        409
      );
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  const response: ApiResponse<IUser> = {
    success: true,
    message: "User updated successfully",
    data: updatedUser!,
  };

  res.json(response);
});

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new CustomError("User not found", 404);
  }

  // Soft delete (set isActive to false)
  await User.findByIdAndUpdate(id, { isActive: false });

  const response: ApiResponse = {
    success: true,
    message: "User deleted successfully",
  };

  res.json(response);
});

// User login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError("Invalid credentials", 401);
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  const response: ApiResponse<{ user: IUser; token: string }> = {
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
    },
  };

  res.json(response);
});

// Get current user profile
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const response: ApiResponse<IUser> = {
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    };

    res.json(response);
  }
);
