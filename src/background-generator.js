import { splitKeywords, unique } from "./utils.js";

const PATENT_SOURCE_PRIORITY = ["Google Patents", "Espacenet", "WIPO PATENTSCOPE", "CNIPA", "USPTO"];
const PAPER_SOURCE_PRIORITY = ["Google Scholar", "Semantic Scholar", "Crossref", "期刊官网 / 出版社页面", "CNKI"];

const methodHintPatterns = [
  "监测",
  "预警",
  "检测",
  "识别",
  "控制",
  "分析",
  "预测",
  "评估",
  "诊断",
  "处理",
  "生成",
  "匹配",
  "分类",
  "派单",
  "路由",
  "制备",
  "制造",
  "加工",
];

const scenarioHintPatterns = [
  "电池",
  "车载",
  "工业",
  "图像",
  "文本",
  "语音",
  "边缘",
  "云端",
  "现场",
  "医疗",
  "生产",
  "仓储",
  "安防",
  "工单",
  "热线",
  "服务热线",
  "公共服务",
  "政务服务",
  "12345",
];

const constraintHintPatterns = [
  "多模态",
  "低成本",
  "实时",
  "在线",
  "高精度",
  "低功耗",
  "轻量",
  "鲁棒",
  "高可靠",
  "高稳定",
  "可解释",
  "分级",
  "协同",
  "自动",
];

const englishTermMap = [
  { match: ["电池"], english: ["battery", "battery pack"] },
  { match: ["热失控"], english: ["thermal runaway"] },
  { match: ["预警"], english: ["early warning", "alert"] },
  { match: ["监测", "检测"], english: ["monitoring", "detection"] },
  { match: ["多模态"], english: ["multimodal", "multi-sensor fusion"] },
  { match: ["传感器"], english: ["sensor"] },
  { match: ["电压"], english: ["voltage"] },
  { match: ["电流"], english: ["current"] },
  { match: ["温度"], english: ["temperature"] },
  { match: ["气体"], english: ["gas sensing", "gas concentration"] },
  { match: ["压力"], english: ["pressure"] },
  { match: ["识别"], english: ["recognition", "identification"] },
  { match: ["分类"], english: ["classification", "categorization"] },
  { match: ["工单"], english: ["work order", "service request", "ticket"] },
  { match: ["热线", "服务热线", "政务热线"], english: ["hotline", "public service hotline"] },
  { match: ["bert", "BERT", "bert-base-chinese"], english: ["BERT", "bert-base-chinese", "pre-trained language model"] },
  { match: ["控制"], english: ["control"] },
  { match: ["工艺"], english: ["process"] },
  { match: ["制备", "制造", "加工"], english: ["fabrication", "manufacturing"] },
];

