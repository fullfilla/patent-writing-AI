import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWorkspace } from "../src/workspace-store.js";

test("normalizeWorkspace backfills keywords from sourceQuery", () => {
  const workspace = normalizeWorkspace({
    sourceQuery: "电池 热失控 预警",
  });

  assert.equal(workspace.keywords, "电池 热失控 预警");
  assert.equal(workspace.patentType, "发明专利");
});

test("normalizeWorkspace backfills sourceQuery from keywords", () => {
  const workspace = normalizeWorkspace({
    keywords: "图像 分割 模型",
  });

  assert.equal(workspace.sourceQuery, "图像 分割 模型");
});

test("normalizeWorkspace initializes template builder fields", () => {
  const workspace = normalizeWorkspace({});

  assert.equal(workspace.templateBuilderName, "我的可视化模板");
  assert.deepEqual(workspace.templateBuilderModules, []);
});
