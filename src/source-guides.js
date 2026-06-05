import { splitKeywords, unique } from "./utils.js";

const officialSources = [
  {
    id: "cnipa",
    name: "CNIPA 中国国家知识产权局",
    portalUrl: "https://cpquery.cponline.cnipa.gov.cn/",
    searchHints: [
      "优先组合：题目关键词 + 代理人姓名 / 申请人 / 发明人。",
      "如果要研究写作风格，优先复制“背景技术”“发明内容”“具体实施方式”三段。",
      "如果想筛授权多的候选人，先按代理人或代理机构查，再人工挑授权公告稳定的样本。",
    ],
  },
  {
    id: "uspto",
    name: "USPTO Patent Center",
    portalUrl: "https://patentcenter.uspto.gov/",
    searchHints: [
      "英文关键词尽量拆成核心名词和功能动词，例如 sensor + calibration + compensation。",
      "研究风格时，优先导入 abstract、background、detailed description、claims。",
      "若要找高手样本，建议同时观察 assignee、inventor 和 attorney/agent 关联的公开文献。",
    ],
  },
  {
    id: "wipo",
    name: "WIPO PATENTSCOPE",
    portalUrl: "https://patentscope.wipo.int/search/en/search.jsf",
    searchHints: [
      "适合先做国际范围的主题摸底，再回到各国官网细查授权与法律状态。",
      "优先保留 PCT 摘要、背景技术、独立权利要求，方便做跨语言风格比较。",
      "如果主题偏前沿，PATENTSCOPE 很适合先扩展英文术语和同族线索。",
    ],
  },
];

export function buildOfficialSourceGuides(query = "") {
  const keywords = splitKeywords(query.replace(/\s+/g, ","));
  const seeds = keywords.length ? keywords : ["专利写作", "背景技术", "代理师风格"];
  const bilingual = unique(
    seeds.flatMap((item) => {
      const lower = item.toLowerCase();
      const pairs = {
        算法: ["algorithm"],
        传感器: ["sensor"],
        控制: ["control"],
        模板: ["template"],
        背景技术: ["background art"],
        代理师: ["patent agent"],
      };
      return [item, ...(pairs[lower] || pairs[item] || [])];
    }),
  );

  return officialSources.map((source) => ({
    ...source,
    suggestedKeywords: bilingual,
    suggestedQueryText: seeds.join(" / "),
  }));
}
