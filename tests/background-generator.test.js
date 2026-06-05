import test from "node:test";
import assert from "node:assert/strict";
import { buildBackgroundDossier } from "../src/background-generator.js";

test("buildBackgroundDossier expands hardware-oriented topics", () => {
  const dossier = buildBackgroundDossier({
    title: "一种用于电池热失控预警的多模态监测装置",
    keywords: "电池，热失控，监测，传感器，多模态",
  });

  assert.equal(dossier.domain, "装置结构 / 硬件系统");
  assert.ok(dossier.searchStrings.patentCn.includes("背景技术"));
  assert.equal(dossier.keywordBreakdown.coreObject, "电池");
  assert.ok(dossier.searchStrings.patentCnWide.includes("电池"));
  assert.ok(dossier.searchSourcePriorities.patents.includes("Google Patents"));
  assert.ok(Array.isArray(dossier.paperEntries));
  assert.ok(Array.isArray(dossier.patentEntries));
  assert.equal(dossier.paperEntries.length, 0);
  assert.equal(dossier.patentEntries.length, 0);
  assert.ok(dossier.dossierMarkdown.includes("未内置可核验论文条目"));
  assert.ok(dossier.dossierMarkdown.includes("## 拆题结果"));
});

test("buildBackgroundDossier returns source-backed entries for ticket NLP topics", () => {
  const dossier = buildBackgroundDossier({
    title: "基于bert-base-chinese模型的公共服务热线工单识别方法和系统",
    keywords: "bert-base-chinese，公共服务热线，工单识别",
  });

  assert.equal(dossier.domain, "自然语言处理 / 公共服务热线工单识别");
  assert.ok(dossier.paperEntries.length > 0);
  assert.ok(dossier.patentEntries.length > 0);
  assert.ok(dossier.paperEntries.every((entry) => entry.sourceUrl));
  assert.ok(dossier.patentEntries.every((entry) => entry.sourceUrl && entry.publicationNumber));
  assert.ok(dossier.paperEntries[0].methodSteps.length > 3);
  assert.ok(dossier.patentEntries[0].claimFocus.length > 0);
});
