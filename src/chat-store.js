import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDir = path.join(__dirname, "..", ".local");
const chatStateDir = path.join(localDir, "chats");

function getChatStatePath(userId = "default") {
  return path.join(chatStateDir, `${userId}.json`);
}

function createEmptyChatState() {
  return {
    messages: [],
    files: [],
  };
}

function clipText(text = "", maxLength = 24000) {
  return String(text || "").slice(0, maxLength);
}

export async function loadChatState(userId = "default") {
  try {
    const raw = await readFile(getChatStatePath(userId), "utf8");
    const state = JSON.parse(raw);
    return {
      messages: Array.isArray(state.messages) ? state.messages : [],
      files: Array.isArray(state.files) ? state.files : [],
    };
  } catch {
    return createEmptyChatState();
  }
}

export async function saveChatState(state = createEmptyChatState(), userId = "default") {
  await mkdir(chatStateDir, { recursive: true });
  await writeFile(getChatStatePath(userId), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

export async function clearChatState(userId = "default") {
  return saveChatState(createEmptyChatState(), userId);
}

export function createChatMessage({ role, content, meta = {} }) {
  return {
    id: randomUUID(),
    role,
    content: String(content || "").trim(),
    createdAt: new Date().toISOString(),
    meta,
  };
}

export function createUploadedFileRecord({ name, type, size, content = "", supported = true }) {
  const safeName = String(name || "untitled").trim() || "untitled";
  const text = clipText(content);
  return {
    id: randomUUID(),
    name: safeName,
    type: String(type || "application/octet-stream"),
    size: Number(size || text.length || 0),
    supported,
    uploadedAt: new Date().toISOString(),
    content: text,
    preview: text.slice(0, 1200),
  };
}

export function summarizeFilesForPrompt(files = []) {
  if (!files.length) {
    return "当前没有上传文件。";
  }

  return files
    .map((file, index) => {
      const header = `${index + 1}. ${file.name} (${file.type || "unknown"}, ${file.size} bytes)`;
      if (!file.supported) {
        return `${header}\n该文件目前只记录了文件名和类型，未提取正文。`;
      }
      return `${header}\n${file.content || file.preview || "无可用正文"}`;
    })
    .join("\n\n");
}
