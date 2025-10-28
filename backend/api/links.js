import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== "GET") return res.status(405).end();
  await dbConnect();
  const urls = await Url.find().sort({ createdAt: -1 });
  res.status(200).json(urls);
}
