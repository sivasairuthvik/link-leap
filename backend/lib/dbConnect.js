import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("[dbConnect] MONGO_URI not set. Add it to environment variables.");
}

const dbConnect = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  // Return existing connection if already connected
  if (mongoose.connection.readyState >= 1) {
    console.log("[dbConnect] Using existing MongoDB connection");
    return;
  }

  try {
    console.log("[dbConnect] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Reduce timeout from 30s to 10s
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log("[dbConnect] MongoDB connected successfully");
  } catch (error) {
    console.error("[dbConnect] MongoDB connection error:", error.message);
    
    // Log more details for debugging
    if (error.name === 'MongooseServerSelectionError') {
      console.error("[dbConnect] Connection timeout - check:");
      console.error("  1. MongoDB Atlas is running");
      console.error("  2. Internet connection is stable");
      console.error("  3. IP address is whitelisted in MongoDB Atlas");
      console.error("  4. MONGO_URI is correct:", MONGO_URI?.substring(0, 50) + "...");
    }
    
    throw error;
  }
};

export default dbConnect;

