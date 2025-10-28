import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("[dbConnect] MONGO_URI not set. Add it to environment variables (Vercel).");
}

const dbConnect = async () => {
  if (!MONGO_URI) {
    // Skip connecting when MONGO_URI is not provided so local dev can run without a DB.
    // API operations that require the DB will fail until a valid MONGO_URI is set.
    return;
  }

  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI, {
    // options left empty for modern mongoose defaults
  });
};

export default dbConnect;