const domainRules = [
  {
    id: "ticket-nlp",
    match: ["bert", "BERT", "bert-base-chinese", "工单", "热线", "服务热线", "政务热线", "12345", "文本分类", "意图识别", "派单"],
    label: "自然语言处理 / 公共服务热线工单识别",
    paperThemes: [
      "基于 BERT 的中文短文本分类与意图识别方法",
      "面向公共服务热线工单的语义分类与自动派单研究",
      "面向类别不均衡和口语化表达的工单文本识别优化策略",
    ],
    patentThemes: [
      "一种公共服务热线工单自动识别与分类方法",
      "一种基于预训练语言模型的热线工单处理系统",
      "一种带低置信度复核机制的工单派单辅助方法",
    ],
    methodSteps: [
      "汇集热线工单标题、正文、来电描述和历史分类标签并进行文本规范化",
      "采用 bert-base-chinese 或中文预训练语言模型提取工单语义表示",
      "基于分类层、阈值判定或标签映射输出工单类别及置信度",
      "对低置信度、相近类别或异常样本引入人工复核和反馈更新机制",
    ],
    painPoints: [
      "公共服务热线工单多为口语化描述，同义表达和省略表达较多，关键词规则难以稳定覆盖",
      "工单类别边界相近且样本分布不均衡，传统分类器容易在小类和相近诉求上误判",
      "人工阅读和派单成本随工单量上升明显，处理时效和分类一致性难以保证",
      "模型结果若缺少置信度回退或人工复核机制，容易影响后续派单准确性",
    ],
    english: [
      "BERT",
      "bert-base-chinese",
      "Chinese text classification",
      "service request classification",
      "work order classification",
      "ticket routing",
      "intent recognition",
      "short text classification",
      "class imbalance",
    ],
    ipcHints: ["G06F40/30", "G06F16/35", "G06N20/00"],
  },
  {
    id: "ai",
    match: ["模型", "算法", "识别", "预测", "数据", "神经网络", "视觉", "大模型", "bert"],
    label: "智能算法 / 数据处理",
    paperThemes: [
      "基于深度语义编码的任务识别方法",
      "结合多源特征融合的智能判定流程",
      "面向复杂场景的鲁棒性优化策略",
    ],
    patentThemes: [
      "一种面向业务场景的智能识别方法",
      "一种多模块协同的数据处理系统",
      "一种带有反馈闭环的推理与校正方案",
    ],
    methodSteps: [
      "采集原始数据并进行标准化预处理",
      "提取文本、结构或统计特征形成输入向量",
      "基于训练模型输出识别结果或决策结果",
      "结合规则校验、阈值控制或人工复核进行结果修正",
    ],
    painPoints: [
      "真实业务数据分布波动较大，模型泛化不稳定",
      "识别精度、推理速度和可解释性难以同时兼顾",
      "复杂场景下容易出现误报、漏报或边界样本混淆",
    ],
    english: ["AI", "algorithm", "classification", "inference", "data processing"],
    ipcHints: ["G06N", "G06F", "G06V"],
  },
  {
    id: "hardware",
    match: ["装置", "传感器", "结构", "模块", "机构", "连接", "组件", "电路", "设备"],
    label: "装置结构 / 硬件系统",
    paperThemes: [
      "面向复杂工况的多传感器结构优化",
      "基于模块化装配的设备稳定性提升方法",
      "结合检测回路与执行部件的协同控制结构",
    ],
    patentThemes: [
      "一种多部件联动的监测装置",
      "一种低成本高稳定性的硬件模块结构",
      "一种适用于现场部署的装配连接方案",
    ],
    methodSteps: [
      "布置核心传感或检测部件",
      "建立采集单元与控制单元之间的连接关系",
      "根据检测结果驱动执行机构或输出告警结果",
      "通过结构优化降低误差、体积或维护成本",
    ],
    painPoints: [
      "结构件较多，装配维护成本高",
      "关键部件之间的协同关系不清晰，稳定性不足",
      "体积、功耗、可靠性和成本之间难以平衡",
    ],
    english: ["device", "sensor", "module", "hardware", "circuit"],
    ipcHints: ["H01", "H02", "G01", "F16"],
  },
  {
    id: "manufacturing",
    match: ["工艺", "制备", "制造", "加工", "流程", "产线", "焊接", "组装"],
    label: "制造工艺 / 生产流程",
    paperThemes: [
      "关键工艺参数协同优化方法",
      "在线检测驱动的工艺闭环控制流程",
      "面向稳定量产的多步骤加工策略",
    ],
    patentThemes: [
      "一种多工位协同的生产方法",
      "一种提升良率的工艺控制系统",
      "一种在线检测与纠偏一体化工艺方案",
    ],
    methodSteps: [
      "准备原材料并执行预处理",
      "按照既定工序完成成型、组装或加工",
      "在关键节点执行在线检测与参数修正",
      "输出成品并记录质量数据形成闭环",
    ],
    painPoints: [
      "工艺窗口窄，对参数波动敏感",
      "人工依赖较高，批次一致性不足",
      "效率、良率和成本目标经常互相牵制",
    ],
    english: ["process", "manufacturing", "fabrication", "assembly line"],
    ipcHints: ["B23", "B29", "C23"],
  },
];

function inferDomain(title, keywords) {
  const merged = [title, ...keywords].join(" ");
  const mergedLower = merged.toLowerCase();
  return (
    domainRules.find((rule) =>
      rule.match.some((pattern) => {
        const normalizedPattern = String(pattern || "");
        return merged.includes(normalizedPattern) || mergedLower.includes(normalizedPattern.toLowerCase());
      }),
    ) || domainRules[0]
  );
}

function pickFirstMatching(items = [], patterns = []) {
  return items.find((item) => patterns.some((pattern) => item.includes(pattern))) || "";
}

function extractScenarioFromTitle(title = "") {
  const match = title.match(/(?:用于|面向|针对)([^，。；;]{2,28}?)(?:的|场景|过程|流程|方法|装置|系统)/);
  return match?.[1]?.trim() || "";
}

