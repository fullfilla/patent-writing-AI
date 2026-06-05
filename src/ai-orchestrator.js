import { createChatCompletion, createJsonCompletion, hasConfiguredLlm } from "./llm-client.js";

function uniq(items = [], limit = 6) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, limit);
}

function pickValue(primary, fallback = "") {
  const text = String(primary ?? "").trim();
  return text || String(fallback ?? "").trim();
}

function normalizeSourceEntries(entries = [], fallbackEntries = [], type = "paper") {
  const rawEntries = Array.isArray(entries) && entries.length ? entries : fallbackEntries;
  return (Array.isArray(rawEntries) ? rawEntries : [])
    .map((entry) => {
      const sourceUrl = pickValue(entry?.sourceUrl || entry?.link || entry?.url, "");
      const publicationNumber = pickValue(entry?.publicationNumber || entry?.publicNumber, "");
      const normalized = {
        title: pickValue(entry?.title, ""),
        sourceUrl,
        relevance: pickValue(entry?.relevance || entry?.relevanceNote, ""),
        innovationPoints: uniq(entry?.innovationPoints || [], 4),
        methodSteps: uniq(entry?.methodSteps || entry?.steps || [], 8),
      };

      if (type === "paper") {
        return {
          ...normalized,
          source: pickValue(entry?.source || entry?.venue || entry?.journal, ""),
          year: pickValue(entry?.year, ""),
          doi: pickValue(entry?.doi || entry?.DOI, ""),
        };
      }

      return {
        ...normalized,
        publicationNumber,
        applicant: pickValue(entry?.applicant || entry?.assignee, ""),
        publicationDate: pickValue(entry?.publicationDate || entry?.date, ""),
        claimFocus: uniq(entry?.claimFocus || [], 5),
      };
    })
    .filter((entry) => {
      if (!entry.title) return false;
      if (type === "paper") return Boolean(entry.sourceUrl || entry.doi);
      return Boolean(entry.sourceUrl || entry.publicationNumber);
    })
    .slice(0, 8);
}

const PROFESSIONAL_HUMANIZER_RULES = [
  "保持专业、具体、自然，不要写成宣传稿或空泛总结。",
  "该写的技术内容不能省，尤其是对象、步骤、条件、模块关系和约束词。",
  "优先使用专业术语，不要为了口语化把术语换成模糊说法。",
  "少用“此外、值得注意的是、这不仅……而且……”这类模板腔连接句。",
  "不要夸张拔高，不要写假大空结论；直接落到技术事实、检索动作和可复用表达。",
].join("\n");

function withFallbackMeta(payload, warning = "") {
  return {
    ...payload,
    generationMode: "rule-based",
    generationModeLabel: warning ? `本地规则（LLM 调用失败：${warning}）` : "本地规则",
  };
}

export async function enhanceStyleProfile({
  profile,
  agentName,
  masterName,
  rawText,
  notes,
  settings,
}) {
  if (!hasConfiguredLlm(settings)) {
    return withFallbackMeta(profile);
  }

  try {
    const { data, model } = await createJsonCompletion({
      settings,
      temperature: 0.2,
      systemPrompt: "你是资深中文专利代理写作分析师。请根据给定样本总结写作风格，并严格输出 JSON。",
      userPrompt: [
        "请分析下面的专利写作样本，并输出 JSON：",
        "{",
        '  "archetype": "一句中文风格名称",',
        '  "toneSummary": "一句中文总结",',
        '  "signaturePhrases": ["高频表达1", "高频表达2"],',
        '  "writingHabits": ["习惯1", "习惯2", "习惯3"],',
        '  "templateMoves": ["迁移动作1", "迁移动作2", "迁移动作3"],',
        '  "sampleCountHint": "一句样本数量建议"',
        "}",
        "",
        `候选代理师：${agentName || "未提供"}`,
        `样本名称：${masterName || "未提供"}`,
        `补充备注：${notes || "无"}`,
        "样本文本：",
        rawText || profile.rawExcerptPreview,
      ].join("\n"),
    });

    return {
      ...profile,
      archetype: data.archetype || profile.archetype,
      toneSummary: data.toneSummary || profile.toneSummary,
      signaturePhrases: uniq([...(data.signaturePhrases || []), ...(profile.signaturePhrases || [])], 8),
      writingHabits: uniq(data.writingHabits || profile.writingHabits, 6),
      templateMoves: uniq(data.templateMoves || profile.templateMoves, 6),
      sampleCountHint: data.sampleCountHint || profile.sampleCountHint,
      generationMode: "llm",
      generationModeLabel: `LLM：${model}`,
    };
  } catch (error) {
    return withFallbackMeta(profile, error.message);
  }
}

