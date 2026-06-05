import { normalizeText, splitKeywords } from "./utils.js";

function placeholder(label, leaveBlankMode, fallback = "") {
  const shouldKeepBlank =
    leaveBlankMode && /权利要求|限定|技术特征|核心|实施例|参数|步骤|效果|方案名称/.test(label);
  if (shouldKeepBlank) {
    return `[请在此填写：${label}]`;
  }
  if (fallback) {
    return fallback;
  }
  return `[请在此填写：${label}]`;
}

function buildClaimSkeleton(title, patentType, keywords, leaveBlankMode) {
  const coreKeyword = keywords[0] || "核心技术要素";
  const claimSubject = patentType === "发明方法" ? "一种方法" : "一种装置/系统";
  const claimTarget = claimSubject.replace("一种", "");

  return [
    `1. ${claimSubject}，其特征在于，包括：${placeholder("独立权利要求的必要技术特征", leaveBlankMode, `${coreKeyword}相关的关键模块、步骤或连接关系`)}`,
    `2. 根据权利要求1所述的${claimTarget}，其特征在于：${placeholder("第一层优选限定", leaveBlankMode, "限定关键参数、结构关系或处理顺序")}`,
    `3. 根据权利要求1或2所述的${claimTarget}，其特征在于：${placeholder("第二层优选限定", leaveBlankMode, "补充实现方式、材料、算法或接口条件")}`,
    `4. 根据权利要求1-3任一项所述的${claimTarget}，其特征在于：${placeholder("效果或联动特征", leaveBlankMode, "用于提升稳定性、精度、效率或成本表现的协同设计")}`,
  ].join("\n");
}

function createTemplateVariables({
  title,
  patentType,
  parsedKeywords,
  styleProfile,
  background,
  leaveBlankMode,
}) {
  const resolvedTitle = title || placeholder("发明名称", true);
  const keywordText = parsedKeywords.length ? parsedKeywords.join("、") : placeholder("关键词", true);
  const coreKeyword = parsedKeywords[0] || "目标技术";

  return {
    TITLE: resolvedTitle,
    PATENT_TITLE: resolvedTitle,
    KEYWORDS: keywordText,
    PATENT_TYPE: patentType || "发明专利",
    DOMAIN: background?.domain || placeholder("技术领域", leaveBlankMode, `${coreKeyword}相关技术领域`),
    FOCUS: background?.focus || placeholder("应用焦点", leaveBlankMode, "目标应用场景与核心诉求"),
    PAIN_POINT_1: background?.painPoints?.[0] || placeholder("核心痛点", leaveBlankMode, "现有方案的主要缺陷"),
    PAIN_POINT_2: background?.painPoints?.[1] || placeholder("补充痛点", leaveBlankMode, "现有方案的次要缺陷"),
    STYLE_NAME: styleProfile?.displayName || "默认专利风格",
    STYLE_ARCHETYPE: styleProfile?.archetype || "标准说明书结构",
    CLAIMS: buildClaimSkeleton(resolvedTitle, patentType, parsedKeywords, leaveBlankMode),
  };
}

function replaceTemplateTokens(text = "", variables = {}) {
  return Object.entries(variables).reduce((result, [key, value]) => {
    const safeValue = String(value ?? "");
    return result
      .replaceAll(`{{${key}}}`, safeValue)
      .replaceAll(`[[${key}]]`, safeValue)
      .replaceAll(`<<${key}>>`, safeValue);
  }, text);
}

