import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionEnvPath = path.join(backendDir, ".env");
const localEnvPath = path.join(backendDir, ".env.local");

dotenv.config({ path: productionEnvPath });

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}
