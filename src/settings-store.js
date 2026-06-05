import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsDir = path.join(__dirname, "..", ".local");
const settingsPath = path.join(settingsDir, "app-settings.json");

export const defaultAppSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
};

export function normalizeBaseUrl(value = "") {
  let baseUrl = String(value || "").trim().replace(/\/+$/g, "");
  baseUrl = baseUrl.replace(/\/(chat\/completions|responses)$/i, "");

  if (!baseUrl) {
    return defaultAppSettings.baseUrl;
  }

  if (/^https:\/\/api\.openai\.com$/i.test(baseUrl)) {
    return `${baseUrl}/v1`;
  }

  return baseUrl;
}

export function normalizeSettings(input = {}) {
  return {
    apiKey: String(input.apiKey || "").trim(),
    baseUrl: normalizeBaseUrl(input.baseUrl),
    model: String(input.model || defaultAppSettings.model).trim() || defaultAppSettings.model,
  };
}

export async function loadSettings() {
  try {
    const raw = await readFile(settingsPath, "utf8");
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...defaultAppSettings };
  }
}

export async function saveSettings(input = {}) {
  const settings = normalizeSettings(input);
  await mkdir(settingsDir, { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settings;
}

export function summarizeSettings(settings = {}) {
  const normalized = normalizeSettings(settings);
  const hasApiKey = Boolean(normalized.apiKey);
  return {
    hasApiKey,
    configured: hasApiKey && Boolean(normalized.baseUrl) && Boolean(normalized.model),
    baseUrl: normalized.baseUrl,
    model: normalized.model,
    apiKeyPreview: hasApiKey ? `${normalized.apiKey.slice(0, 4)}...${normalized.apiKey.slice(-4)}` : "",
  };
}
