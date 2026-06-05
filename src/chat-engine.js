import { createChatCompletion, hasConfiguredLlm } from "./llm-client.js";
import { summarizeFilesForPrompt } from "./chat-store.js";

function compactMessages(messages = [], limit = 12) {
  return messages.slice(-limit).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function buildFallbackReply({ message, files }) {
  const fileHint = files.length
    ? `我已经记住你上传的 ${files.length} 个文件，可以继续围绕这些材料帮你整理专利背景、发明点和模板。`
    : "你还没有上传文件，我可以先根据你输入的内容继续分析。";

  return [
    "当前大模型不可用，所以这是一条本地回退回复。",
    fileHint,
    `你刚刚说的是：${message}`,
    "如果你之后在右上角 `API 设置` 里填好 api key、base_url 和模型名，我就可以结合聊天上下文和已上传文件给出更完整的专利写作建议。",
  ].join("\n");
}

function buildFallbackModeLabel(error) {
  const detail = String(error?.message || "").trim();
  return detail ? `本地规则（LLM 调用失败：${detail}）` : "本地规则";
}

export async function generateChatReply({ message, history, files, settings }) {
  if (!hasConfiguredLlm(settings)) {
    return {
      content: buildFallbackReply({ message, files }),
      generationMode: "rule-based",
      generationModeLabel: "本地规则",
    };
  }

  const conversation = compactMessages(history);
  const prompt = [
    "你是一个中文专利写作助手。",
    "你的职责：",
    "1. 根据对话上下文持续记住用户的题目、技术方向、代理师风格偏好和未完成事项。",
    "2. 结合上传文件内容，帮助用户做专利背景整理、技术问题分析、风格蒸馏、模板草拟。",
    "3. 回答尽量直接、可执行，不要泛泛而谈。",
    "",
    "已上传文件：",
    summarizeFilesForPrompt(files),
    "",
    "最近对话：",
    conversation.map((item) => `${item.role === "assistant" ? "助手" : "用户"}：${item.content}`).join("\n\n"),
    "",
    `用户最新消息：${message}`,
  ].join("\n");

  try {
    const result = await createChatCompletion({
      settings,
      temperature: 0.35,
      systemPrompt: "你是专利写作网站内置的长期记忆助手，回答要简洁、专业、偏执行。",
      userPrompt: prompt,
    });

    return {
      content: result.text.trim(),
      generationMode: "llm",
      generationModeLabel: `LLM：${result.model}`,
    };
  } catch (error) {
    return {
      content: buildFallbackReply({ message, files }),
      generationMode: "rule-based",
      generationModeLabel: buildFallbackModeLabel(error),
    };
  }
}