function extractObjectFromTitle(title = "") {
  const cleanTitle = String(title || "").replace(/^一种/, "").trim();
  const match = cleanTitle.match(/^([^，。；;]{2,24}?)(?:方法|装置|系统|设备|工艺|流程)/);
  return match?.[1]?.trim() || "";
}

function buildKeywordBreakdown(title, keywords, domain) {
  const candidates = unique([title, ...keywords]).filter(Boolean);

  if (domain.id === "ticket-nlp") {
    const constraints = unique(candidates.filter((item) => constraintHintPatterns.some((pattern) => item.includes(pattern))));
    const coreMethod = /bert-base-chinese|bert/i.test([title, ...keywords].join(" "))
      ? "bert-base-chinese语义识别与中文文本分类"
      : "中文预训练语言模型语义识别";

    return {
      coreObject: "公共服务热线工单文本",
      coreMethod,
      applicationScenario: "公共服务热线工单分类、自动派单和低置信度复核",
      constraints,
      decompositionSummary: [
        "研究对象是公共服务热线产生的工单文本，而不是泛泛的数据处理对象",
        `核心方法落在“${coreMethod}”，需要重点比较 BERT、中文短文本分类、意图识别和工单路由资料`,
        "应用场景是工单分类、派单辅助和人工复核闭环，背景资料应优先覆盖热线工单、政务服务工单和客服工单方向",
        constraints.length ? `题目里还带有 ${constraints.join("、")} 这类约束词` : "题目里没有明显性能约束词，后续可以补充准确率、召回率、处理时延或人工复核比例",
      ].join("；"),
    };
  }

  const applicationScenario = extractScenarioFromTitle(title) || pickFirstMatching(candidates, scenarioHintPatterns) || domain.label;
  const coreMethod = pickFirstMatching(candidates, methodHintPatterns) || domain.methodSteps[0];
  const coreObject =
    keywords.find((item) => item && !methodHintPatterns.some((pattern) => item.includes(pattern))) ||
    extractObjectFromTitle(title) ||
    candidates[0] ||
    domain.label;
  const constraints = unique(candidates.filter((item) => constraintHintPatterns.some((pattern) => item.includes(pattern))));

  return {
    coreObject,
    coreMethod,
    applicationScenario,
    constraints,
    decompositionSummary: [
      `研究对象偏向“${coreObject}”`,
      `核心动作偏向“${coreMethod}”`,
      `应用场景落在“${applicationScenario}”`,
      constraints.length ? `题目里还带了 ${constraints.join("、")} 这类约束词` : "题目里没有明显约束词，建议后续继续补性能目标或部署约束",
    ].join("；"),
  };
}

function mapEnglishTerms(terms = [], domain) {
  return unique([
    ...domain.english,
    ...terms.flatMap((term) =>
      englishTermMap
        .filter((entry) => entry.match.some((pattern) => String(term || "").includes(pattern)))
        .flatMap((entry) => entry.english),
    ),
  ]);
}

function expandKeywords(title, keywords, domain, keywordBreakdown) {
  const zh = unique([
    title,
    ...keywords,
    keywordBreakdown.coreObject,
    keywordBreakdown.coreMethod,
    keywordBreakdown.applicationScenario,
    ...keywordBreakdown.constraints,
  ]);
  const en = unique([
    ...mapEnglishTerms(zh, domain),
    ...zh.flatMap((item) => {
      if (item.includes("系统")) return ["system"];
      if (item.includes("方法")) return ["method"];
      if (item.includes("装置")) return ["device"];
      if (item.includes("检测") || item.includes("监测")) return ["detection", "monitoring"];
      return [];
    }),
  ]);

  return { zh, en };
}

