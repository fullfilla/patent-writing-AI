import {
  averageSentenceLength,
  clamp,
  countOccurrences,
  normalizeText,
  scoreToBand,
  slugify,
  toPercent,
  unique,
} from "./utils.js";

const headingMap = [
  { key: "technicalField", label: "技术领域" },
  { key: "background", label: "背景技术" },
  { key: "summary", label: "发明内容" },
  { key: "drawings", label: "附图说明" },
  { key: "embodiment", label: "具体实施方式" },
  { key: "claims", label: "权利要求" },
];

const phraseLibrary = [
  "本发明",
  "本实用新型",
  "进一步地",
  "优选地",
  "具体而言",
  "用于解决",
  "现有技术存在",
  "有益效果",
  "实施例",
  "包括",
  "其中",
  "步骤",
  "模块",
  "装置",
];

function buildSeedText(seedMaster) {
  return seedMaster?.sampleExcerpt || "";
}

function detectSections(text) {
  const found = headingMap
    .map((heading) => {
      const index = text.indexOf(heading.label);
      return index >= 0 ? { ...heading, index } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  return found.map((item, index) => {
    const next = found[index + 1];
    const slice = text.slice(item.index, next ? next.index : undefined).trim();
    return {
      key: item.key,
      label: item.label,
      excerpt: slice.slice(0, 160),
    };
  });
}

function pickSignaturePhrases(text) {
  return unique(
    phraseLibrary
      .filter((phrase) => text.includes(phrase))
      .sort((a, b) => text.split(b).length - text.split(a).length)
      .slice(0, 6),
  );
}

function inferStyleArchetype(scores) {
  if (scores.embodimentScore >= 0.5 && scores.embodimentScore >= scores.problemScore) {
    return {
      name: "实施例充盈型",
      summary: "偏爱把结构、步骤和参数逐层写透，读起来像一份有脚手架的施工图。",
    };
  }
  if (scores.problemScore > 0.7) {
    return {
      name: "问题驱动型",
      summary: "先把现有技术的痛点拎出来，再推解决手段和有益效果，节奏很像答辩陈述。",
    };
  }
  if (scores.structureScore > 0.65) {
    return {
      name: "骨架先行型",
      summary: "章节规范、术语克制，适合当稳定模板的母版。",
    };
  }
  return {
    name: "均衡稳健型",
    summary: "整体结构平衡，没有明显偏科，适合做通用专利底稿。",
  };
}

function buildWritingHabits(scores) {
  const habits = [];

  habits.push(
    scores.structureScore > 0.65
      ? "章节命名规范，适合先搭目录再落细节。"
      : "章节结构相对灵活，后续可补强“背景技术”和“发明内容”的分界线。",
  );
  habits.push(
    scores.problemScore > 0.55
      ? "善于先写现有技术缺陷，再承接技术方案。"
      : "问题导向不算强，生成模板时建议额外补一段现有技术痛点。",
  );
  habits.push(
    scores.claimScore > 0.55
      ? "喜欢使用“包括/其中/连接/用于”等权利要求骨架词。"
      : "偏说明书口吻，生成时需要单独加一版权利要求骨架。",
  );
  habits.push(
    scores.embodimentScore > 0.55
      ? "实施例丰富，适合保留参数、步骤、模块之间的对应关系。"
      : "实施例密度偏低，后续撰写时要主动填充具体执行路径。",
  );

  return habits;
}

function buildTemplateMoves(styleName) {
  const shared = [
    "先写一句技术领域定义，再落到具体对象、方法或系统边界。",
    "背景技术至少保留两层：行业共性做法 + 现有方案短板。",
    "发明内容中要拆成：技术问题、技术方案、有益效果。",
  ];

  if (styleName === "实施例充盈型") {
    return [
      ...shared,
      "每个实施例都保留输入、处理动作、输出结果三件套。",
      "参数、阈值、结构连接关系尽量成对出现，便于后续抽权。",
    ];
  }

  if (styleName === "问题驱动型") {
    return [
      ...shared,
      "每个技术痛点后面都跟一条对应的解决动作，避免空喊目标。",
      "有益效果建议写成“因为什么设计，所以带来什么提升”。",
    ];
  }

  if (styleName === "骨架先行型") {
    return [
      ...shared,
      "标题、段首句、独立权利要求要尽量统一核心名词。",
      "附图说明和实施方式的编号、部件名保持一一对应。",
    ];
  }

  return [
    ...shared,
    "先生成稳定母版，再根据技术方向补方法、装置或系统特有内容。",
    "对于关键术语，全文尽量只保留一个主叫法，避免来回换词。",
  ];
}

export function buildStyleProfile({
  agentName,
  masterName,
  rawText = "",
  notes = "",
  seedMaster = null,
}) {
  const mergedText = normalizeText(
    unique([buildSeedText(seedMaster), rawText, notes].map((item) => normalizeText(item)).filter(Boolean)).join("\n"),
  );
  const safeText =
    mergedText ||
    "技术领域 本发明涉及专利写作辅助领域。背景技术 现有技术存在模板不稳定、背景材料收集分散的问题。发明内容 为解决上述问题，提出一种支持背景资料生成和模板留白的专利写作方案。具体实施方式 通过关键词扩展、风格蒸馏和段落骨架生成模块协同工作。";

  const sections = detectSections(safeText);
  const sectionCoverage = sections.length / headingMap.length;
  const problemScore = clamp(
    countOccurrences(safeText, ["现有技术", "不足", "缺陷", "技术问题", "难以"]) / 12,
    0,
    1,
  );
  const claimScore = clamp(
    countOccurrences(safeText, ["包括", "包含", "其中", "连接", "用于", "模块", "单元"]) / 10,
    0,
    1,
  );
  const embodimentScore = clamp(
    countOccurrences(safeText, ["实施例", "步骤", "优选地", "进一步地", "示例"]) / 5,
    0,
    1,
  );
  const effectScore = clamp(
    countOccurrences(safeText, ["有益效果", "提高", "降低", "改善", "增强"]) / 4,
    0,
    1,
  );
  const structureScore = clamp(sectionCoverage * 0.75 + (claimScore + embodimentScore) * 0.125, 0, 1);
  const averageLength = averageSentenceLength(safeText);

  const archetype = inferStyleArchetype({
    structureScore,
    problemScore,
    claimScore,
    embodimentScore,
  });

  return {
    id: seedMaster?.id || slugify(masterName || agentName || archetype.name),
    displayName: masterName || agentName || seedMaster?.name || archetype.name,
    agentName: agentName || seedMaster?.agentName || "待补充代理师",
    sourceLabel: seedMaster?.sourceLabel || "用户导入/本地样本",
    archetype: archetype.name,
    toneSummary: archetype.summary,
    sampleCountHint: seedMaster?.sampleCountHint || "建议至少导入 3-5 篇同一代理师样本再做正式蒸馏。",
    signaturePhrases: pickSignaturePhrases(safeText),
    writingHabits: buildWritingHabits({
      structureScore,
      problemScore,
      claimScore,
      embodimentScore,
    }),
    sections,
    sectionCoverage: toPercent(sectionCoverage),
    metrics: {
      structure: scoreToBand(structureScore),
      problemOrientation: scoreToBand(problemScore),
      claimSkeleton: scoreToBand(claimScore),
      embodimentDetail: scoreToBand(embodimentScore),
      effectEmphasis: scoreToBand(effectScore),
      averageSentenceLength: `${averageLength} 字/句`,
    },
    templateMoves: buildTemplateMoves(archetype.name),
    rawExcerptPreview: safeText.slice(0, 360),
  };
}
