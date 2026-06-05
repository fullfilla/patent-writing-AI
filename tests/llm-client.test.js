import test from "node:test";
import assert from "node:assert/strict";
import { extractJsonObject, stripCodeFences } from "../src/llm-client.js";

test("stripCodeFences removes markdown fences", () => {
  assert.equal(stripCodeFences("```json\n{\"a\":1}\n```"), "{\"a\":1}");
});

test("extractJsonObject parses fenced JSON text", () => {
  const result = extractJsonObject("```json\n{\"foo\":\"bar\"}\n```");
  assert.deepEqual(result, { foo: "bar" });
});
