import { normalizeSettings } from "./settings-store.js";

export function hasConfiguredLlm(settings = {}) {
  return Boolean(settings.apiKey && settings.baseUrl && settings.model);
}

function unwrapChatContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item?.type === "text") {
          return item.text || "";
        }
        return "";
      })
      .join("\n");
  }

  return "";
}

export function stripCodeFences(text = "") {
  return String(text || "")
    .trim()
    .replace(/^```(?:json|markdown|md|text)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function extractJsonObject(text = "") {
  const cleaned = stripCodeFences(text);
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) {
    throw new Error("模型没有返回可解析的 JSON。");
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

export async function createChatCompletion({
  settings,
  systemPrompt,
  userPrompt,
  temperature = 0.3,
}) {
  const normalized = normalizeSettings(settings);
  if (!hasConfiguredLlm(normalized)) {
    throw new Error("大模型设置不完整，请先填写 API Key、Base URL 和模型名。");
  }

  const response = await fetch(`${normalized.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${normalized.apiKey}`,
    },
    body: JSON.stringify({
      model: normalized.model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || `大模型请求失败（${response.status}）`);
  }

  const text = unwrapChatContent(payload?.choices?.[0]?.message?.content);
  if (!text) {
    throw new Error("模型返回为空。");
  }

  return {
    text,
    raw: payload,
    model: normalized.model,
    baseUrl: normalized.baseUrl,
  };
}

export async function createJsonCompletion(options) {
  const result = await createChatCompletion(options);
  return {
    ...result,
    data: extractJsonObject(result.text),
  };
}