function buildSearchStrings(expandedKeywords, domain, keywordBreakdown) {
  const objectTerms = unique([keywordBreakdown.coreObject, keywordBreakdown.applicationScenario].filter(Boolean));
  const methodTerms = unique([keywordBreakdown.coreMethod, ...keywordBreakdown.constraints].filter(Boolean));
  const zhWide = expandedKeywords.zh.slice(0, 6).map((item) => `"${item}"`).join(" OR ");
  const enWide = expandedKeywords.en.slice(0, 8).map((item) => `"${item}"`).join(" OR ");
  const zhNarrow = [
    objectTerms.length ? `(${objectTerms.map((item) => `"${item}"`).join(" OR ")})` : "",
    methodTerms.length ? `(${methodTerms.map((item) => `"${item}"`).join(" OR ")})` : "",
  ]
    .filter(Boolean)
    .join(" AND ");
  const enNarrow = [
    expandedKeywords.en.length ? `(${expandedKeywords.en.slice(0, 5).map((item) => `"${item}"`).join(" OR ")})` : "",
    methodTerms.length
      ? `(${mapEnglishTerms(methodTerms, domain)
          .slice(0, 5)
          .map((item) => `"${item}"`)
          .join(" OR ")})`
      : "",
  ]
    .filter(Boolean)
    .join(" AND ");

  return {
    patentCn: `${zhNarrow || zhWide} AND (专利 OR 专利申请) AND (背景技术 OR 权利要求)`,
    patentGlobal: `${enNarrow || enWide} AND patent AND claim`,
    paper: `${enNarrow || enWide} AND (paper OR article OR review)`,
    patentCnWide: zhWide || `"${keywordBreakdown.coreObject}"`,
    patentCnNarrow: zhNarrow || zhWide,
    paperWide: enWide || `"${keywordBreakdown.coreObject}"`,
    paperNarrow: enNarrow || enWide,
    ipcHints: domain.ipcHints,
  };
}

function buildKnownApproaches(title, keywords, domain) {
  const merged = [title, ...keywords].join(" ");
  const approaches = [];
  if (merged.includes("温度") || merged.includes("热失控")) {
    approaches.push("单一温度阈值预警");
  }
  if (merged.includes("电压") || merged.includes("电流") || merged.includes("电参") || merged.includes("热参")) {
    approaches.push("电参与热参融合监测");
  }
  if (merged.includes("多模态") || merged.includes("多传感器") || merged.includes("气体") || merged.includes("烟雾") || merged.includes("压力")) {
    approaches.push("多模态协同预警");
  }
  return unique(approaches.length ? approaches : domain.paperThemes);
}

function buildPaperEntries(title, domain) {
  if (domain.id === "ticket-nlp") {
    return [
      {
        title: "基于BERT的民生问题文本分类模型--以浙江省政务热线数据为例",
        source: "北京大学学报（自然科学版）",
        year: "2023",
        sourceUrl: "https://ccj.pku.edu.cn/article/info?id=356712361",
        relevance: "高：直接面向政务热线文本分类，并明确使用 BERT-Base-Chinese。",
        innovationPoints: [
          "将政务热线民生问题构建为多级文本分类任务",
          "使用 BERT-Base-Chinese 获取热线诉求文本语义表示，并通过样本扩充改善分类效果",
        ],
        methodSteps: [
          "收集浙江省政务热线数据并清洗热线诉求文本",
          "构建民生问题三级分类标签体系",
          "将热线文本输入 BERT-Base-Chinese 获取语义表示",
          "在 BERT 输出后接分类层并使用标注样本微调",
          "对待分类热线文本输出民生问题类别，并用扩充样本提升准确率",
        ],
      },
      {
        title: "Government Event Dispatch Approach Based on Deep Multi-view Network",
        source: "计算机科学",
        year: "2024",
        sourceUrl: "https://doaj.org/article/1d04904f36044fd6b9e0c7bc5ca505c0",
        doi: "10.11896/jsjkx.230300034",
        relevance: "高：面向 12345 政务热线事件分拨，使用 BERT 提取标题和描述语义特征。",
        innovationPoints: [
          "把政务热线派单建模为多视图融合问题",
          "融合历史派单图结构特征和 BERT 文本语义特征，提高部门分拨判断能力",
        ],
        methodSteps: [
          "获取 12345 政务热线事件数据和历史派单记录",
          "构建事件类别与派发部门之间的历史关系图",
          "使用自监督加权图卷积网络提取历史派单行为特征",
          "使用政务语料微调后的 BERT 提取事件标题和描述语义特征",
          "通过注意力残差网络融合多视图特征并输出目标派发部门",
        ],
      },
      {
        title: "基于预训练模型的为企服务专题事件识别",
        source: "电信科学",
        year: "2025",
        sourceUrl: "https://www.telecomsci.com/zh/article/doi/10.11959/j.issn.1000-0801.2025064/",
        doi: "10.11959/j.issn.1000-0801.2025064",
        relevance: "高：从 12345 热线工单中识别企业服务专题，属于热线工单专题识别现有技术。",
        innovationPoints: [
          "将热线工单识别细化为为企服务专题识别",
          "组合二分类、多标签分类和事件抽取来完成专题数据治理",
        ],
        methodSteps: [
          "从 12345 热线中获取企业相关诉求工单",
          "构建为企服务专题识别标签和标注样本",
          "使用 BERT 类预训练模型提取工单文本语义",
          "分别执行二分类、多标签分类和事件抽取任务",
          "输出是否属于为企服务事项及对应事件信息",
        ],
      },
      {
        title: "基于预训练BERT模型的客服工单自动分类研究",
        source: "云南电力技术",
        year: "2020",
        sourceUrl: "https://m.fx361.com/news/2020/0327/17379836.html",
        relevance: "中高：不是公共服务热线，但属于客服工单自动分类的相邻现有技术。",
        innovationPoints: [
          "把预训练 BERT 应用于行业客服工单分类",
          "利用行业工单数据二次训练，减少人工标注依赖",
        ],
        methodSteps: [
          "获取客服工单文本数据并进行预处理",
          "使用预训练 BERT 模型学习工单上下文语义",
          "结合行业工单数据对模型进行二次训练",
          "构建工单自动分类模型",
          "输入新工单文本并输出业务类别",
        ],
      },
    ];
  }

  return [];
}

