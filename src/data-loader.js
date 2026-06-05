import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadSampleMasters() {
  const filePath = path.join(__dirname, "..", "data", "sampleMasters.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}
