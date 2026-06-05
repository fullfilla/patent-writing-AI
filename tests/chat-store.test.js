import test from "node:test";
import assert from "node:assert/strict";
import {
  clearChatState,
  createChatMessage,
  createUploadedFileRecord,
  loadChatState,
  saveChatState,
  summarizeFilesForPrompt,
} from "../src/chat-store.js";

test("createUploadedFileRecord clips oversized content", () => {
  const record = createUploadedFileRecord({
    name: "demo.txt",
    type: "text/plain",
    size: 50000,
    content: "a".repeat(30000),
  });

  assert.equal(record.content.length, 24000);
  assert.equal(record.name, "demo.txt");
});

test("summarizeFilesForPrompt includes file name", () => {
  const summary = summarizeFilesForPrompt([
    createUploadedFileRecord({
      name: "idea.md",
      type: "text/markdown",
      size: 10,
      content: "这是一个构思。",
    }),
  ]);

  assert.match(summary, /idea\.md/);
  assert.match(summary, /这是一个构思/);
});

test("clearChatState resets both messages and files", async () => {
  const userId = "chat-store-test-user";

  await saveChatState({
    messages: [createChatMessage({ role: "user", content: "test message" })],
    files: [
      createUploadedFileRecord({
        name: "notes.txt",
        type: "text/plain",
        size: 12,
        content: "hello world",
      }),
    ],
  }, userId);

  const cleared = await clearChatState(userId);
  const reloaded = await loadChatState(userId);

  assert.deepEqual(cleared, { messages: [], files: [] });
  assert.deepEqual(reloaded, { messages: [], files: [] });
});