function buildPatentEntries(title, domain) {
  if (domain.id === "ticket-nlp") {
    return [
      {
        title: "一种基于大数据分类算法的政务智能派单的方法",
        publicationNumber: "CN111861201A",
        applicant: "南京烽火星空通信发展有限公司",
        publicationDate: "2020-10-30",
        sourceUrl: "https://patents.google.com/patent/CN111861201A/zh",
        relevance: "高：直接涉及 12345 政府服务热线工单，并结合 BERT 模型进行派单分类。",
        innovationPoints: [
          "将 12345 热线投诉工单转化为智能派单分类任务",
          "把人工二次派单结果回流语料库，用于继续训练和修正模型",
        ],
        methodSteps: [
          "录入 12345 政府服务热线投诉信息并生成投诉工单",
          "对投诉工单文本进行切词和停用词删除",
          "使用 TF-IDF 处理工单词项特征",
          "结合 BERT 模型识别工单语义并预测对应部门",
          "将工单派发至对应部门，错误派单进入人工二次派单",
          "将人工修正结果更新至语料库并继续训练模型",
        ],
        claimFocus: [
          "工单预处理、TF-IDF 特征、BERT 分类和部门派发的组合流程",
          "错误派单后的人工二次派单及语料库更新闭环",
        ],
      },
      {
        title: "基于bert的智慧政务文本多分类方法及系统",
        publicationNumber: "CN111930937B",
        applicant: "深圳市华傲数据技术有限公司",
        publicationDate: "2025-02-25",
        sourceUrl: "https://patents.google.com/patent/CN111930937B/zh",
        relevance: "高：明确采用 BERT-Base-Chinese 进行智慧政务文本多分类。",
        innovationPoints: [
          "将政务留言文本字段组织为 BERT-Base-Chinese 的分类输入",
          "围绕政务文本多分类输出分类标签，适合对比工单识别类方案",
        ],
        methodSteps: [
          "获取智慧政务文本及其分类标签",
          "整理留言编号、用户、主题、时间、留言详情等文本字段",
          "构建词向量、分段向量和位置向量，并加入 CLS/SEP 标记",
          "将文本输入 BERT-Base-Chinese 获得语义表示",
          "通过分类层输出政务文本类别并训练测试模型",
        ],
        claimFocus: [
          "BERT-Base-Chinese 输入编码结构和政务文本多分类流程",
          "政务文本字段、分类标签和模型训练测试过程",
        ],
      },
      {
        title: "投诉工单结构化处理方法、装置、设备及存储介质",
        publicationNumber: "CN113064992A",
        applicant: "平安国际智慧城市科技股份有限公司",
        publicationDate: "2021-07-02",
        sourceUrl: "https://patents.google.com/patent/CN113064992A/zh",
        relevance: "高：明确基于 bert-base-chinese 构建投诉工单层级分类模型。",
        innovationPoints: [
          "将投诉工单结构化为多级业务类别",
          "通过层级文本分类模型输出一级、二级、三级类别概率",
        ],
        methodSteps: [
          "获取投诉工单文本",
          "基于 bert-base-chinese 构建层级文本分类模型",
          "对工单文本进行语义编码",
          "分别输出一级、二级、三级业务类别概率",
          "选取概率最大的类别作为结构化处理结果",
        ],
        claimFocus: [
          "基于 bert-base-chinese 的层级文本分类模型",
          "多级类别概率输出和最大概率类别确定方式",
        ],
      },
      {
        title: "基于领域知识图谱的服务热线工单智能识别分发平台",
        publicationNumber: "CN117829494A",
        applicant: "中电信数智科技有限公司",
        publicationDate: "2024-04-05",
        sourceUrl: "https://patents.google.com/patent/CN117829494A/zh",
        relevance: "中高：业务场景高度贴近服务热线工单识别分发，但核心更偏知识图谱。",
        innovationPoints: [
          "构建服务热线业务本体和领域知识图谱",
          "通过知识图谱匹配实现工单智能识别与分发",
        ],
        methodSteps: [
          "获取政府便民服务热线工单",
          "建立服务热线业务本体",
          "构建热线领域知识图谱",
          "将待派单工单与业务事项、部门职责等实体关系匹配",
          "生成候选分发结果并输出智能识别分发结果",
        ],
        claimFocus: [
          "服务热线领域知识图谱的构建和匹配机制",
          "基于业务事项和部门职责的工单分发结果生成",
        ],
      },
    ];
  }

  return [];
}

