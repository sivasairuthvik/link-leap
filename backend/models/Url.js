import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
  expiryDate: { type: Date }
});

export default mongoose.models.Url || mongoose.model("Url", UrlSchema);
