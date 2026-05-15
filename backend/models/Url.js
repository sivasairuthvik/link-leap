import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
  clickDetails: [
    {
      timestamp: { type: Date, default: Date.now },
      userAgent: String,
      referer: String,
      // store a pseudonymized IP hash when enabled (ipHash), do not keep raw IPs
      ipHash: String,
    },
  ],
  expiryDate: { type: Date },
});

export default mongoose.models.Url || mongoose.model("Url", UrlSchema);