export async function enhanceBackgroundDossier({
  background,
  title,
  keywords,
  focus,
  painPoints,
  settings,
}) {
  if (!hasConfiguredLlm(settings)) {
    return withFallbackMeta(background);
  }

  try {
    const { data, model } = await createJsonCompletion({
      settings,
      temperature: 0.3,
      systemPrompt: [
        "你是中文专利代理检索助手兼说明书背景整理助手。",
        "你要按“先拆题、再扩词、再分论文/专利检索路线、再整理背景资料”的工作流输出。",
        "输出必须专业、具体、自然，不要有 AI 套话。",
        PROFESSIONAL_HUMANIZER_RULES,
        "严格输出 JSON。",
      ].join("\n"),
      userPrompt: [
        "请根据主题整理背景技术资料包，并输出 JSON：",
        "{",
        '  "domain": "技术方向",',
        '  "focus": "一句应用焦点",',
        '  "knownApproaches": ["常见路线1", "常见路线2", "常见路线3"],',
        '  "commonPracticeFlow": {',
        '    "headline": "这个领域通常怎么做",',
        '    "summary": "一句话总结通常流程",',
        '    "explanation": "这部分在干什么",',
        '    "steps": [',
        '      { "title": "输入准备", "detail": "先做什么" },',
        '      { "title": "关键处理", "detail": "再做什么" },',
        '      { "title": "核心执行", "detail": "然后做什么" },',
        '      { "title": "结果校正", "detail": "最后怎么闭环" }',
        "    ],",
        '    "closing": "这条流程通常落点在哪里"',
        "  },",
        '  "painPoints": ["痛点1", "痛点2", "痛点3"],',
        '  "keywordBreakdown": {',
        '    "coreObject": "研究对象",',
        '    "coreMethod": "核心方法",',
        '    "applicationScenario": "应用场景",',
        '    "constraints": ["约束词1", "约束词2"],',
        '    "decompositionSummary": "一句拆题总结"',
        "  },",
        '  "expandedKeywords": {',
        '    "zh": ["中文词1", "中文词2"],',
        '    "en": ["english term 1", "english term 2"]',
        "  },",
        '  "searchStrings": {',
        '    "patentCn": "中文专利检索式",',
        '    "patentGlobal": "国际专利检索式",',
        '    "paper": "论文检索式",',
        '    "patentCnWide": "中文宽检索式",',
        '    "patentCnNarrow": "中文窄检索式",',
        '    "paperWide": "英文宽检索式",',
        '    "paperNarrow": "英文窄检索式",',
        '    "ipcHints": ["分类号1", "分类号2"]',
        "  },",
        '  "sourceChecklist": ["后续检索建议1", "后续检索建议2", "后续检索建议3"],',
        '  "searchSourcePriorities": {',
        '    "patents": ["专利来源1", "专利来源2"],',
        '    "papers": ["论文来源1", "论文来源2"]',
        "  },",
        '  "paperEntries": [',
        '    {',
        '      "title": "真实论文标题",',
        '      "source": "期刊/会议/来源",',
        '      "year": "年份",',
        '      "doi": "DOI，没有则留空",',
        '      "sourceUrl": "可打开的来源链接",',
        '      "relevance": "为什么与本题相关",',
        '      "innovationPoints": ["该论文自己的创新点1", "该论文自己的创新点2"],',
        '      "methodSteps": ["该论文步骤1", "该论文步骤2", "该论文步骤3"]',
        "    }",
        "  ],",
        '  "patentEntries": [',
        '    {',
        '      "title": "真实专利标题",',
        '      "publicationNumber": "公开号/授权号",',
        '      "applicant": "申请人/专利权人",',
        '      "publicationDate": "公开日/授权公告日",',
        '      "sourceUrl": "可打开的专利链接",',
        '      "relevance": "为什么与本题相关",',
        '      "innovationPoints": ["该专利自己的创新点1", "该专利自己的创新点2"],',
        '      "methodSteps": ["该专利步骤1", "该专利步骤2", "该专利步骤3"],',
        '      "claimFocus": ["权利要求焦点1", "权利要求焦点2"]',
        "    }",
        "  ],",
        '  "dossierMarkdown": "完整 markdown 文本"',
        "}",
        "",
        "要求：",
        "1. 先把题目拆成研究对象、核心方法、应用场景、约束条件。",
        "2. 参照专利检索与论文检索的常规工作流，给出中英文扩词和宽/窄检索式。",
        "3. Common Practice 必须写成通用流程总结，不要再重复论文路线标题。",
        "4. 论文和专利必须分开考虑，专利侧强调方法流程和对应权利，论文侧强调方法和创新点。",
        "5. paperEntries 和 patentEntries 只能放你能给出标题、来源链接、关键字段的真实条目；不能确认真实来源时留空数组，不要编造具体论文、专利、公开号或链接。",
        "6. 每个 paperEntries/patentEntries 的 methodSteps 必须根据该条目的技术路线单独总结，不能所有条目复用同一组步骤。",
        "7. 对每个条目写清楚 relevance 和 innovationPoints；如果与本题只是相邻技术，要明确写“中”或“中高”相关及差异。",
        "8. dossierMarkdown 必须包含：检索主题、实际关键词、真实论文结果、真实专利结果、观察与建议；没有真实条目时要明确写“待核验”，不能伪装已检索完成。",
        "9. 文字要像专业代理人或检索人员写的工作底稿，不要口号化。",
        "",
        `题目：${title || "未提供"}`,
        `关键词：${keywords || "未提供"}`,
        `应用焦点：${focus || "未提供"}`,
        `已知痛点：${painPoints || "未提供"}`,
        "",
        "已有草稿：",
        background.dossierMarkdown,
      ].join("\n"),
    });

    return {
      ...background,
      domain: data.domain || background.domain,
      focus: data.focus || background.focus,
      knownApproaches: uniq(data.knownApproaches || background.knownApproaches, 6),
      commonPracticeFlow: {
        headline: pickValue(data.commonPracticeFlow?.headline, background.commonPracticeFlow?.headline),
        summary: pickValue(data.commonPracticeFlow?.summary, background.commonPracticeFlow?.summary),
        explanation: pickValue(data.commonPracticeFlow?.explanation, background.commonPracticeFlow?.explanation),
        steps: (Array.isArray(data.commonPracticeFlow?.steps) && data.commonPracticeFlow.steps.length
          ? data.commonPracticeFlow.steps
          : background.commonPracticeFlow?.steps || []
        )
          .map((step) => ({
            title: pickValue(step?.title, ""),
            detail: pickValue(step?.detail || step?.content, ""),
          }))
          .filter((step) => step.title || step.detail),
        closing: pickValue(data.commonPracticeFlow?.closing, background.commonPracticeFlow?.closing),
      },
      painPoints: uniq(data.painPoints || background.painPoints, 6),
      sourceChecklist: uniq(data.sourceChecklist || background.sourceChecklist, 6),
      keywordBreakdown: {
        coreObject: pickValue(data.keywordBreakdown?.coreObject, background.keywordBreakdown?.coreObject),
        coreMethod: pickValue(data.keywordBreakdown?.coreMethod, background.keywordBreakdown?.coreMethod),
        applicationScenario: pickValue(
          data.keywordBreakdown?.applicationScenario,
          background.keywordBreakdown?.applicationScenario,
        ),
        constraints: uniq(data.keywordBreakdown?.constraints || background.keywordBreakdown?.constraints || [], 6),
        decompositionSummary: pickValue(
          data.keywordBreakdown?.decompositionSummary,
          background.keywordBreakdown?.decompositionSummary,
        ),
      },
      expandedKeywords: {
        zh: uniq(data.expandedKeywords?.zh || background.expandedKeywords?.zh || [], 12),
        en: uniq(data.expandedKeywords?.en || background.expandedKeywords?.en || [], 12),
      },
      searchStrings: {
        patentCn: pickValue(data.searchStrings?.patentCn, background.searchStrings?.patentCn),
        patentGlobal: pickValue(data.searchStrings?.patentGlobal, background.searchStrings?.patentGlobal),
        paper: pickValue(data.searchStrings?.paper, background.searchStrings?.paper),
        patentCnWide: pickValue(data.searchStrings?.patentCnWide, background.searchStrings?.patentCnWide),
        patentCnNarrow: pickValue(data.searchStrings?.patentCnNarrow, background.searchStrings?.patentCnNarrow),
        paperWide: pickValue(data.searchStrings?.paperWide, background.searchStrings?.paperWide),
        paperNarrow: pickValue(data.searchStrings?.paperNarrow, background.searchStrings?.paperNarrow),
        ipcHints: uniq(data.searchStrings?.ipcHints || background.searchStrings?.ipcHints || [], 8),
      },
      searchSourcePriorities: {
        patents: uniq(data.searchSourcePriorities?.patents || background.searchSourcePriorities?.patents || [], 8),
        papers: uniq(data.searchSourcePriorities?.papers || background.searchSourcePriorities?.papers || [], 8),
      },
      paperEntries: normalizeSourceEntries(data.paperEntries, background.paperEntries, "paper"),
      patentEntries: normalizeSourceEntries(data.patentEntries, background.patentEntries, "patent"),
      dossierMarkdown: data.dossierMarkdown || background.dossierMarkdown,
      generationMode: "llm",
      generationModeLabel: `LLM：${model}`,
    };
  } catch (error) {
    return withFallbackMeta(background, error.message);
  }
}