function getCommonPracticeStepTitle(index, stepText = "") {
  const text = String(stepText || "");
  if (index === 0 || /采集|准备|预处理|布置|输入/.test(text)) return "输入准备";
  if (/特征|提取|抽取|分割|编码|融合|建模/.test(text)) return "关键处理";
  if (/识别|预测|判断|检测|推理|控制|输出/.test(text)) return "核心执行";
  if (/校验|修正|反馈|告警|闭环|记录/.test(text)) return "结果校正";
  return `步骤${index + 1}`;
}

function pickCommonPracticeMethod(title, domain, keywordBreakdown) {
  const subject = String(keywordBreakdown.coreObject || title || domain.label || "").trim();
  const candidate = String(keywordBreakdown.coreMethod || "").trim();
  if (candidate && candidate !== subject && candidate.length <= 24) {
    return candidate;
  }
  return domain.methodSteps[1] || domain.methodSteps[0] || "关键处理";
}

function buildCommonPracticeFlow(title, domain, keywordBreakdown) {
  const subject = keywordBreakdown.coreObject || title || domain.label;
  const method = pickCommonPracticeMethod(title, domain, keywordBreakdown);
  const scenario = keywordBreakdown.applicationScenario || domain.label;
  const steps = domain.methodSteps.slice(0, 4).map((detail, index) => ({
    title: getCommonPracticeStepTitle(index, detail),
    detail,
  }));

  return {
    headline: `${subject}的通用流程`,
    summary: `通常会先围绕${subject}完成输入准备，再进行${method}，随后输出面向${scenario}的处理结果，并根据结果继续修正或闭环。`,
    explanation: "这里总结的是这个方向里反复出现的共性流程，不是某一篇论文的具体路线。",
    steps,
    closing: "写背景技术时，可以先交代这条通用流程，再指出现有方案通常在哪一步存在不足。",
  };
}

