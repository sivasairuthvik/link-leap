import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  await dbConnect();
  const urls = await Url.find().sort({ createdAt: -1 });
  res.status(200).json(urls);
}