export async function enhancePatentTemplate({
  template,
  styleProfile,
  background,
  title,
  keywords,
  patentType,
  customTemplateName,
  settings,
}) {
  if (!hasConfiguredLlm(settings)) {
    return {
      ...template,
      generationMode: "rule-based",
      generationModeLabel: template.hasCustomTemplate
        ? "本地规则（已保留上传模板结构，未启用 LLM 润色）"
        : "本地规则",
    };
  }

  try {
    const strictTemplateRules = template.hasCustomTemplate
      ? [
          `当前存在用户上传模板：${customTemplateName || template.sourceTemplateName || "自定义模板"}`,
          "你必须严格保留模板中的章节顺序、标题文字、编号、项目符号和段落层级。",
          "不要新增章节，不要删除章节，不要重排章节。",
          "如果模板中已经出现固定提示语、括号说明或占位文本，除非是在该位置补正文，否则不要改格式。",
          "如果某一段信息不足，请保留模板中的占位提示，不要擅自缩短结构。",
        ].join("\n")
      : "请把题目、技术领域、背景、发明目的、摘要和通用说明尽量写成可直接使用的专利底稿；只在真正需要用户补充创新细节、具体步骤、参数、模型结构或权利要求限定的位置保留占位。";

    const { text, model } = await createChatCompletion({
      settings,
      temperature: 0.35,
      systemPrompt: [
        "你是资深中文专利代理写作助手。",
        PROFESSIONAL_HUMANIZER_RULES,
        "请只输出最终 markdown 正文，不要解释，不要额外附注。",
      ].join("\n"),
      userPrompt: [
        `题目：${title || "未提供"}`,
        `关键词：${keywords || "未提供"}`,
        `专利类型：${patentType || "发明专利"}`,
        `风格画像：${styleProfile.displayName} / ${styleProfile.archetype}`,
        `风格总结：${styleProfile.toneSummary}`,
        `风格习惯：${(styleProfile.writingHabits || []).join("；")}`,
        `背景方向：${background.domain}`,
        `背景焦点：${background.focus}`,
        "",
        strictTemplateRules,
        "",
        "请以下面的模板草稿为唯一骨架来生成最终结果：",
        template.markdown,
      ].join("\n"),
    });

    return {
      ...template,
      markdown: text.trim(),
      generationMode: "llm",
      generationModeLabel: `LLM：${model}`,
    };
  } catch (error) {
    return {
      ...template,
      generationMode: "rule-based",
      generationModeLabel: template.hasCustomTemplate
        ? `本地规则（已保留上传模板结构；LLM 调用失败：${error.message}）`
        : `本地规则（LLM 调用失败：${error.message}）`,
    };
  }
}