export function buildBackgroundDossier({
  title = "",
  keywords = "",
  focus = "",
  customPainPoints = "",
}) {
  const parsedKeywords = splitKeywords(keywords);
  const domain = inferDomain(title, parsedKeywords);
  const keywordBreakdown = buildKeywordBreakdown(title, parsedKeywords, domain);
  const expandedKeywords = expandKeywords(title, parsedKeywords, domain, keywordBreakdown);
  const searchStrings = buildSearchStrings(expandedKeywords, domain, keywordBreakdown);
  const scenario =
    focus ||
    `围绕“${title || parsedKeywords[0] || domain.label}”整理该领域的常见技术路线、论文方法和专利保护焦点。`;
  const painPoints = unique([...splitKeywords(customPainPoints), ...domain.painPoints], 6);
  const paperEntries = buildPaperEntries(title, domain);
  const patentEntries = buildPatentEntries(title, domain);
  const knownApproaches = buildKnownApproaches(title, parsedKeywords, domain);
  const commonPracticeFlow = buildCommonPracticeFlow(title, domain, keywordBreakdown);

  const dossierMarkdown = [
    "# 背景资料",
    "",
    `主题：${title || "待补充题目"}`,
    `技术方向：${domain.label}`,
    `应用焦点：${scenario}`,
    "",
    "## 拆题结果",
    `研究对象：${keywordBreakdown.coreObject}`,
    `核心方法：${keywordBreakdown.coreMethod}`,
    `应用场景：${keywordBreakdown.applicationScenario}`,
    `约束条件：${keywordBreakdown.constraints.join("、") || "当前未识别出明显约束词"}`,
    "",
    "## 检索关键词",
    `中文：${expandedKeywords.zh.join("、") || "待补充"}`,
    `英文：${expandedKeywords.en.join("、") || "待补充"}`,
    "",
    "## 专利检索式",
    `宽检索：${searchStrings.patentCnWide}`,
    `窄检索：${searchStrings.patentCnNarrow}`,
    "",
    "## 论文检索式",
    `宽检索：${searchStrings.paperWide}`,
    `窄检索：${searchStrings.paperNarrow}`,
    "",
    "## 相关论文分析",
    ...(paperEntries.length
      ? paperEntries.flatMap((entry, index) => [
          `### 论文 ${index + 1}：${entry.title}`,
          `来源：${entry.source || "待核验"}；年份：${entry.year || "待核验"}；链接：${entry.sourceUrl || "待核验"}`,
          `相关性：${entry.relevance || "待补充"}`,
          `创新点：${entry.innovationPoints.join("；")}`,
          "方法步骤：",
          ...entry.methodSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`),
          "",
        ])
      : ["未内置可核验论文条目。请优先使用上面的论文检索式到 Google Scholar、Semantic Scholar、Crossref、CNKI 或期刊官网检索；只有核验到标题、来源和链接后，才应写入相关论文。", ""]),
    "## 相关专利分析",
    ...(patentEntries.length
      ? patentEntries.flatMap((entry, index) => [
          `### 专利 ${index + 1}：${entry.title}`,
          `公开号：${entry.publicationNumber || "待核验"}；申请人：${entry.applicant || "待核验"}；公开日：${entry.publicationDate || "待核验"}；链接：${entry.sourceUrl || "待核验"}`,
          `相关性：${entry.relevance || "待补充"}`,
          `创新点：${entry.innovationPoints.join("；")}`,
          "方法或流程：",
          ...entry.methodSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`),
          "权利要求焦点：",
          ...entry.claimFocus.map((item, claimIndex) => `${claimIndex + 1}. ${item}`),
          "",
        ])
      : ["未内置可核验专利条目。请优先使用上面的专利检索式到 Google Patents、Espacenet、WIPO PATENTSCOPE 或 CNIPA 检索；只有核验到公开号、申请人和链接后，才应写入相关专利。", ""]),
    "## 可直接写进背景技术的痛点",
    ...painPoints.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## 检索建议",
    `- 中文专利检索：${searchStrings.patentCn}`,
    `- 国际专利检索：${searchStrings.patentGlobal}`,
    `- 论文检索：${searchStrings.paper}`,
    `- IPC/CPC 线索：${searchStrings.ipcHints.join(" / ")}`,
    `- 专利来源优先级：${PATENT_SOURCE_PRIORITY.join(" / ")}`,
    `- 论文来源优先级：${PAPER_SOURCE_PRIORITY.join(" / ")}`,
  ].join("\n");

  return {
    title: title || "待补充题目",
    domain: domain.label,
    focus: scenario,
    keywordBreakdown,
    expandedKeywords,
    knownApproaches,
    commonPracticeFlow,
    paperEntries,
    patentEntries,
    painPoints,
    searchStrings,
    sourceChecklist: [
      `论文先去 ${PAPER_SOURCE_PRIORITY.slice(0, 3).join(" / ")} 做宽检索，再按方法词或应用场景缩小范围。`,
      `专利先去 ${PATENT_SOURCE_PRIORITY.slice(0, 4).join(" / ")} 看家族和申请人分布，再按分类号细筛。`,
      "把论文的方法步骤、专利的方法流程和权利要求焦点放在一起对照，优先找差异化切入点。",
    ],
    searchSourcePriorities: {
      patents: PATENT_SOURCE_PRIORITY,
      papers: PAPER_SOURCE_PRIORITY,
    },
    dossierMarkdown,
  };
}
