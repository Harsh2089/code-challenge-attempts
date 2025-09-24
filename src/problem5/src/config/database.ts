import mongoose from "mongoose";

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const mongoUri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/express-crud-api";

      await mongoose.connect(mongoUri, {
        // Remove deprecated options for newer versions
      });

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        console.error("❌ MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
        this.isConnected = true;
      });

      // Insert sample data if needed
      await this.insertSampleData();
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("📴 MongoDB disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private async insertSampleData(): Promise<void> {
    try {
      const { User } = await import("../models/User");
      const { Product } = await import("../models/Product");

      // Check if admin user exists
      const adminExists = await User.findOne({ email: "admin@example.com" });
      if (!adminExists) {
        const adminUser = new User({
          username: "admin",
          email: "admin@example.com",
          password: "admin123",
          role: "admin",
          isActive: true,
        });
        await adminUser.save();
        console.log("👤 Admin user created");
      }

      // Check if products exist
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        const sampleProducts = [
          {
            name: "Laptop Pro",
            description: "High-performance laptop for professionals",
            price: 1299.99,
            category: "Electronics",
            stock: 50,
          },
          {
            name: "Wireless Headphones",
            description: "Noise-cancelling wireless headphones",
            price: 199.99,
            category: "Electronics",
            stock: 100,
          },
          {
            name: "Coffee Maker",
            description: "Automatic coffee maker with timer",
            price: 89.99,
            category: "Appliances",
            stock: 25,
          },
          {
            name: "Running Shoes",
            description: "Comfortable running shoes for all terrains",
            price: 129.99,
            category: "Sports",
            stock: 75,
          },
          {
            name: "Smart Watch",
            description: "Fitness tracking smart watch",
            price: 299.99,
            category: "Electronics",
            stock: 30,
          },
        ];

        await Product.insertMany(sampleProducts);
        console.log("📦 Sample products created");
      }
    } catch (error) {
      console.error("❌ Error inserting sample data:", error);
    }
  }
}

// Create and export database instance
const database = Database.getInstance();
export default database;