function buildDefaultTemplate({
  title = "",
  patentType = "发明专利",
  styleProfile,
  background,
  leaveBlankMode = true,
  parsedKeywords = [],
}) {
  const resolvedTitle = title || placeholder("发明名称", true);
  const coreKeyword = parsedKeywords[0] || "目标技术";
  const blankField = (label, fallback = "") => placeholder(label, leaveBlankMode, fallback);

  return [
    `# ${resolvedTitle}`,
    ``,
    `## 1. 技术领域`,
    `本申请涉及${blankField("所属技术领域", `${background.domain}相关技术领域`)}，尤其涉及${blankField("具体对象/方法/系统名称", `${coreKeyword}的实现方案`)}。`,
    ``,
    `## 2. 背景技术`,
    `现有技术中，${blankField("行业现状描述", background.knownApproaches?.[0])}。`,
    `进一步地，${blankField("第二层现有技术说明", background.knownApproaches?.[1])}。`,
    `然而，上述方案至少存在以下问题：${blankField("核心痛点", background.painPoints?.[0])}；并且${blankField("补充痛点", background.painPoints?.[1])}。`,
    ``,
    `## 3. 发明内容`,
    `### 3.1 要解决的技术问题`,
    `本申请旨在解决${blankField("技术问题", background.painPoints?.[0])}的问题。`,
    ``,
    `### 3.2 技术方案`,
    `为实现上述目的，提出一种${blankField("方案名称", `${coreKeyword}方案`)}，包括：`,
    `- ${blankField("技术特征 A", "输入侧的关键部件、数据或环境条件")}`,
    `- ${blankField("技术特征 B", "处理侧的核心动作、模块或算法流程")}`,
    `- ${blankField("技术特征 C", "输出侧的结果、联动机制或控制反馈")}`,
    ``,
    `### 3.3 有益效果`,
    `与现有技术相比，本申请至少具有如下有益效果：${blankField("效果 1", "提高稳定性、精度或响应效率")}；${blankField("效果 2", "降低误差、成本或维护复杂度")}。`,
    ``,
    `## 4. 附图说明`,
    `图1为${blankField("系统总体结构图", `${resolvedTitle}的整体架构示意图`)}。`,
    `图2为${blankField("流程图或局部结构图", "关键模块、步骤或部件连接关系示意图")}。`,
    ``,
    `## 5. 具体实施方式`,
    `### 实施例1`,
    `${blankField("实施例总体说明", "交代输入条件、关键结构/步骤以及输出结果")}`,
    `${blankField("实施例细节 1", "补充参数、阈值、连接关系或时序")}`,
    `${blankField("实施例细节 2", "说明可选替代方案、优选方案或容错分支")}`,
    ``,
    `### 实施例2`,
    `${blankField("变体实施例", "围绕不同场景、不同材料、不同算法或不同结构布局展开")}`,
    ``,
    `## 6. 权利要求骨架`,
    buildClaimSkeleton(resolvedTitle, patentType, parsedKeywords, leaveBlankMode),
    ``,
    `## 7. 摘要草稿`,
    `本申请公开了一种${blankField("发明名称摘要版", `${coreKeyword}方案`)}，涉及${blankField("领域摘要版", background.domain)}。通过${blankField("核心技术特征摘要", "输入、处理、输出三段式技术设计")}，解决了${blankField("摘要中的问题陈述", background.painPoints?.[0])}的问题，实现了${blankField("摘要中的效果", "性能提升、结构优化或流程改进")}。`,
  ].join("\n");
}

function buildCustomTemplate({
  customTemplateName = "",
  customTemplateContent = "",
  variables,
}) {
  const normalizedTemplate = normalizeText(customTemplateContent);
  if (!normalizedTemplate) {
    return null;
  }

  return {
    templateName: customTemplateName || "自定义模板",
    markdown: replaceTemplateTokens(normalizedTemplate, variables),
  };
}

export function buildPatentTemplate({
  title = "",
  keywords = "",
  patentType = "发明专利",
  styleProfile,
  background,
  leaveBlankMode = true,
  customTemplateName = "",
  customTemplateContent = "",
}) {
  const parsedKeywords = splitKeywords(keywords);
  const resolvedTitle = title || placeholder("发明名称", true);
  const variables = createTemplateVariables({
    title,
    patentType,
    parsedKeywords,
    styleProfile,
    background,
    leaveBlankMode,
  });
  const customTemplate = buildCustomTemplate({
    customTemplateName,
    customTemplateContent,
    variables,
  });

  const markdown =
    customTemplate?.markdown ||
    buildDefaultTemplate({
      title,
      patentType,
      styleProfile,
      background,
      leaveBlankMode,
      parsedKeywords,
    });

  return {
    patentType,
    title: resolvedTitle,
    styleProfileName: styleProfile.displayName,
    styleAdvice: styleProfile.templateMoves,
    draftingChecklist: customTemplate
      ? [
          "当前已启用上传模板，生成时应优先保留模板原有章节顺序、标题编号和段落结构。",
          "如果模板里已经写了固定标题或固定提示语，不要随意改名或删段。",
          "如果信息不足，应保留模板中的占位提示，而不是擅自压缩结构。",
        ]
      : [
          "标题、技术领域、独立权利要求中的核心名词必须统一。",
          "背景技术只能客观描述现有技术，不要提前泄露你的方案细节。",
          "每个有益效果都尽量在实施例里找到对应证据，不要空飘。",
          "如果准备交给专利代理师继续细化，最好把图号、部件名、参数表一并补齐。",
        ],
    markdown,
    hasCustomTemplate: Boolean(customTemplate),
    sourceTemplateName: customTemplate?.templateName || "",
  };
}
