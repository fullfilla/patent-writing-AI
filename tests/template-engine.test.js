import test from "node:test";
import assert from "node:assert/strict";
import { buildPatentTemplate } from "../src/template-engine.js";

test("buildPatentTemplate leaves editable placeholders", () => {
  const template = buildPatentTemplate({
    title: "一种智能监测系统",
    keywords: "智能监测，传感器，预警",
    patentType: "发明专利",
    leaveBlankMode: true,
    styleProfile: {
      displayName: "测试风格",
      archetype: "标准专利",
      templateMoves: ["先写背景，再写方案。"],
    },
    background: {
      domain: "装置结构 / 硬件系统",
      knownApproaches: ["采用固定结构件组合实现功能。", "通过检测单元与控制单元联动。"],
      painPoints: ["误报率高。", "布线复杂。"],
      focus: "提高监测准确率",
    },
  });

  assert.ok(template.markdown.includes("[请在此填写："));
  assert.ok(template.markdown.includes("权利要求骨架"));
});

test("buildPatentTemplate preserves uploaded custom template structure", () => {
  const template = buildPatentTemplate({
    title: "一种电池热失控预警系统",
    keywords: "电池，热失控，预警",
    patentType: "发明专利",
    leaveBlankMode: false,
    customTemplateName: "battery-template.md",
    customTemplateContent: [
      "# {{TITLE}}",
      "",
      "## 一、技术领域",
      "{{DOMAIN}}",
      "",
      "## 二、权利要求",
      "{{CLAIMS}}",
    ].join("\n"),
    styleProfile: {
      displayName: "测试风格",
      archetype: "标准专利",
      templateMoves: [],
    },
    background: {
      domain: "电池安全监测",
      knownApproaches: ["现有监测方式。", "现有告警方式。"],
      painPoints: ["预警不及时。", "误报率高。"],
      focus: "提前识别风险",
    },
  });

  assert.equal(template.hasCustomTemplate, true);
  assert.equal(template.sourceTemplateName, "battery-template.md");
  assert.ok(template.markdown.includes("# 一种电池热失控预警系统"));
  assert.ok(template.markdown.includes("## 一、技术领域"));
  assert.ok(template.markdown.includes("## 二、权利要求"));
});
