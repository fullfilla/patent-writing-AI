import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBaseUrl, normalizeSettings } from "../src/settings-store.js";

test("normalizeBaseUrl trims chat-completions suffix", () => {
  assert.equal(normalizeBaseUrl("https://api.openai.com/v1/chat/completions"), "https://api.openai.com/v1");
});

test("normalizeSettings provides defaults", () => {
  const settings = normalizeSettings({ apiKey: " sk-test ", baseUrl: "https://api.openai.com" });
  assert.equal(settings.apiKey, "sk-test");
  assert.equal(settings.baseUrl, "https://api.openai.com/v1");
  assert.equal(settings.model, "gpt-4.1-mini");
});
