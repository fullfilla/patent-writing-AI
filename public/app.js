const page = document.body.dataset.page;

const defaultWorkspace = {
  agentName: "",
  masterId: "",
  styleRawText: "",
  styleNotes: "",
  styleMasterName: "",
  styleAbstractText: "",
  styleSpecificationText: "",
  styleClaimsText: "",
  title: "",
  keywords: "",
  focus: "",
  painPoints: "",
  patentType: "发明专利",
  blankMode: "blank",
  sourceQuery: "",
  customTemplateName: "",
  customTemplateContent: "",
  templateBuilderName: "我的可视化模板",
  templateBuilderModules: [],
  distilledMasters: [],
  builderSavedTemplates: [],
  selectedDistilledMasterId: "",
  selectedBuilderTemplateId: "",
  templateSourceType: "default",
  templateStylePreset: "steady-agent",
  styleProfile: null,
  background: null,
  template: null,
};

const defaultSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
};

const MAX_TEMPLATE_TEXT_LENGTH = 120000;
const MAX_TEMPLATE_FILE_BYTES = 10 * 1024 * 1024;
const BUILDER_MODULE_TYPES = {
  heading: "heading",
  paragraph: "paragraph",
  sentence: "sentence",
};

const STYLE_PRESET_LIBRARY = [
  {
    id: "steady-agent",
    name: "自然专业风",
    description: "表述尽量像正常代理人底稿，句子直接，少套话，适合大多数发明专利说明书。",
    writingHabits: ["先把对象说清楚，再写动作和关系。", "少用空泛评价词，多写具体约束。", "尽量不用宣传腔和万能连接句。"],
    toneSummary: "自然、克制、像人工底稿",
    templateMoves: ["优先保留原章节顺序。", "引导语只说明这一段该写什么，不代替你编创新细节。"],
  },
  {
    id: "problem-solution",
    name: "问题方案风",
    description: "先讲现有问题，再讲对应方案，适合技术痛点比较明确的主题。",
    writingHabits: ["背景先落到具体问题。", "每节尽量对应一个解决动作。", "因果关系写清楚，但不堆套话。"],
    toneSummary: "问题导向，推进自然",
    templateMoves: ["标题更强调问题、方案、效果。", "引导语更强调这一节承担什么作用。"],
  },
  {
    id: "structure-first",
    name: "结构骨架风",
    description: "先把模块、部件、连接关系排清楚，再补步骤和效果。",
    writingHabits: ["对象和层级先讲清楚。", "先写部件关系，再补动作。", "实施方式按结构顺序铺开，不来回跳。"],
    toneSummary: "骨架清楚，结构自然",
    templateMoves: ["每节先说明部件或模块作用。", "段落引导优先提示结构和连接关系。"],
  },
];

const dom = {
  disclaimer: document.querySelector("#disclaimer"),
  workspaceOverview: document.querySelector("#workspace-overview"),
  sourceQuery: document.querySelector("#source-query"),
  topicTitle: document.querySelector("#topic-title"),
  topicKeywords: document.querySelector("#topic-keywords"),
  topicFocus: document.querySelector("#topic-focus"),
  topicPainPoints: document.querySelector("#topic-pain-points"),
  agentName: document.querySelector("#agent-name"),
  masterSelect: document.querySelector("#master-select"),
  styleRawText: document.querySelector("#style-raw-text"),
  styleNotes: document.querySelector("#style-notes"),
  styleMasterName: document.querySelector("#style-master-name"),
  styleMasterSearch: document.querySelector("#style-master-search"),
  styleAbstractText: document.querySelector("#style-abstract-text"),
  styleSpecificationText: document.querySelector("#style-specification-text"),
  styleClaimsText: document.querySelector("#style-claims-text"),
  styleAbstractFileInput: document.querySelector("#style-abstract-file-input"),
  styleSpecificationFileInput: document.querySelector("#style-specification-file-input"),
  styleClaimsFileInput: document.querySelector("#style-claims-file-input"),
  distilledMastersList: document.querySelector("#distilled-masters-list"),
  deleteMasterButton: document.querySelector("#delete-master-button"),
  styleStatus: document.querySelector("#style-status"),
  patentType: document.querySelector("#patent-type"),
  blankMode: document.querySelector("#blank-mode"),
  templateSourceType: document.querySelector("#template-source-type"),
  selectedMasterTemplateId: document.querySelector("#selected-master-template-id"),
  selectedBuilderTemplateId: document.querySelector("#selected-builder-template-id"),
  templateStylePreset: document.querySelector("#template-style-preset"),
  templateSourceNote: document.querySelector("#template-source-note"),
  refreshGuides: document.querySelector("#refresh-guides"),
  distillButton: document.querySelector("#distill-button"),
  useSampleText: document.querySelector("#use-sample-text"),
  backgroundButton: document.querySelector("#background-button"),
  templateButton: document.querySelector("#template-button"),
  templateFileButton: document.querySelector("#template-file-button"),
  templateFileInput: document.querySelector("#template-file-input"),
  templateFileName: document.querySelector("#template-file-name"),
  templateClearButton: document.querySelector("#template-clear-button"),
  templateFileStatus: document.querySelector("#template-file-status"),
  templateSourceText: document.querySelector("#template-source-text"),
  sourceGuides: document.querySelector("#source-guides"),
  styleOutput: document.querySelector("#style-output"),
  backgroundOutput: document.querySelector("#background-output"),
  backgroundOverview: document.querySelector("#background-overview"),
  backgroundKeywords: document.querySelector("#background-keywords"),
  backgroundSearchPlan: document.querySelector("#background-search-plan"),
  backgroundCommonPractice: document.querySelector("#background-common-practice"),
  backgroundPaperResults: document.querySelector("#background-paper-results"),
  backgroundPatentResults: document.querySelector("#background-patent-results"),
  backgroundPainPoints: document.querySelector("#background-pain-points"),
  templateOutput: document.querySelector("#template-output"),
  templateContext: document.querySelector("#template-context"),
  navPills: document.querySelector(".nav-pills"),
  builderToolList: document.querySelector("#builder-tool-list"),
  builderStatus: document.querySelector("#builder-status"),
  builderTemplateName: document.querySelector("#builder-template-name"),
  builderCanvas: document.querySelector("#builder-canvas"),
  builderSettingsPanel: document.querySelector("#builder-settings-panel"),
  builderPreview: document.querySelector("#builder-preview"),
  builderSyncButton: document.querySelector("#builder-sync-button"),
  builderSaveButton: document.querySelector("#builder-save-button"),
  builderClearButton: document.querySelector("#builder-clear-button"),
  builderSavedTemplates: document.querySelector("#builder-saved-templates"),
  chatThread: document.querySelector("#chat-thread"),
  chatInput: document.querySelector("#chat-input"),
  chatSendButton: document.querySelector("#chat-send-button"),
  chatFileInput: document.querySelector("#chat-file-input"),
  chatFiles: document.querySelector("#chat-files"),
  chatClearButton: document.querySelector("#chat-clear-button"),
  chatMemoryStatus: document.querySelector("#chat-memory-status"),
  userAdminStatus: document.querySelector("#user-admin-status"),
  userAdminPasswordFilePath: document.querySelector("#user-admin-password-file-path"),
  userAdminList: document.querySelector("#user-admin-list"),
  userAdminCreateUsername: document.querySelector("#user-admin-create-username"),
  userAdminCreateDisplayName: document.querySelector("#user-admin-create-display-name"),
  userAdminCreatePassword: document.querySelector("#user-admin-create-password"),
  userAdminCreateRole: document.querySelector("#user-admin-create-role"),
  userAdminCreateButton: document.querySelector("#user-admin-create-button"),
};

const state = {
  authUser: null,
  sampleMasters: [],
  disclaimer: "",
  settings: { ...defaultSettings },
  settingsSummary: null,
  workspace: { ...defaultWorkspace },
  adminPasswordFilePath: "",
  chat: {
    messages: [],
    files: [],
  },
  adminUsers: [],
};

let loginUi = null;
let settingsUi = null;
let userAdminUi = null;
let workspaceSaveTimer = null;
let workspaceSaveRequest = Promise.resolve();
let activeBuilderModuleId = "";
let builderDragPayload = null;

const motionState = {
  readyPromise: null,
  gsap: null,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

function loadMotionLibrary() {
  if (motionState.readyPromise) return motionState.readyPromise;
  if (motionState.reduceMotion) {
    motionState.readyPromise = Promise.resolve(null);
    return motionState.readyPromise;
  }
  if (window.gsap) {
    motionState.gsap = window.gsap;
    motionState.readyPromise = Promise.resolve(window.gsap);
    return motionState.readyPromise;
  }

  motionState.readyPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "/vendor/gsap/gsap.min.js";
    script.async = true;
    script.onload = () => {
      motionState.gsap = window.gsap || null;
      resolve(motionState.gsap);
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return motionState.readyPromise;
}

function withMotion(callback) {
  const gsap = motionState.gsap || window.gsap;
  if (!gsap || motionState.reduceMotion) return;
  callback(gsap);
}

function animatePageEntrance() {
  withMotion((gsap) => {
    gsap.fromTo(
      ".topbar",
      { autoAlpha: 0, y: -14 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", overwrite: "auto" },
    );
    gsap.fromTo(
      ".hero-copy, .page-hero, .card",
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.045, ease: "power2.out", overwrite: "auto" },
    );
  });
}

function animateGeneratedOutput(element) {
  if (!element) return;
  withMotion((gsap) => {
    gsap.fromTo(
      element,
      { autoAlpha: 0.45, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out", overwrite: "auto" },
    );
  });
}

function animateListItems(container, selector) {
  if (!container) return;
  withMotion((gsap) => {
    const items = container.querySelectorAll(selector);
    if (!items.length) return;
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.035, ease: "power2.out", overwrite: "auto" },
    );
  });
}

function animateBuilderCanvas() {
  if (!dom.builderCanvas) return;
  withMotion((gsap) => {
    const nodes = dom.builderCanvas.querySelectorAll(".builder-node, .builder-module-card, .builder-empty-shell");
    if (!nodes.length) return;
    gsap.fromTo(
      nodes,
      { autoAlpha: 0, y: 10, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.025, ease: "power2.out", overwrite: "auto" },
    );
  });
}

function animateActiveBuilderModule() {
  withMotion((gsap) => {
    const activeNode = dom.builderCanvas?.querySelector(".builder-node.is-active, .builder-module-card.is-active");
    if (!activeNode) return;
    gsap.fromTo(activeNode, { scale: 0.985 }, { scale: 1, duration: 0.24, ease: "back.out(2)", overwrite: "auto" });
  });
}

function animateCopyFeedback(button) {
  if (!button) return;
  button.classList.add("copy-flash");
  window.setTimeout(() => button.classList.remove("copy-flash"), 520);
  withMotion((gsap) => {
    gsap.fromTo(button, { scale: 0.96 }, { scale: 1, duration: 0.26, ease: "back.out(2)", overwrite: "auto" });
  });
}

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function generateReadablePassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

function createBuilderModuleId() {
  return `builder-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/* legacy flat builder skeleton disabled
function createBuilderModuleSkeleton(type, moduleId = createBuilderModuleId()) {
  if (type === BUILDER_MODULE_TYPES.heading) {
    return {
      id: moduleId,
      type,
      parentId: "",
      topic: "鏈涓婚",
      guidance: "杩欎竴娈典富瑕佽鏄庝粈涔?,
      paragraphContent: "",
      parentId: "",
      title: "技术领域",
      level: "chapter",
      note: "",
    };
  }

  if (type === BUILDER_MODULE_TYPES.paragraph) {
    return {
      id: moduleId,
      type,
      blockTitle: "本节内容",
      summary: "这一节大概要写什么",
      keyPoints: "关键点 1\n关键点 2",
      blockStyle: "section",
    };
  }

  return {
    id: moduleId,
    type: BUILDER_MODULE_TYPES.paragraph,
    topic: "本段主题",
    guidance: "这一段主要说明什么",
    keywords: "",
    placeholder: "在这里补充具体技术内容",
  };
}

*/
function normalizeBuilderModule(module) {
  if (!module || typeof module !== "object") {
    return null;
  }

  const type = Object.values(BUILDER_MODULE_TYPES).includes(module.type) ? module.type : BUILDER_MODULE_TYPES.paragraph;
  return {
    ...createBuilderModuleSkeleton(type),
    ...module,
    id: String(module.id || createBuilderModuleId()),
    type,
  };
}

function normalizeBuilderModules(modules = []) {
  return Array.isArray(modules) ? modules.map(normalizeBuilderModule).filter(Boolean) : [];
}

function getBuilderModuleTypeLabel(type) {
  if (type === BUILDER_MODULE_TYPES.heading) return "标题模块";
  if (type === BUILDER_MODULE_TYPES.content) return "内容模块";
  return "段落模块";
}

function getBuilderModuleSummary(module) {
  if (module.type === BUILDER_MODULE_TYPES.heading) {
    return module.title || "未命名标题";
  }

  if (module.type === BUILDER_MODULE_TYPES.content) {
    return module.blockTitle || "未命名内容块";
  }

  return module.topic || "未命名段落";
}

function createNestedBuilderModuleSkeleton(type, moduleId = createBuilderModuleId()) {
  if (type === BUILDER_MODULE_TYPES.heading) {
    return {
      id: moduleId,
      type,
      parentId: "",
      title: "技术领域",
      level: "chapter",
      note: "",
    };
  }

  if (type === BUILDER_MODULE_TYPES.paragraph) {
    return {
      id: moduleId,
      type,
      parentId: "",
      topic: "本段主题",
      guidance: "这一段主要说明什么",
      paragraphContent: "",
    };
  }

  return {
    id: moduleId,
    type: BUILDER_MODULE_TYPES.sentence,
    parentId: "",
    content: "在这里设置这句要写的内容",
    note: "",
  };
}

function normalizeBuilderNode(module) {
  if (!module || typeof module !== "object") return null;

  const rawType = module.type === "content" ? BUILDER_MODULE_TYPES.paragraph : module.type;
  const type = Object.values(BUILDER_MODULE_TYPES).includes(rawType) ? rawType : BUILDER_MODULE_TYPES.paragraph;
  const legacyParagraphPatch =
    module.type === "content"
      ? {
          topic: module.blockTitle || module.topic || "本段主题",
          guidance: module.summary || module.guidance || "这一段主要说明什么",
          paragraphContent: "",
        }
      : {};

  return {
    ...createNestedBuilderModuleSkeleton(type),
    ...legacyParagraphPatch,
    ...module,
    id: String(module.id || createBuilderModuleId()),
    parentId: module.parentId ? String(module.parentId) : "",
    type,
  };
}

function normalizeBuilderNodes(modules = []) {
  if (!Array.isArray(modules)) return [];

  let currentHeadingId = "";
  let currentParagraphId = "";
  return modules
    .map(normalizeBuilderNode)
    .filter(Boolean)
    .map((module) => {
      const nextModule = { ...module };
      if (nextModule.type === BUILDER_MODULE_TYPES.heading) {
        currentHeadingId = nextModule.id;
        currentParagraphId = "";
        nextModule.parentId = "";
        return nextModule;
      }

      if (!nextModule.parentId) {
        if (nextModule.type === BUILDER_MODULE_TYPES.paragraph) {
          nextModule.parentId = currentHeadingId || "";
        } else {
          nextModule.parentId = currentParagraphId || currentHeadingId || "";
        }
      }

      if (nextModule.type === BUILDER_MODULE_TYPES.paragraph) {
        currentParagraphId = nextModule.id;
      }

      return nextModule;
    });
}

function getBuilderTypeLabel(type) {
  if (type === BUILDER_MODULE_TYPES.heading) return "标题";
  if (type === BUILDER_MODULE_TYPES.paragraph) return "段落";
  return "句子";
}

function getBuilderSummary(module) {
  if (module.type === BUILDER_MODULE_TYPES.heading) {
    return module.title || "未命名标题";
  }

  if (module.type === BUILDER_MODULE_TYPES.paragraph) {
    return module.topic || module.guidance || "未命名段落";
  }

  return module.content || module.note || "未命名句子";
}

function padParagraphIndex(index) {
  return `[${String(index).padStart(4, "0")}]`;
}

function normalizeTemplateText(value = "") {
  return String(value || "").replace(/\r/g, "").trim().slice(0, MAX_TEMPLATE_TEXT_LENGTH);
}

function isSupportedTemplateTextFile(file) {
  return Boolean(
    file &&
      (file.type.startsWith("text/") || /\.(txt|md|markdown|text|html?|xml|csv)$/i.test(file.name || "")),
  );
}

function isSupportedTemplateOfficeFile(file) {
  return Boolean(file && /\.docx$/i.test(file.name || ""));
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function setTemplateStatus(text, tone = "neutral") {
  if (!dom.templateFileStatus) return;
  dom.templateFileStatus.textContent = text;
  dom.templateFileStatus.dataset.tone = tone;
}

function setStyleStatus(text, tone = "neutral") {
  if (!dom.styleStatus) return;
  dom.styleStatus.textContent = text;
  dom.styleStatus.dataset.tone = tone;
}

function renderCustomTemplateStatus() {
  const templateText = normalizeTemplateText(state.workspace.customTemplateContent);
  const selectedMaster = getSelectedDistilledMaster();
  const selectedBuilderTemplate = getSelectedBuilderTemplate();
  const sourceType = state.workspace.templateSourceType || "default";
  if (!templateText) {
    if (sourceType === "master" && selectedMaster?.templateContent) {
      setTemplateStatus(`当前选中大师模板：${selectedMaster.name}。生成时会严格优先沿用它的模板和写作风格。`, "success");
      return;
    }
    if (sourceType === "builder" && selectedBuilderTemplate?.content) {
      setTemplateStatus(`当前选中搭建器模板：${selectedBuilderTemplate.name}。生成时会严格沿用这套模板骨架。`, "success");
      return;
    }
    setTemplateStatus("当前还没有上传模板，将使用系统默认模板。", "neutral");
    return;
  }

  const templateName = state.workspace.customTemplateName || "手动粘贴模板";
  const lineCount = templateText.split("\n").filter((line) => line.trim()).length;
  setTemplateStatus(`当前已加载模板：${templateName}，共 ${lineCount} 行。生成时会优先严格保留模板结构。`, "success");
}

function setLoading(button, loading, text) {
  if (!button) return;
  button.disabled = loading;
  button.classList.toggle("is-loading", loading);
  button.style.opacity = loading ? "0.72" : "1";
  withMotion((gsap) => {
    if (loading) {
      gsap.to(button, {
        scale: 0.985,
        repeat: -1,
        yoyo: true,
        duration: 0.58,
        ease: "sine.inOut",
        overwrite: "auto",
      });
    } else {
      gsap.killTweensOf(button);
      gsap.to(button, { scale: 1, duration: 0.16, ease: "power1.out", overwrite: "auto" });
    }
  });
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = text;
  } else if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
  }
}

function setLoadingText(button, text) {
  if (!button || !button.disabled || !text) return;
  button.textContent = text;
}

async function requestJson(path, { method = "GET", payload, handleUnauthorized = true } = {}) {
  const response = await fetch(path, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const data = await response.json().catch(() => ({ message: "请求失败" }));
  if (!response.ok) {
    const error = new Error(data.message || "请求失败");
    error.status = response.status;
    if (handleUnauthorized && response.status === 401) {
      loginUi?.open("登录已过期，请重新登录。");
    }
    throw error;
  }

  return data;
}

async function requestNdjsonStream(path, { method = "GET", payload, onMessage, handleUnauthorized = true } = {}) {
  const response = await fetch(path, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "请求失败" }));
    const error = new Error(data.message || "请求失败");
    error.status = response.status;
    if (handleUnauthorized && response.status === 401) {
      loginUi?.open("登录已过期，请重新登录。");
    }
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        const message = JSON.parse(line);
        if (onMessage) {
          await onMessage(message);
        }
      }
      newlineIndex = buffer.indexOf("\n");
    }

    if (done) {
      break;
    }
  }

  const lastLine = buffer.trim();
  if (lastLine) {
    const message = JSON.parse(lastLine);
    if (onMessage) {
      await onMessage(message);
    }
  }
}

function waitForUiTick(delayMs) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function chunkTextBySections(text = "", mode = "section") {
  const normalizedText = String(text || "").replace(/\r/g, "").trim();
  if (!normalizedText) {
    return [];
  }

  if (mode === "line-group") {
    const lines = normalizedText.split("\n");
    const groupSize = Math.min(8, Math.max(4, Math.ceil(lines.length / 10)));
    const groups = [];
    for (let index = 0; index < lines.length; index += groupSize) {
      groups.push(lines.slice(index, index + groupSize).join("\n").trim());
    }
    return groups.filter(Boolean);
  }

  const sections = splitDraftIntoSections(normalizedText);
  if (sections.length > 1) {
    return sections;
  }

  return chunkTextBySections(normalizedText, "line-group");
}

async function progressivelyRenderOutput(
  element,
  text,
  { formatter = (value) => escapeHtml(value), className = "", chunkMode = "section" } = {},
) {
  if (!element) return;

  const normalizedText = String(text || "").replace(/\r/g, "").trim();
  if (!normalizedText) {
    element.classList.add("empty-state");
    element.textContent = "";
    return;
  }

  const chunks = chunkTextBySections(normalizedText, chunkMode);
  let currentText = "";

  element.classList.remove("empty-state");
  if (className) {
    element.classList.add(className);
  } else {
    element.classList.remove("structured-output");
  }

  for (let index = 0; index < chunks.length; index += 1) {
    currentText = currentText ? `${currentText}\n\n${chunks[index]}` : chunks[index];
    element.innerHTML = formatter(currentText);
    if (index < chunks.length - 1) {
      const pause = Math.min(110, Math.max(36, Math.round(chunks[index].length / 14)));
      await waitForUiTick(pause);
    }
  }
}

function toBullets(items = []) {
  return items.map((item) => `• ${escapeHtml(item)}`).join("<br />");
}

function buildModeHint(modeLabel = "") {
  if (!modeLabel) return "";
  return `<div class="output-meta output-hint">生成方式：${escapeHtml(modeLabel)}</div>`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", { hour12: false });
}

function createStoredItemId(prefix = "item") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function getStylePresetById(presetId) {
  return STYLE_PRESET_LIBRARY.find((item) => item.id === presetId) || STYLE_PRESET_LIBRARY[0];
}

function normalizeDistilledMaster(master = {}) {
  return {
    id: String(master.id || createStoredItemId("master")),
    name: String(master.name || "未命名大师模板").trim() || "未命名大师模板",
    abstractText: normalizeTemplateText(master.abstractText || ""),
    specificationText: normalizeTemplateText(master.specificationText || ""),
    claimsText: normalizeTemplateText(master.claimsText || ""),
    templateContent: normalizeTemplateText(master.templateContent || ""),
    analysisMarkdown: String(master.analysisMarkdown || "").trim(),
    styleProfile: master.styleProfile || null,
    createdAt: master.createdAt || new Date().toISOString(),
  };
}

function normalizeBuilderSavedTemplate(template = {}) {
  return {
    id: String(template.id || createStoredItemId("builder-template")),
    name: String(template.name || "未命名搭建器模板").trim() || "未命名搭建器模板",
    content: normalizeTemplateText(template.content || ""),
    modules: normalizeBuilderNodes(template.modules || []),
    createdAt: template.createdAt || new Date().toISOString(),
  };
}

function getDistilledMasters() {
  state.workspace.distilledMasters = Array.isArray(state.workspace.distilledMasters)
    ? state.workspace.distilledMasters.map(normalizeDistilledMaster)
    : [];
  return state.workspace.distilledMasters;
}

function getBuilderSavedTemplates() {
  state.workspace.builderSavedTemplates = Array.isArray(state.workspace.builderSavedTemplates)
    ? state.workspace.builderSavedTemplates.map(normalizeBuilderSavedTemplate)
    : [];
  return state.workspace.builderSavedTemplates;
}

function getSelectedDistilledMaster() {
  return getDistilledMasters().find((item) => item.id === state.workspace.selectedDistilledMasterId) || null;
}

function getSelectedBuilderTemplate() {
  return getBuilderSavedTemplates().find((item) => item.id === state.workspace.selectedBuilderTemplateId) || null;
}

function getRenderableStyleProfile(master) {
  if (!master) return null;
  const profile =
    master.abstractText || master.specificationText || master.claimsText
      ? buildDistilledStyleProfileFromDocs({
          masterName: master.name,
          abstractText: master.abstractText,
          specificationText: master.specificationText,
          claimsText: master.claimsText,
        })
      : master.styleProfile || {};
  return {
    ...profile,
    displayName: profile.displayName || master.name || "未命名大师模板",
    analysisMarkdown: profile.analysisMarkdown || master.analysisMarkdown || "",
    templateContent: profile.templateContent || master.templateContent || "",
    toneSummary: profile.toneSummary || "模板 + 写作风格",
    archetype: profile.archetype || "大师模板",
    rawExcerptPreview:
      profile.rawExcerptPreview || master.specificationText?.slice(0, 180) || master.abstractText?.slice(0, 180) || "",
    metrics: profile.metrics || {},
    writingHabits: profile.writingHabits || [],
    templateMoves: profile.templateMoves || [],
    signaturePhrases: profile.signaturePhrases || [],
  };
}

function splitTextIntoSentences(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/(?<=[。！？!?；;])\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractHeadingsFromText(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        /^(摘要|说明书|权利要求书|技术领域|背景技术|发明内容|附图说明|具体实施方式|实施例|权利要求|第[一二三四五六七八九十0-9]+[章节部分]|[一二三四五六七八九十0-9]+[、.．)]|[（(][一二三四五六七八九十0-9]+[)）])/.test(
          line,
        ) || (line.length <= 18 && !/[。；：:]/.test(line)),
    )
    .slice(0, 24);
}

function summarizeSentencePurpose(sentence = "", index = 0, label = "") {
  const source = String(sentence || "").trim();
  if (!source) {
    return "这一句没有读到有效内容。";
  }
  if (/本发明|本实用新型|提供了|涉及/.test(source)) {
    return `第 ${index + 1} 句通常在交代${label || "技术主题"}和发明对象。`;
  }
  if (/用于|使得|从而|以便|能够/.test(source)) {
    return `第 ${index + 1} 句更像是在说明用途、效果或想达到的结果。`;
  }
  if (/包括|包含|由|步骤|依次|通过/.test(source)) {
    return `第 ${index + 1} 句主要在交代组成、步骤或执行动作。`;
  }
  if (/优选|进一步|具体|其中/.test(source)) {
    return `第 ${index + 1} 句通常是在补充限定条件或展开细节。`;
  }
  return `第 ${index + 1} 句主要在承接上下文，补足${label || "这一部分"}的说明。`;
}

function inferSentenceRole(sentence = "", heading = "", label = "") {
  const source = String(sentence || "").trim();
  const headingText = String(heading || "").trim();
  if (!source) return "空句";
  if (isHeadingLikeLine(source)) return "标题句";
  if (/^(\[\d{4}\]\s*)?本发明公开了/.test(source)) return "对象总述句";
  if (/^(\[\d{4}\]\s*)?本发明涉及/.test(source)) return "领域归属句";
  if (/^(\[\d{4}\]\s*)?随着/.test(source)) return "背景铺垫句";
  if (/存在|不足|难以|缺陷|漏检|准确率低|效率低/.test(source)) return "现有问题句";
  if (/针对|为了解决|为了达到/.test(source)) return "发明目的句";
  if (/包括以下步骤|按以下步骤进行|包括如下步骤/.test(source)) return "步骤引出句";
  if (/^S?\d+(?:\.\d+)?[:：]/.test(source) || /^步骤\d+(?:\.\d+)?[:：]/.test(source)) return "步骤描述句";
  if (/图\d+/.test(source)) return "附图说明句";
  if (/有益效果|效果/.test(source)) return "效果总结句";
  if (/其中|进一步|优选|具体/.test(source)) return "细化限定句";
  if (/公式|损失函数|相似度|回归|坐标/.test(source)) return "公式定义句";
  return `${headingText || label || "正文"}说明句`;
}

function inferSentenceContentHint(sentence = "", heading = "", label = "") {
  const source = String(sentence || "").trim();
  const headingText = String(heading || "").trim();
  if (!source) return "这一句没有可提取的内容要点。";
  if (/^(\[\d{4}\]\s*)?本发明公开了/.test(source)) {
    return "写方案名称、对象类型和核心技术动作，不展开过细实施细节。";
  }
  if (/^(\[\d{4}\]\s*)?本发明涉及/.test(source)) {
    return "写所属上位技术领域，再落到具体方法、系统、装置或介质。";
  }
  if (/存在|不足|难以|缺陷|漏检|准确率低|效率低/.test(source)) {
    return "写现有方案的具体短板，以及这个短板造成的后果。";
  }
  if (/针对|为了解决|为了达到/.test(source)) {
    return "写本发明要解决的技术问题，或者要达到的技术目的。";
  }
  if (/包括以下步骤|按以下步骤进行|包括如下步骤/.test(source)) {
    return "写总流程的引导句，把后面的步骤串起来。";
  }
  if (/^S?\d+(?:\.\d+)?[:：]/.test(source) || /^步骤\d+(?:\.\d+)?[:：]/.test(source)) {
    return "写该步骤具体做什么、处理什么对象、得到什么结果。";
  }
  if (/图\d+/.test(source)) {
    return "写图号和图所对应的结构、流程或模块关系。";
  }
  if (/有益效果|效果/.test(source)) {
    return "写方案带来的技术效果，尽量对应前面的结构或步骤。";
  }
  if (/公式|损失函数|相似度|回归|坐标/.test(source)) {
    return "写公式位置、变量含义、计算对象和适用场景。";
  }
  if (/其中|进一步|优选|具体/.test(source)) {
    return "写前一句中某个模块、参数、条件或关系的进一步限定。";
  }
  return `写清楚这句在“${headingText || label || "当前部分"}”里承担的信息点，不要空泛重复。`;
}

function inferSentenceFormatHint(sentence = "", heading = "") {
  const source = String(sentence || "").trim();
  const headingText = String(heading || "").trim();
  if (!source) return "格式：当前没有可识别句式。";
  if (isHeadingLikeLine(source)) return "格式：单独成行作为标题，不和正文混写。";
  if (/^\[\d{4}\]/.test(source) && /^S?\d+(?:\.\d+)?[:：]|^步骤\d+(?:\.\d+)?[:：]/.test(source.replace(/^\[\d{4}\]\s*/, ""))) {
    return "格式：保留段落号 + 步骤号，写成“[0001] S1: ……”或“[0001] 步骤1：……”";
  }
  if (/^\[\d{4}\]/.test(source)) {
    return "格式：保留方括号段落号，后面直接接完整陈述句。";
  }
  if (/^S?\d+(?:\.\d+)?[:：]/.test(source) || /^步骤\d+(?:\.\d+)?[:：]/.test(source)) {
    return "格式：保留步骤编号，后面用一句话写动作或处理结果。";
  }
  if (/图\d+/.test(source)) {
    return "格式：通常写成“图1为……示意图”这类固定附图说明句式。";
  }
  if (/包括以下步骤|按以下步骤进行|包括如下步骤/.test(source)) {
    return "格式：句末常用冒号，引出后续分步骤内容。";
  }
  if (/^(\[\d{4}\]\s*)?本发明公开了/.test(source)) {
    return "格式：通常写成“本发明公开了一种……，包括……”或“本发明公开了一种……，其特征在于……”";
  }
  if (/^(\[\d{4}\]\s*)?本发明涉及/.test(source)) {
    return "格式：通常写成“本发明涉及……技术领域，具体是……”";
  }
  if (/有益效果|效果/.test(source)) {
    return "格式：通常写成完整结论句，可配 1、2、3 分条展开。";
  }
  return `格式：沿用“${headingText || "当前部分"}”里已有句式，保留编号、冒号、图号或段落号。`;
}

function inferSentenceToneHint(sentence = "", heading = "") {
  const source = String(sentence || "").trim();
  const headingText = String(heading || "").trim();
  if (!source) return "语气：当前没有可判断内容。";
  if (/背景技术/.test(headingText) || /存在|不足|难以|缺陷/.test(source)) {
    return "语气：客观描述现有问题，不写夸张评价，不提前泄露你的创新细节。";
  }
  if (/技术领域/.test(headingText)) {
    return "语气：短、准、收，不展开方案细节。";
  }
  if (/发明内容/.test(headingText) || /针对|为了解决|为了达到/.test(source)) {
    return "语气：明确直接，突出方案与问题的对应关系。";
  }
  if (/^S?\d+(?:\.\d+)?[:：]|^步骤\d+(?:\.\d+)?[:：]/.test(source)) {
    return "语气：按流程平铺直叙，动作词要具体，少用宣传词。";
  }
  if (/图\d+/.test(source)) {
    return "语气：纯说明，不做评价。";
  }
  if (/有益效果|效果/.test(source)) {
    return "语气：写技术效果，不写营销腔，不写“显著优秀”等空话。";
  }
  return "语气：保持专利说明书口吻，客观、克制、专业。";
}

function buildSentenceDetails(label, lines = []) {
  const details = [];
  let currentHeading = label;

  lines.forEach((line) => {
    const cleanLine = String(line || "").trim();
    if (!cleanLine) return;
    if (/^\[\d{4}\]$/.test(cleanLine)) return;

    if (isHeadingLikeLine(cleanLine)) {
      currentHeading = cleanLine;
      details.push({
        sentence: cleanLine,
        heading: currentHeading,
        role: "标题句",
        purpose: "这一句是结构标题，用来划分后续内容范围。",
        contentHint: "标题只写章节名称，不写具体技术细节。",
        formatHint: "格式：单独成行，作为标题出现。",
        toneHint: "语气：简洁固定，不展开。",
        templateLine: `【章节标题，保留为“${currentHeading}”】`,
      });
      return;
    }

    splitTextIntoSentences(cleanLine).forEach((sentence, indexInLine) => {
      const role = inferSentenceRole(sentence, currentHeading, label);
      details.push({
        sentence,
        heading: currentHeading,
        role,
        purpose: summarizeSentencePurpose(sentence, details.length, currentHeading || label),
        contentHint: inferSentenceContentHint(sentence, currentHeading, label),
        formatHint: inferSentenceFormatHint(sentence, currentHeading),
        toneHint: inferSentenceToneHint(sentence, currentHeading),
        templateLine: inferSentenceTemplateLine(sentence, currentHeading, label),
        indexInLine,
      });
    });
  });

  return details;
}

function analyzePatentDocument(label, text) {
  const cleanText = normalizeTemplateText(text);
  const headings = extractHeadingsFromText(cleanText);
  const lines = cleanText.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const sentenceDetails = buildSentenceDetails(label, lines);
  const sentences = sentenceDetails.map((item) => item.sentence).filter(Boolean);
  const averageSentenceLength = sentences.length
    ? Math.round(sentences.reduce((sum, item) => sum + item.length, 0) / sentences.length)
    : 0;

  return {
    label,
    text: cleanText,
    lineCount: lines.length,
    sentenceCount: sentences.length,
    headings,
    averageSentenceLength,
    formatSummary: headings.length
      ? `能识别出 ${headings.length} 个明显标题/编号，格式比较规整。`
      : "标题不算多，更像连续正文，需要靠句子内容判断结构。",
    sentenceDetails,
  };
}

function countChineseChars(text = "") {
  return String(text || "").replace(/\s+/g, "").length;
}

function buildLengthText(analysis) {
  const chars = countChineseChars(analysis?.text || "");
  const sentences = Number(analysis?.sentenceCount || 0);
  const lines = Number(analysis?.lineCount || 0);
  return `${chars} 字 / ${sentences} 句 / ${lines} 行`;
}

function buildTemplateLengthStats(abstractAnalysis, specificationAnalysis, claimsAnalysis) {
  const totalChars =
    countChineseChars(abstractAnalysis.text) +
    countChineseChars(specificationAnalysis.text) +
    countChineseChars(claimsAnalysis.text);
  return {
    abstract: buildLengthText(abstractAnalysis),
    specification: buildLengthText(specificationAnalysis),
    claims: buildLengthText(claimsAnalysis),
    total: `${totalChars} 字`,
  };
}

function getSectionLengthHint(analysis, ratio = 1) {
  const chars = Math.max(80, Math.round(countChineseChars(analysis?.text || "") * ratio));
  const sentences = Math.max(1, Math.round(Number(analysis?.sentenceCount || 1) * ratio));
  return `建议约 ${chars} 字，${sentences} 句`;
}

function getHeadingLengthHint(specificationText = "", heading = "") {
  const text = String(specificationText || "");
  const escaped = String(heading || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}([\\s\\S]*?)(?=\\n(?:技术领域|背景技术|发明内容|附图说明|具体实施方式|权利要求书)\\s*\\n|$)`));
  const sectionText = match?.[1]?.trim() || "";
  const chars = countChineseChars(sectionText);
  return chars ? `建议约 ${Math.max(60, chars)} 字` : "按原模板篇幅展开";
}

function getTemplateSubjectName(raw = "") {
  const clean = String(raw || "").replace(/^本发明公开[了一种]*|^本发明涉及|^一种/, "").trim();
  if (!clean) return "某技术方案";
  return clean.replace(/[。；;，,]$/, "");
}

function getClaimStyleSubject(raw = "") {
  const name = getTemplateSubjectName(raw);
  return /^一种/.test(name) ? name : `一种${name}`;
}

function extractParagraphMarker(line = "") {
  return String(line || "").match(/^\[(\d{4})\]/)?.[0] || "";
}

function extractStepMarker(line = "") {
  return String(line || "").match(/^((?:步骤|S)\d+(?:\.\d+)?[:：])/i)?.[0] || "";
}

function isHeadingLikeLine(line = "") {
  const clean = String(line || "").trim();
  return /^(技术领域|背景技术|发明内容|附图说明|具体实施方式|说明书摘要|权利要求书)\s*$/.test(clean);
}

function stripSentencePunctuation(text = "") {
  return String(text || "")
    .trim()
    .replace(/[。；;！!？?]+$/g, "")
    .trim();
}

function buildTemplateInstruction(label = "", fixedFormat = "") {
  const cleanLabel = String(label || "").trim() || "按原句位置补充对应内容";
  const formatHint = String(fixedFormat || "").trim();
  return formatHint ? `【${cleanLabel}，固定格式“${formatHint}”】` : `【${cleanLabel}】`;
}

function buildTemplateSlot(label = "", punctuation = "。") {
  const cleanLabel = String(label || "").trim() || "按原句位置补充对应内容";
  const endMark = String(punctuation || "。");
  return `【${cleanLabel}】${endMark}`;
}

function buildTemplateShell(template = "") {
  return String(template || "").trim() || "【按原句位置补充对应内容】";
}

function countStepMarkers(text = "") {
  return (String(text || "").match(/(?:步骤|S)\d+(?:\.\d+)?[:：]/gi) || []).length;
}

function inferStepTemplateLabel(text = "") {
  const source = stripSentencePunctuation(text);
  if (!source) return "步骤内容";
  if (/采集|获取|读取|输入|接收|导入|提取|分割|预处理|标注|构建/.test(source)) {
    return "数据准备或初始提取";
  }
  if (/融合|拼接|卷积|编码|解码|映射|计算|生成|组合|分支|上采样|下采样|聚合/.test(source)) {
    return "核心处理过程";
  }
  if (/预测|判断|分类|识别|检测|筛选|置信度|抑制|定位/.test(source)) {
    return "预测、判定或定位";
  }
  if (/回归|调整|校正|优化|修正/.test(source)) {
    return "优化或校正";
  }
  if (/输出|得到最终|完成|获得最终/.test(source)) {
    return "结果输出";
  }
  if (/公式|函数|相似度|损失|感受野|坐标/.test(source)) {
    return "公式或计算关系";
  }
  return "步骤内容";
}

function inferBackgroundTemplateLabel(text = "") {
  const source = stripSentencePunctuation(text);
  if (!source) return "背景说明";
  if (/有助于|有利于|能够为|可为|提供支持|提供帮助|具有重要意义|社会意义|研究意义/.test(source)) {
    return "研究意义";
  }
  if (/主要采取|可分为|通常采用|一般采用|现有.*方法|现有.*方案|目前.*方法|目前.*方案/.test(source)) {
    return "现有方法概述";
  }
  if (/存在|不足|缺陷|难以|依赖|漏检|误检|准确率低|效率低|成本高|稳定性不足|覆盖范围较小/.test(source)) {
    return "现有技术不足";
  }
  if (/随着|近年来|目前|在.*背景下|伴随|随着.*发展/.test(source)) {
    return "应用背景及必要性";
  }
  if (/是一种常见|对于.*具有重要作用|可以有效|能够有效|用于保障/.test(source)) {
    return "应用背景及必要性";
  }
  return "背景说明";
}

function inferSpecificationSentenceTemplate(sentence = "", heading = "", label = "") {
  const source = String(sentence || "").trim();
  const headingText = String(heading || label || "").trim();
  const bodyWithoutParagraph = source.replace(/^\[\d{4}\]\s*/, "").trim();
  const stepMarker = extractStepMarker(bodyWithoutParagraph);
  const coreText = stepMarker ? bodyWithoutParagraph.slice(stepMarker.length).trim() : bodyWithoutParagraph;
  const cleanCore = stripSentencePunctuation(coreText);

  if (!cleanCore && !stepMarker) {
    if (/技术领域/.test(headingText)) {
      return buildTemplateShell("本发明涉及【技术领域】，具体涉及【应用对象】。");
    }
    if (/背景技术/.test(headingText)) {
      return buildTemplateSlot("背景说明");
    }
    if (/发明内容/.test(headingText)) {
      return buildTemplateShell("为了达到上述目的，本发明提供【方案名称】。");
    }
    if (/附图说明/.test(headingText)) {
      return buildTemplateShell("图【序号】为【附图名称】。");
    }
    if (/具体实施方式/.test(headingText)) {
      return buildTemplateShell("下面结合附图和具体实施例对本发明作进一步说明。");
    }
    return buildTemplateSlot("按原句位置补充对应技术内容");
  }

  if (stepMarker) {
    const punctuation = /[；;]$/.test(bodyWithoutParagraph) ? "；" : "。";
    return `${stepMarker}${buildTemplateSlot(inferStepTemplateLabel(cleanCore), punctuation)}`;
  }
  if (/^本发明公开了一种/.test(bodyWithoutParagraph) && /属于.+技术领域/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("本发明公开了一种【专利名称】，属于【技术领域】。");
  }
  if (/^本发明公开了/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("本发明公开了【专利名称及核心方案】。");
  }
  if (/^本发明涉及/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("本发明涉及【技术领域】，具体涉及【应用对象】。");
  }
  if (/^针对|^为了解决|^为了达到上述目的|^本发明提出/.test(bodyWithoutParagraph)) {
    if (/为了达到上述目的.+本发明提供/.test(bodyWithoutParagraph)) {
      return buildTemplateShell("为了达到上述目的，本发明提供【方案名称】。");
    }
    return buildTemplateShell("针对【现有问题】，本发明提出【方案名称】。");
  }
  if (/本发明不同之处在于|区别在于|改进在于/.test(bodyWithoutParagraph)) {
    return buildTemplateSlot("核心创新点");
  }
  if (/包括以下步骤|包括如下步骤|按以下步骤进行/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("包括以下步骤：");
  }
  if (/^图\d+位?为|^图\d+为/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("图【序号】为【附图名称】。");
  }
  if (/^下面结合附图和具体实施例|^下面对本发明做进一步说明|^如图\d+所示/.test(bodyWithoutParagraph)) {
    return buildTemplateShell("下面结合附图和具体实施例对本发明作进一步说明。");
  }
  if (/对于本领域技术人员而言|不背离本发明的精神|均应将实施例看作是示范性/.test(bodyWithoutParagraph)) {
    return buildTemplateSlot("保护范围说明");
  }
  if (/公式|损失函数|相似度|感受野|坐标|回归/.test(bodyWithoutParagraph)) {
    return buildTemplateSlot("公式或计算关系");
  }
  if (/有益效果|效果|提升|改善|增强/.test(bodyWithoutParagraph) && /发明内容|具体实施方式/.test(headingText)) {
    return buildTemplateSlot("技术效果");
  }
  if (/技术领域/.test(headingText)) {
    return buildTemplateSlot("技术领域及应用对象");
  }
  if (/背景技术/.test(headingText)) {
    return buildTemplateSlot(inferBackgroundTemplateLabel(bodyWithoutParagraph));
  }
  if (/发明内容/.test(headingText)) {
    if (/有益效果|效果/.test(bodyWithoutParagraph)) {
      return buildTemplateSlot("有益效果");
    }
    return buildTemplateSlot("方案或技术路线");
  }
  if (/附图说明/.test(headingText)) {
    return buildTemplateShell("图【序号】为【附图名称】。");
  }
  if (/具体实施方式/.test(headingText)) {
    if (/其中|进一步|优选|具体/.test(bodyWithoutParagraph)) {
      return buildTemplateSlot("进一步限定");
    }
    return buildTemplateSlot("实施方式内容");
  }
  return buildTemplateSlot("按原句位置补充对应技术内容");
}

function buildSpecificationTemplateSentence(line = "", heading = "") {
  const clean = String(line || "").trim();
  const paragraphMarker = extractParagraphMarker(clean);
  const body = clean.replace(/^\[\d{4}\]\s*/, "").trim();
  const sentences = splitTextIntoSentences(body);
  const sentenceTemplates = [];

  for (let index = 0; index < sentences.length; index += 1) {
    const sentence = sentences[index];
    const currentIsStep = Boolean(extractStepMarker(sentence));
    if (currentIsStep) {
      let endIndex = index;
      while (endIndex + 1 < sentences.length && extractStepMarker(sentences[endIndex + 1])) {
        endIndex += 1;
      }
      if (endIndex > index) {
        sentenceTemplates.push(buildTemplateSlot("步骤流程"));
        index = endIndex;
        continue;
      }
    }
    sentenceTemplates.push(inferSpecificationSentenceTemplate(sentence, heading, "说明书"));
  }

  const templateBody = sentenceTemplates.length
    ? sentenceTemplates.join(" ")
    : inferSpecificationSentenceTemplate("", heading, "说明书");

  return paragraphMarker ? `${paragraphMarker} ${templateBody}` : templateBody;
}

function getAbstractTemplateLines(abstractAnalysis) {
  const text = String(abstractAnalysis?.text || "").trim();
  if (!text) {
    return [
      buildTemplateShell("本发明公开了一种【专利名称】，属于【技术领域】。"),
      buildTemplateSlot("摘要核心内容"),
    ];
  }

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      if (countStepMarkers(line) >= 2) {
        const firstStepIndex = line.search(/(?:步骤|S)\d+(?:\.\d+)?[:：]/i);
        const prefix = firstStepIndex > 0 ? line.slice(0, firstStepIndex).trim() : "";
        const blocks = [];
        if (prefix) {
          blocks.push(inferSpecificationSentenceTemplate(prefix, "说明书摘要", "说明书摘要"));
        }
        blocks.push(buildTemplateSlot("步骤流程"));
        return blocks;
      }
      return [buildSpecificationTemplateSentence(line, "说明书摘要")];
    });
}

function extractClaimNumber(text = "") {
  return Number(String(text || "").match(/^(?:权利要求\s*)?(\d+)[、.．：:]/)?.[1] || 0);
}

function extractReferencedClaimNumber(text = "", fallback = 1) {
  return Number(String(text || "").match(/根据权利要求\s*(\d+)/)?.[1] || fallback || 1);
}

function splitClaimUnits(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n+/)
    .flatMap((line) => line.split(/(?=(?:步骤|S)\d+(?:\.\d+)?[:：])/i))
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildClaimDetailTemplate(line = "") {
  const clean = String(line || "").trim();
  const stepMarker = extractStepMarker(clean);
  if (stepMarker) {
    return `${stepMarker}${buildTemplateSlot("步骤内容", /[；;]$/.test(clean) ? "；" : "。")}`;
  }
  if (/其特征在于|包括如下步骤|包括以下步骤/.test(clean)) {
    return "";
  }
  if (/其中|所述|采用|包括|由|用于|使得|通过|公式|参数|模块|单元/.test(clean)) {
    return buildTemplateSlot("从属限定特征");
  }
  return buildTemplateSlot("从属限定特征");
}

function inferClaimSentenceTemplate(sentence = "") {
  const source = String(sentence || "").trim();
  const stepMarker = extractStepMarker(source);
  if (/^(?:权利要求\s*)?\d+[、.．]\s*一种/.test(source)) {
    return buildTemplateShell("一种【方法/系统/装置名称】，其特征在于，包括如下步骤：");
  }
  if (/^(?:权利要求\s*)?\d+[、.．]\s*根据权利要求/.test(source)) {
    return buildTemplateShell("根据权利要求【编号】所述的【方法/系统/装置名称】，其特征在于：");
  }
  if (stepMarker) {
    return `${stepMarker}${buildTemplateSlot("步骤内容", /[；;]$/.test(source) ? "；" : "。")}`;
  }
  if (/其中|所述|包括|采用|用于|使得|模块|单元|阈值|参数|公式/.test(source)) {
    return buildTemplateSlot("从属限定特征");
  }
  return buildTemplateSlot("从属限定特征");
}

function inferSentenceTemplateLine(sentence = "", heading = "", label = "") {
  if (/权利要求书/.test(String(label || "")) || /权利要求书/.test(String(heading || ""))) {
    return inferClaimSentenceTemplate(sentence);
  }
  return inferSpecificationSentenceTemplate(sentence, heading, label);
}

function buildClaimsTemplateBlocks(claims = []) {
  if (!claims.length) {
    return [
      "1.一种【方法/系统/装置名称】，其特征在于，包括如下步骤：",
      "步骤1：【步骤内容】；",
      "步骤2：【步骤内容】；",
      "2.根据权利要求1所述的【方法/系统/装置名称】，其特征在于：",
      "【从属限定特征】。",
    ];
  }

  return claims.flatMap((claimText, index) => {
    const units = splitClaimUnits(claimText);
    const firstLine = units[0] || "";
    const claimNumber = extractClaimNumber(firstLine) || index + 1;

    if (claimNumber === 1) {
      const stepLines = units
        .slice(1)
        .map((line) => buildClaimDetailTemplate(line))
        .filter(Boolean);
      return [
        "1.一种【方法/系统/装置名称】，其特征在于，包括如下步骤：",
        ...(stepLines.length
          ? stepLines
          : ["步骤1：【步骤内容】；", "步骤2：【步骤内容】；"]),
      ];
    }

    const referencedClaim = extractReferencedClaimNumber(firstLine, Math.max(1, claimNumber - 1));
    const detailLines = units
      .slice(1)
      .map((line) => buildClaimDetailTemplate(line))
      .filter(Boolean);
    return [
      `${claimNumber}.根据权利要求${referencedClaim}所述的【方法/系统/装置名称】，其特征在于：`,
      ...(detailLines.length ? detailLines : ["【从属限定特征】。"]),
    ];
  });
}

function splitClaims(text = "") {
  const clean = normalizeTemplateText(text);
  if (!clean) return [];
  const matches = clean
    .split(/\n(?=(?:权利要求\s*)?\d+[、.．：:])/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (matches.length > 1) return matches;
  return clean
    .split(/(?=(?:权利要求\s*)?\d+[、.．：:])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferWritingTraitsFromDocs(abstractAnalysis, specificationAnalysis, claimsAnalysis) {
  const allHeadings = [...abstractAnalysis.headings, ...specificationAnalysis.headings, ...claimsAnalysis.headings];
  const compactClaims = claimsAnalysis.sentenceCount > 0 && claimsAnalysis.averageSentenceLength > specificationAnalysis.averageSentenceLength;
  const numberedStructure = allHeadings.some((item) => /\d|一|二|三|四/.test(item));
  const explanatoryTone = specificationAnalysis.sentenceDetails.some((item) => /用于|从而|以便/.test(item.sentence));

  return {
    archetype: compactClaims ? "权利要求压缩型" : "说明书展开型",
    toneSummary: numberedStructure ? "编号明确、结构清楚" : "正文连续、叙述推进",
    writingHabits: [
      numberedStructure ? "标题和编号比较明显，适合严格按章节走。" : "标题不算密，更依赖上下文连续展开。",
      explanatoryTone ? "常用“用于 / 从而 / 以便”这类效果表达。" : "更偏平铺直叙，少解释性连接词。",
      compactClaims ? "权利要求句式偏长，限定关系写得比较密。" : "权利要求句式相对平稳，限定逐步增加。",
    ],
    templateMoves: [
      "模板里优先保留原来的标题、编号和段落顺序。",
      "引导文字只提示“这一段该写什么”，不替你生成创新点本身。",
      compactClaims ? "独立权利要求留更宽的占位，避免自动写得太死。" : "实施方式部分留更清楚的分段提示。",
    ],
  };
}

function buildMasterTemplateFromDocs(name, abstractAnalysis, specificationAnalysis, claimsAnalysis) {
  const lines = [`# ${name}`];
  const lengthStats = buildTemplateLengthStats(abstractAnalysis, specificationAnalysis, claimsAnalysis);
  const headings = specificationAnalysis.headings.length
    ? specificationAnalysis.headings
    : ["技术领域", "背景技术", "发明内容", "附图说明", "具体实施方式"];
  const claims = splitClaims(claimsAnalysis.text);

  lines.push("## 模板长度参考");
  lines.push(`- 总体：${lengthStats.total}`);
  lines.push(`- 说明书摘要：${lengthStats.abstract}`);
  lines.push(`- 说明书：${lengthStats.specification}`);
  lines.push(`- 权利要求书：${lengthStats.claims}`);

  lines.push("## 说明书摘要");
  lines.push(`【摘要总述：写明专利名称、技术对象和核心处理链路；${getSectionLengthHint(abstractAnalysis)}】`);
  lines.push("【核心步骤：按 S1-Sn 或“获取-处理-判断-输出”写清楚必要步骤，不写空泛效果】");
  lines.push("【技术效果：只写与步骤对应的准确率、效率、稳定性或成本效果】");

  headings.forEach((heading) => {
    lines.push(`## ${heading}`);
    if (heading.includes("技术领域")) {
      lines.push(`【技术领域：写所属技术领域和具体应用对象；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
      return;
    }
    if (heading.includes("背景")) {
      lines.push(`【背景技术：写现有做法、已有缺陷和待解决技术问题；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
      return;
    }
    if (heading.includes("发明")) {
      lines.push(`【发明内容：按技术问题、技术方案、有益效果展开；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
      return;
    }
    if (heading.includes("附图")) {
      lines.push(`【附图说明：逐一写图号及其对应流程、系统结构或模块关系；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
      return;
    }
    if (heading.includes("具体实施")) {
      lines.push(`【具体实施方式：结合附图展开输入、处理步骤、参数/公式、输出结果和可选实施例；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
      lines.push("【实施例步骤：保留原模板的 S1/S1.1 或步骤编号层级，逐步写动作、对象和结果】");
      return;
    }
    lines.push(`【${heading}：按原章节功能补充对应技术内容；${getHeadingLengthHint(specificationAnalysis.text, heading)}】`);
  });

  lines.push("## 权利要求书");
  lines.push(`【权利要求总体：建议 ${Math.max(claims.length, 1)} 条；独权覆盖必要技术特征，从权逐层限定参数、步骤、模块关系或异常处理】`);
  lines.push(...buildClaimsTemplateBlocks(claims));

  return lines.join("\n\n");
}

function buildDistilledAnalysisMarkdown(name, abstractAnalysis, specificationAnalysis, claimsAnalysis, traits, templateContent) {
  const lengthStats = buildTemplateLengthStats(abstractAnalysis, specificationAnalysis, claimsAnalysis);

  return `# 大师模板蒸馏结果

## 模板名称
${name}

## 模板长度
- 总体：${lengthStats.total}
- 说明书摘要：${lengthStats.abstract}
- 说明书：${lengthStats.specification}
- 权利要求书：${lengthStats.claims}

## 写作风格判断
- 风格类型：${traits.archetype}
- 风格概括：${traits.toneSummary}
- 常见习惯：
${traits.writingHabits.slice(0, 3).map((item) => `  - ${item}`).join("\n")}
- 模板迁移动作：
${traits.templateMoves.slice(0, 3).map((item) => `  - ${item}`).join("\n")}

## 提炼出的模板骨架
${templateContent}`.trim();
}

function buildDistilledStyleProfileFromDocs({
  masterName = "",
  abstractText = "",
  specificationText = "",
  claimsText = "",
} = {}) {
  const resolvedMasterName = String(masterName || "").trim() || "未命名大师模板";
  const abstractAnalysis = analyzePatentDocument("说明书摘要", abstractText);
  const specificationAnalysis = analyzePatentDocument("说明书", specificationText);
  const claimsAnalysis = analyzePatentDocument("权利要求书", claimsText);
  const traits = inferWritingTraitsFromDocs(abstractAnalysis, specificationAnalysis, claimsAnalysis);
  const templateContent = buildMasterTemplateFromDocs(
    resolvedMasterName,
    abstractAnalysis,
    specificationAnalysis,
    claimsAnalysis,
  );
  const lengthStats = buildTemplateLengthStats(abstractAnalysis, specificationAnalysis, claimsAnalysis);
  const analysisMarkdown = buildDistilledSentenceAnalysisMarkdown(
    resolvedMasterName,
    abstractAnalysis,
    specificationAnalysis,
    claimsAnalysis,
    traits,
    templateContent,
  );

  return {
    id: createStoredItemId("master-profile"),
    displayName: resolvedMasterName,
    archetype: traits.archetype,
    toneSummary: traits.toneSummary,
    metrics: {
      templateLength: lengthStats.total,
      abstractLength: lengthStats.abstract,
      specificationLength: lengthStats.specification,
      claimsLength: lengthStats.claims,
      structure: `${specificationAnalysis.headings.length || 1} 个结构标题`,
      problemOrientation: specificationAnalysis.sentenceDetails.some((item) => /问题|缺陷|不足/.test(item.sentence)) ? "明显" : "一般",
      claimSkeleton: `${Math.max(splitClaims(claimsText).length, 1)} 条权利要求骨架`,
      embodimentDetail: `${specificationAnalysis.sentenceCount} 句说明书正文`,
      effectEmphasis: abstractAnalysis.sentenceDetails.some((item) => /用于|从而|效果/.test(item.sentence)) ? "偏强" : "中等",
      averageSentenceLength: `${specificationAnalysis.averageSentenceLength || 0} 字`,
    },
    signaturePhrases: specificationAnalysis.sentenceDetails
      .slice(0, 4)
      .map((item) => item.sentence.slice(0, 18))
      .filter(Boolean),
    writingHabits: traits.writingHabits,
    templateMoves: traits.templateMoves,
    rawExcerptPreview: specificationAnalysis.text.slice(0, 180),
    analysisMarkdown,
    templateContent,
    abstractText,
    specificationText,
    claimsText,
    styleTraits: traits,
  };
}

function buildDistilledStyleProfile() {
  return buildDistilledStyleProfileFromDocs({
    masterName: state.workspace.styleMasterName,
    abstractText: state.workspace.styleAbstractText,
    specificationText: state.workspace.styleSpecificationText,
    claimsText: state.workspace.styleClaimsText,
  });
}

function buildDistilledSentenceAnalysisMarkdown(
  name,
  abstractAnalysis,
  specificationAnalysis,
  claimsAnalysis,
  traits,
  templateContent,
) {
  const lengthStats = buildTemplateLengthStats(abstractAnalysis, specificationAnalysis, claimsAnalysis);
  const headings = specificationAnalysis.headings.length ? specificationAnalysis.headings.join("、") : "未识别出明确章节标题";
  const claimCount = Math.max(splitClaims(claimsAnalysis.text).length, 1);

  return `# 大师模板蒸馏结果

## 模板名称
${name}

## 模板长度
- 总体：${lengthStats.total}
- 说明书摘要：${lengthStats.abstract}
- 说明书：${lengthStats.specification}
- 权利要求书：${lengthStats.claims}

## 写作风格判断
- 风格类型：${traits.archetype}
- 风格概括：${traits.toneSummary}
- 章节结构：${headings}
- 权利要求：约 ${claimCount} 条

## 写作规则
${traits.writingHabits.slice(0, 3).map((item) => `- ${item}`).join("\n")}
${traits.templateMoves.slice(0, 3).map((item) => `- ${item}`).join("\n")}

## 提炼出的模板骨架
${templateContent}`.trim();
}

function normalizeList(items = []) {
  return Array.isArray(items)
    ? items
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];
}

function inferApproachProfile(text = "", index = 0) {
  const source = String(text || "").trim();
  if (source.includes("单一温度")) {
    return {
      paperTitle: "单一温度阈值预警路线",
      patentTitle: "基于温度阈值的热失控预警方案",
      innovation:
        "通过温升速率、绝对温度阈值或温差阈值建立早期告警门槛，用低成本传感方案覆盖基础热风险识别。",
      paperSteps: [
        "在电芯、模组或电池包关键位置布设温度采集单元。",
        "连续计算绝对温度、温升速率或相邻位置温差等特征。",
        "将实时特征与告警阈值比较并输出热风险等级。",
      ],
      patentSteps: [
        "采集目标电池单元或电池包的温度相关数据。",
        "根据预设阈值、变化速率或区域温差判断异常状态。",
        "在满足触发条件时执行分级告警或联动保护。",
      ],
      claimFocus: [
        "温度传感器的布设位置与数量配置。",
        "温度阈值、温升速率阈值或温差阈值的判定规则。",
        "告警触发后的联动控制逻辑。",
      ],
    };
  }

  if (source.includes("电参") || source.includes("热参") || source.includes("电压") || source.includes("电流")) {
    return {
      paperTitle: "电参与热参融合监测路线",
      patentTitle: "电热多参数联合风险评估方案",
      innovation:
        "把电压、电流、温度和状态估计量放到同一判据中，降低单一参数受工况波动影响时带来的误判。",
      paperSteps: [
        "同步采集电压、电流、温度以及可选的 SOC、SOH、内阻估计量。",
        "提取异常波动、耦合关系或趋势偏移等联合特征。",
        "通过规则判据或风险评分模型输出预警结果。",
      ],
      patentSteps: [
        "建立电参和热参的联合采样链路。",
        "按照预设融合规则计算电池热风险指标。",
        "依据风险指标执行预警分级、记录和保护控制。",
      ],
      claimFocus: [
        "多种参数的采样组合与同步方式。",
        "联合特征构建或风险评分的判定逻辑。",
        "与 BMS、热管理或保护模块的联动方式。",
      ],
    };
  }

  if (source.includes("多传感器") || source.includes("多模态") || source.includes("气体") || source.includes("烟雾")) {
    return {
      paperTitle: "多模态协同预警路线",
      patentTitle: "多传感器融合热失控预警方案",
      innovation:
        "引入温度之外的气体、烟雾、压力、声学或红外信息，在热失控显著升温前捕捉更敏感的前兆信号。",
      paperSteps: [
        "布设温度、气体、烟雾、压力、声学或红外等多模态传感节点。",
        "对不同模态进行时间同步、特征提取和异常置信度计算。",
        "通过融合判据输出早期预警结果并抑制误报。",
      ],
      patentSteps: [
        "采集至少两类以上异构传感信号并建立同步窗口。",
        "针对不同模态生成独立异常分值或事件标签。",
        "结合融合规则触发预警并输出保护动作。",
      ],
      claimFocus: [
        "异构传感器的组合方式和安装结构。",
        "多模态时间同步、特征融合和权重分配逻辑。",
        "误报抑制、分级告警和系统联动机制。",
      ],
    };
  }

  return {
    paperTitle: `相关论文线索 ${index + 1}`,
    patentTitle: `相关专利线索 ${index + 1}`,
    innovation: source || "围绕该技术路线对热失控早期征兆进行识别和预警。",
    paperSteps: [
      "明确该路线的核心监测对象与关键输入信号。",
      "建立异常特征提取与风险识别规则。",
      "输出告警结论并评价提前量、误报率与部署成本。",
    ],
    patentSteps: [
      "采集与该路线相关的目标信号。",
      "根据预设规则或模型计算异常结果。",
      "在触发条件满足时输出预警及保护动作。",
    ],
    claimFocus: [
      "输入信号与关键特征的限定方式。",
      "异常识别的判定条件。",
      "预警输出与后续控制动作。",
    ],
  };
}

function buildStructuredBackgroundMarkdownV2(background) {
  const title = String(background?.title || state.workspace.title || "当前技术主题").trim();
  const domain = String(background?.domain || "相关技术方向").trim();
  const focus = String(background?.focus || state.workspace.focus || "待补充").trim();
  const keywordBreakdown = background?.keywordBreakdown || {};
  const approaches = normalizeList(background?.knownApproaches);
  const painPoints = normalizeList(background?.painPoints);
  const zhKeywords = normalizeList(background?.expandedKeywords?.zh);
  const enKeywords = normalizeList(background?.expandedKeywords?.en);
  const ipcHints = normalizeList(background?.searchStrings?.ipcHints);
  const patentCn = String(background?.searchStrings?.patentCn || "").trim();
  const patentGlobal = String(background?.searchStrings?.patentGlobal || "").trim();
  const paperQuery = String(background?.searchStrings?.paper || "").trim();
  const patentCnWide = String(background?.searchStrings?.patentCnWide || "").trim();
  const patentCnNarrow = String(background?.searchStrings?.patentCnNarrow || "").trim();
  const paperWide = String(background?.searchStrings?.paperWide || "").trim();
  const paperNarrow = String(background?.searchStrings?.paperNarrow || "").trim();
  const sourceChecklist = normalizeList(background?.sourceChecklist);
  const patentSources = normalizeList(background?.searchSourcePriorities?.patents);
  const paperSources = normalizeList(background?.searchSourcePriorities?.papers);
  const profileList = (approaches.length ? approaches : [`围绕${title}建立背景资料分析路线。`]).map((item, index) =>
    inferApproachProfile(item, index),
  );

  const paperSection = profileList
    .map(
      (profile, index) => `### 论文线索 ${index + 1}：${profile.paperTitle}
研究思路：
- ${profile.innovation}

方法：
1. ${profile.paperSteps[0]}
2. ${profile.paperSteps[1]}
3. ${profile.paperSteps[2]}

创新点：
- ${profile.innovation}`,
    )
    .join("\n\n");

  const commonPracticeSection = profileList
    .map(
      (profile, index) => `### 通用做法 ${index + 1}：${profile.paperTitle}
通俗解释：
- ${profile.innovation}

作用：
- 它通常用来交代这个领域最常见的技术路线，让读者先明白行业里一般怎么处理这类问题。

一般步骤：
1. ${profile.paperSteps[0]}
2. ${profile.paperSteps[1]}
3. ${profile.paperSteps[2]}

常见原因：
- 因为这条路线相对成熟、容易落地，也比较容易接到现有系统里面。

常见问题：
- ${profile.claimFocus[0]}`,
    )
    .join("\n\n");

  const patentSection = profileList
    .map(
      (profile, index) => `### 专利线索 ${index + 1}：${profile.patentTitle}
方法或流程：
1. ${profile.patentSteps[0]}
2. ${profile.patentSteps[1]}
3. ${profile.patentSteps[2]}

创新点：
- ${profile.innovation}

对应权利：
- ${profile.claimFocus.join("\n- ")}`,
    )
    .join("\n\n");

  const painPointSection = painPoints.length
    ? painPoints.map((item) => `- ${item}`).join("\n")
    : "- 当前还没有补充明确痛点，建议围绕预警提前量、误报率、部署成本和鲁棒性继续细化。";

  const keywordLines = [
    zhKeywords.length ? `- 中文关键词：${zhKeywords.join("、")}` : "",
    enKeywords.length ? `- 英文关键词：${enKeywords.join(", ")}` : "",
    ipcHints.length ? `- 可参考分类号：${ipcHints.join(" / ")}` : "",
    paperQuery ? `- 论文检索方向：${paperQuery}` : "",
    patentCn ? `- 中文专利检索方向：${patentCn}` : "",
    patentGlobal ? `- 国际专利检索方向：${patentGlobal}` : "",
    ...sourceChecklist.map((item) => `- ${item}`),
  ].filter(Boolean);

  return `# 背景资料

主题：${title}
技术方向：${domain}
应用焦点：${focus}

## 这次检索是怎么拆题的
- 研究对象：${keywordBreakdown.coreObject || "待补充"}
- 核心方法：${keywordBreakdown.coreMethod || "待补充"}
- 应用场景：${keywordBreakdown.applicationScenario || "待补充"}
- 约束条件：${normalizeList(keywordBreakdown.constraints).join("、") || "暂未识别出明显约束词"}
- 拆题说明：${keywordBreakdown.decompositionSummary || "当前按主题关键词做了基础拆题，后续可以继续补场景、性能指标和约束条件。"}

## 这个领域通常怎么做
${commonPracticeSection}

## 相关论文
${paperSection}

## 相关专利
${patentSection}

## 这个领域目前常见问题
${painPointSection}

## 你后续还可以继续查这些方向
${keywordLines.join("\n") || "- 当前先按主题继续细化即可。"}

## 推荐检索路径
- 专利优先去：${patentSources.join(" / ") || "Google Patents / Espacenet / WIPO PATENTSCOPE / CNIPA"}
- 论文优先去：${paperSources.join(" / ") || "Google Scholar / Semantic Scholar / Crossref / CNKI"}
- 中文专利宽检索：${patentCnWide || patentCn || "待补充"}
- 中文专利窄检索：${patentCnNarrow || patentCn || "待补充"}
- 论文宽检索：${paperWide || paperQuery || "待补充"}
- 论文窄检索：${paperNarrow || paperQuery || "待补充"}`.trim();
}

function getCommonPracticeStepTitle(index, stepText = "") {
  const text = String(stepText || "");
  if (index === 0 || /采集|准备|预处理|布置|输入/.test(text)) return "输入准备";
  if (/特征|抽取|分割|编码|建模|融合/.test(text)) return "关键处理";
  if (/识别|预测|判断|检测|推理|控制|输出/.test(text)) return "核心执行";
  if (/校验|修正|反馈|告警|闭环|记录/.test(text)) return "校验闭环";
  return `步骤 ${index + 1}`;
}

function pickCommonPracticeMethod(background = {}, steps = []) {
  const keywordBreakdown = background?.keywordBreakdown || {};
  const subject = String(keywordBreakdown.coreObject || background?.title || background?.domain || "").trim();
  const candidate = String(keywordBreakdown.coreMethod || "").trim();
  if (candidate && candidate !== subject && candidate.length <= 24) {
    return candidate;
  }
  return steps[1]?.detail || steps[0]?.detail || "关键处理";
}

function buildDerivedCommonPracticeFlow(background = {}) {
  const keywordBreakdown = background?.keywordBreakdown || {};
  const paperEntries = getBackgroundPaperEntries(background);
  const patentEntries = getBackgroundPatentEntries(background);
  const sourceSteps =
    paperEntries[0]?.methodSteps?.length
      ? paperEntries[0].methodSteps
      : patentEntries[0]?.methodSteps?.length
        ? patentEntries[0].methodSteps
        : normalizeList(background?.knownApproaches);
  const steps = sourceSteps.slice(0, 4).map((detail, index) => ({
    title: getCommonPracticeStepTitle(index, detail),
    detail,
  }));
  const subject = keywordBreakdown.coreObject || background?.title || background?.domain || "该技术";
  const method = pickCommonPracticeMethod(background, steps);
  const scenario = keywordBreakdown.applicationScenario || background?.domain || "目标场景";

  return {
    headline: `${subject}的常见处理流程`,
    summary: `这个领域通常会先围绕${subject}做输入准备，再完成${method}，随后给出面向${scenario}的结果，并根据结果继续校验或闭环修正。`,
    explanation: "这部分不是单篇论文的方法路线，而是把这个方向里反复出现的共性步骤压成一条通用流程，适合直接写进背景技术。",
    steps,
    closing: "落笔时可以先交代这条通用流程，再把你的创新点落到其中某一步、某个模块或某个判定条件上。",
  };
}

function normalizeCommonPracticeFlow(background = {}) {
  const flow = background?.commonPracticeFlow;
  if (flow && typeof flow === "object") {
    const steps = Array.isArray(flow.steps)
      ? flow.steps
          .map((item, index) => {
            if (!item) return null;
            if (typeof item === "string") {
              return {
                title: getCommonPracticeStepTitle(index, item),
                detail: item,
              };
            }
            return {
              title: String(item.title || getCommonPracticeStepTitle(index, item.detail || "")).trim(),
              detail: String(item.detail || item.content || "").trim(),
            };
          })
          .filter((item) => item?.detail)
      : [];
    if (steps.length) {
      return {
        headline: String(flow.headline || flow.title || buildDerivedCommonPracticeFlow(background).headline).trim(),
        summary: String(flow.summary || "").trim(),
        explanation: String(flow.explanation || "").trim(),
        steps,
        closing: String(flow.closing || "").trim(),
      };
    }
  }

  if (typeof flow === "string" && flow.trim()) {
    const derived = buildDerivedCommonPracticeFlow(background);
    return {
      ...derived,
      summary: flow.trim(),
    };
  }

  return buildDerivedCommonPracticeFlow(background);
}

function buildStructuredBackgroundMarkdown(background) {
  const title = String(background?.title || state.workspace.title || "当前技术主题").trim();
  const domain = String(background?.domain || "相关技术方向").trim();
  const focus = String(background?.focus || state.workspace.focus || "待补充").trim();
  const keywordBreakdown = background?.keywordBreakdown || {};
  const paperEntries = getBackgroundPaperEntries(background);
  const patentEntries = getBackgroundPatentEntries(background);
  const commonPracticeFlow = normalizeCommonPracticeFlow(background);
  const painPoints = normalizeList(background?.painPoints);
  const zhKeywords = normalizeList(background?.expandedKeywords?.zh);
  const enKeywords = normalizeList(background?.expandedKeywords?.en);
  const ipcHints = normalizeList(background?.searchStrings?.ipcHints);
  const patentCn = String(background?.searchStrings?.patentCn || "").trim();
  const patentGlobal = String(background?.searchStrings?.patentGlobal || "").trim();
  const paperQuery = String(background?.searchStrings?.paper || "").trim();
  const patentCnWide = String(background?.searchStrings?.patentCnWide || "").trim();
  const patentCnNarrow = String(background?.searchStrings?.patentCnNarrow || "").trim();
  const paperWide = String(background?.searchStrings?.paperWide || "").trim();
  const paperNarrow = String(background?.searchStrings?.paperNarrow || "").trim();
  const sourceChecklist = normalizeList(background?.sourceChecklist);
  const patentSources = normalizeList(background?.searchSourcePriorities?.patents);
  const paperSources = normalizeList(background?.searchSourcePriorities?.papers);

  const commonPracticeSection = [
    `### ${commonPracticeFlow.headline}`,
    `一句话总结：${commonPracticeFlow.summary}`,
    commonPracticeFlow.explanation ? `说明：${commonPracticeFlow.explanation}` : "",
    "通常流程：",
    ...commonPracticeFlow.steps.map((step, index) => `${index + 1}. ${step.title}：${step.detail}`),
    commonPracticeFlow.closing ? `落笔提示：${commonPracticeFlow.closing}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const paperSection = paperEntries.length
    ? paperEntries
        .map(
          (entry, index) => `### 论文线索 ${index + 1}：${entry.title}
来源：${[entry.source, entry.year, entry.doi ? `DOI：${entry.doi}` : "", entry.sourceUrl].filter(Boolean).join("；") || "待补充"}
相关性：${entry.relevance || "待补充"}

创新点：
- ${entry.innovationPoints.join("\n- ") || "待补充"}

方法步骤：
${entry.methodSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join("\n") || "1. 待补充"}`,
        )
        .join("\n\n")
    : "### 论文线索\n- 当前还没有核验到真实论文条目。请先按检索式到 Google Scholar、Semantic Scholar、Crossref、CNKI 或期刊官网检索，拿到标题、来源和链接后再写入。";

  const patentSection = patentEntries.length
    ? patentEntries
        .map(
          (entry, index) => `### 专利线索 ${index + 1}：${entry.title}
专利信息：${[entry.publicationNumber, entry.applicant, entry.publicationDate, entry.sourceUrl].filter(Boolean).join("；") || "待补充"}
相关性：${entry.relevance || "待补充"}

创新点：
- ${entry.innovationPoints.join("\n- ") || "待补充"}

方法或流程：
${entry.methodSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join("\n") || "1. 待补充"}

对应权利：
- ${entry.claimFocus.join("\n- ") || "待补充"}`,
        )
        .join("\n\n")
    : "### 专利线索\n- 当前还没有核验到真实专利条目。请先按检索式到 Google Patents、Espacenet、WIPO PATENTSCOPE 或 CNIPA 检索，拿到公开号、申请人和链接后再写入。";

  const painPointSection = painPoints.length
    ? painPoints.map((item) => `- ${item}`).join("\n")
    : "- 当前还没有补充明确痛点，建议围绕准确率、效率、成本和稳定性继续细化。";

  const keywordLines = [
    zhKeywords.length ? `- 中文关键词：${zhKeywords.join("、")}` : "",
    enKeywords.length ? `- 英文关键词：${enKeywords.join(", ")}` : "",
    ipcHints.length ? `- 可参考分类号：${ipcHints.join(" / ")}` : "",
    paperQuery ? `- 论文检索方向：${paperQuery}` : "",
    patentCn ? `- 中文专利检索方向：${patentCn}` : "",
    patentGlobal ? `- 国际专利检索方向：${patentGlobal}` : "",
    ...sourceChecklist.map((item) => `- ${item}`),
  ].filter(Boolean);

  return `# 背景资料

主题：${title}
技术方向：${domain}
应用焦点：${focus}

## 这次检索是怎么拆题的
- 研究对象：${keywordBreakdown.coreObject || "待补充"}
- 核心方法：${keywordBreakdown.coreMethod || "待补充"}
- 应用场景：${keywordBreakdown.applicationScenario || "待补充"}
- 约束条件：${normalizeList(keywordBreakdown.constraints).join("、") || "暂未识别出明显约束词"}
- 拆题说明：${keywordBreakdown.decompositionSummary || "当前按主题关键词做了基础拆题，后续可以继续补场景、性能指标和约束条件。"}

## 这个领域通常怎么做
${commonPracticeSection}

## 相关论文
${paperSection}

## 相关专利
${patentSection}

## 这个领域目前常见问题
${painPointSection}

## 你后续还可以继续查这些方向
${keywordLines.join("\n") || "- 当前先按主题继续细化即可。"}

## 推荐检索路径
1. 论文宽检索：${paperWide || "待补充"}
2. 论文窄检索：${paperNarrow || "待补充"}
3. 中文专利宽检索：${patentCnWide || "待补充"}
4. 中文专利窄检索：${patentCnNarrow || "待补充"}
5. 专利来源优先级：${patentSources.join(" / ") || "待补充"}
6. 论文来源优先级：${paperSources.join(" / ") || "待补充"}`;
}

function normalizeBackgroundPackage(background) {
  if (!background || typeof background !== "object") {
    return background;
  }
  const rebuiltMarkdown = buildStructuredBackgroundMarkdown(background);

  return {
    ...background,
    dossierMarkdown: rebuiltMarkdown || String(background.dossierMarkdown || ""),
  };
}

function renderSourceGuides(guides = []) {
  if (!dom.sourceGuides) return;
  dom.sourceGuides.innerHTML = guides
    .map(
      (guide) => `
        <article class="source-box">
          <h3>${escapeHtml(guide.name)}</h3>
          <a href="${escapeAttribute(guide.portalUrl)}" target="_blank" rel="noreferrer">打开官网入口</a>
          <div class="chip-row">
            ${(guide.suggestedKeywords || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          </div>
          <p class="output-meta">建议检索：${escapeHtml(guide.suggestedQueryText)}</p>
          <ul>
            ${(guide.searchHints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
  hydrateBuilderDropSlots();
  animateListItems(dom.sourceGuides, ".source-box");
}

function renderStyleProfile(profile) {
  if (!dom.styleOutput) return;

  if (profile?.analysisMarkdown) {
    dom.styleOutput.classList.remove("empty-state");
    dom.styleOutput.classList.add("structured-output");
    dom.styleOutput.innerHTML = buildStructuredDraftHtml(profile.analysisMarkdown);
    animateGeneratedOutput(dom.styleOutput);
    return;
  }

  const metricLabels = {
    templateLength: "模板总长",
    abstractLength: "摘要长度",
    specificationLength: "说明书长度",
    claimsLength: "权利要求长度",
    structure: "结构完整度",
    problemOrientation: "问题导向",
    claimSkeleton: "权利要求骨架感",
    embodimentDetail: "实施例细度",
    effectEmphasis: "效果强调度",
    averageSentenceLength: "平均句长",
  };

  const metrics = Object.entries(profile.metrics || {})
    .map(
      ([key, value]) => `
        <div class="metric-box">
          <strong>${metricLabels[key] || key}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `,
    )
    .join("");

  dom.styleOutput.classList.remove("empty-state");
  dom.styleOutput.classList.remove("structured-output");
  dom.styleOutput.innerHTML = `
    <strong>${escapeHtml(profile.displayName)}</strong>
    <div class="output-meta">${escapeHtml(profile.archetype)} · ${escapeHtml(profile.toneSummary)}</div>
    ${buildModeHint(profile.generationModeLabel)}
    <div class="metric-grid">${metrics}</div>
    <strong>高频标签</strong>
    <div class="chip-row">${(profile.signaturePhrases || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>
    <strong>写作习惯</strong>
    <div>${toBullets(profile.writingHabits || [])}</div>
    <strong>模板迁移动作</strong>
    <div>${toBullets(profile.templateMoves || [])}</div>
    <strong>样本文本预览</strong>
    <div class="output-meta">${escapeHtml(profile.rawExcerptPreview || "")}</div>
    ${profile.templateContent ? `<strong>模板骨架</strong><div class="context-card structured-output">${buildStructuredDraftHtml(profile.templateContent)}</div>` : ""}
  `;
  animateGeneratedOutput(dom.styleOutput);
}

function formatDraftInline(text = "") {
  return escapeHtml(String(text || "")).replace(
    /(【(?:引导|待补充|模板)[^】]*】)/g,
    '<span class="guide-text">$1</span>',
  );
}

function splitDraftIntoSections(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDraftSectionWeight(section = "") {
  return String(section)
    .split("\n")
    .reduce((total, line) => {
      const trimmed = line.trim();
      if (!trimmed) return total;
      return total + Math.max(1, Math.ceil(trimmed.length / 28)) + (/^#{1,3}\s/.test(trimmed) ? 2 : 0);
    }, 0);
}

function buildStructuredDraftHtml(text = "") {
  const normalizedText = String(text || "").replace(/\r/g, "").trim();
  if (!normalizedText) {
    return "";
  }

  const blocks = [];
  const listItems = [];
  let listTag = "";

  function flushList() {
    if (!listItems.length || !listTag) return;
    blocks.push(`<${listTag}>${listItems.map((item) => `<li>${formatDraftInline(item)}</li>`).join("")}</${listTag}>`);
    listItems.length = 0;
    listTag = "";
  }

  normalizedText.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (/^[-*•]\s+/.test(trimmed)) {
      if (listTag !== "ul") {
        flushList();
        listTag = "ul";
      }
      listItems.push(trimmed.replace(/^[-*•]\s+/, ""));
      return;
    }

    if (orderedMatch) {
      if (listTag !== "ol") {
        flushList();
        listTag = "ol";
      }
      listItems.push(orderedMatch[1]);
      return;
    }

    flushList();

    if (/^###\s+/.test(trimmed)) {
      blocks.push(`<h4>${formatDraftInline(trimmed.replace(/^###\s+/, ""))}</h4>`);
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      blocks.push(`<h3>${formatDraftInline(trimmed.replace(/^##\s+/, ""))}</h3>`);
      return;
    }

    if (/^#\s+/.test(trimmed)) {
      blocks.push(`<h2>${formatDraftInline(trimmed.replace(/^#\s+/, ""))}</h2>`);
      return;
    }

    const paragraphTagMatch = trimmed.match(/^\[(\d{4})\]\s*(.*)$/);
    if (paragraphTagMatch) {
      blocks.push(`
        <p class="draft-number-line">
          <span class="draft-number-tag">[${paragraphTagMatch[1]}]</span>
          <span>${formatDraftInline(paragraphTagMatch[2] || "")}</span>
        </p>
      `);
      return;
    }

    blocks.push(`<p>${formatDraftInline(trimmed)}</p>`);
  });

  flushList();
  return blocks.join("");
}

function buildDraftSpreadHtml(text = "", pageCount = 2) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    return "";
  }

  const sections = splitDraftIntoSections(normalizedText);
  const totalWeight = sections.reduce((sum, section) => sum + getDraftSectionWeight(section), 0) || 1;
  const targetWeight = Math.max(1, Math.ceil(totalWeight / Math.max(pageCount, 1)));
  const pages = Array.from({ length: Math.max(pageCount, 1) }, () => []);
  let pageIndex = 0;
  let currentWeight = 0;

  sections.forEach((section) => {
    const sectionWeight = getDraftSectionWeight(section);
    if (pageIndex < pages.length - 1 && currentWeight > 0 && currentWeight + sectionWeight > targetWeight) {
      pageIndex += 1;
      currentWeight = 0;
    }
    pages[pageIndex].push(section);
    currentWeight += sectionWeight;
  });

  return `
    <div class="draft-spread">
      ${pages
        .map((pageSections, index) => {
          const pageHtml = buildStructuredDraftHtml(pageSections.join("\n\n"));
          return `
            <article class="draft-sheet">
              <div class="draft-sheet-mark" data-page-label="A4 ${index + 1}" aria-hidden="true"></div>
              <div class="draft-sheet-body">${pageHtml || '<p class="draft-empty-note">本页暂无内容</p>'}</div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function stripLeadingMarkdownHeading(text = "", headingPattern) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.length && headingPattern.test(lines[0].trim())) {
    lines.shift();
  }
  return lines.join("\n").trim();
}

function splitTemplateDocumentParts(text = "") {
  const normalizedText = String(text || "").replace(/\r/g, "").trim();
  if (!normalizedText) return null;

  const lines = normalizedText.split("\n");
  const titleLines = [];
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    if (/^##\s+/.test(line.trim())) {
      currentSection = { heading: line.trim().replace(/^##\s+/, ""), lines: [line] };
      sections.push(currentSection);
      return;
    }

    if (currentSection) {
      currentSection.lines.push(line);
      return;
    }

    if (line.trim()) {
      titleLines.push(line.trim().replace(/^#\s+/, ""));
    }
  });

  const abstractSection = sections.find((section) => /说明书摘要|摘要/.test(section.heading));
  const claimsIndex = sections.findIndex((section) => /权利要求/.test(section.heading));
  const specSections = sections.filter((section, index) => section !== abstractSection && (claimsIndex < 0 || index < claimsIndex));
  const claimsSection = claimsIndex >= 0 ? sections[claimsIndex] : null;

  if (!abstractSection && !specSections.length && !claimsSection) {
    return null;
  }

  return {
    title: titleLines[0] || "",
    abstractText: stripLeadingMarkdownHeading(abstractSection?.lines.join("\n") || "", /^##\s*(说明书摘要|摘要)\s*$/),
    specificationText: specSections.map((section) => section.lines.join("\n")).join("\n\n").trim(),
    claimsText: stripLeadingMarkdownHeading(claimsSection?.lines.join("\n") || "", /^##\s*权利要求书?\s*$/),
  };
}

function buildTemplatePartCard(label, hint, text = "", className = "") {
  return `
    <article class="template-part-card ${className}">
      <div class="template-part-head">
        <span>${escapeHtml(hint)}</span>
        <h3>${escapeHtml(label)}</h3>
      </div>
      <div class="draft-sheet-body">
        ${buildStructuredDraftHtml(text) || '<p class="draft-empty-note">暂无内容</p>'}
      </div>
    </article>
  `;
}

function formatTemplateOutputHtml(text = "") {
  const parts = splitTemplateDocumentParts(text);
  if (!parts) {
    return buildDraftSpreadHtml(text, 2);
  }

  return `
    <div class="template-document-parts">
      ${parts.title ? `<div class="draft-document-title">${escapeHtml(parts.title)}</div>` : ""}
      ${buildTemplatePartCard("说明书摘要", "单独文书", parts.abstractText, "template-part-abstract")}
      ${buildTemplatePartCard("说明书", "单独文书", parts.specificationText, "template-part-specification")}
      ${buildTemplatePartCard("权利要求书", "单独文书", parts.claimsText, "template-part-claims")}
    </div>
  `;
}

function renderPanelState(element, html, emptyText) {
  if (!element) return;
  if (!html) {
    element.classList.add("empty-state");
    element.textContent = emptyText;
    return;
  }

  element.classList.remove("empty-state");
  element.innerHTML = html;
}

function normalizeBackgroundEntry(entry = {}, type = "paper", index = 0) {
  return {
    title: String(entry.title || "").trim() || `${type === "paper" ? "论文" : "专利"}线索 ${index + 1}`,
    source: String(entry.source || entry.venue || entry.journal || "").trim(),
    year: String(entry.year || "").trim(),
    doi: String(entry.doi || entry.DOI || "").trim(),
    sourceUrl: String(entry.sourceUrl || entry.link || entry.url || "").trim(),
    publicationNumber: String(entry.publicationNumber || entry.publicNumber || "").trim(),
    applicant: String(entry.applicant || entry.assignee || "").trim(),
    publicationDate: String(entry.publicationDate || entry.date || "").trim(),
    relevance: String(entry.relevance || entry.relevanceNote || "").trim(),
    innovationPoints: normalizeList(entry.innovationPoints),
    methodSteps: normalizeList(entry.methodSteps),
    claimFocus: normalizeList(entry.claimFocus),
  };
}

function getBackgroundPaperEntries(background = {}) {
  const entries = Array.isArray(background.paperEntries)
    ? background.paperEntries.map((entry, index) => normalizeBackgroundEntry(entry, "paper", index))
    : [];
  return entries.filter((entry) => entry.sourceUrl || entry.doi);
}

function getBackgroundPatentEntries(background = {}) {
  const entries = Array.isArray(background.patentEntries)
    ? background.patentEntries.map((entry, index) => normalizeBackgroundEntry(entry, "patent", index))
    : [];
  return entries.filter((entry) => entry.sourceUrl || entry.publicationNumber);
}

function renderBackgroundOverview(background) {
  const breakdown = background?.keywordBreakdown || {};
  const constraints = normalizeList(breakdown.constraints);

  renderPanelState(
    dom.backgroundOverview,
    `
      <div class="background-metric-grid">
        <div class="metric-box">
          <strong>研究对象</strong>
          <span>${escapeHtml(breakdown.coreObject || "待补充")}</span>
        </div>
        <div class="metric-box">
          <strong>核心方法</strong>
          <span>${escapeHtml(breakdown.coreMethod || "待补充")}</span>
        </div>
        <div class="metric-box">
          <strong>应用场景</strong>
          <span>${escapeHtml(breakdown.applicationScenario || "待补充")}</span>
        </div>
        <div class="metric-box">
          <strong>技术方向</strong>
          <span>${escapeHtml(background?.domain || "待补充")}</span>
        </div>
      </div>
      <div class="context-card">
        <strong>拆题说明</strong>
        <p>${escapeHtml(breakdown.decompositionSummary || "这里会解释这次检索是怎么拆题的。")}</p>
      </div>
      <div class="context-card">
        <strong>约束条件</strong>
        <p>${constraints.length ? constraints.map(escapeHtml).join(" / ") : "暂时没有识别出明确约束，可以继续补性能指标、部署条件或成本限制。"}</p>
      </div>
    `,
    "这里会先把标题拆成对象、方法、场景和约束。",
  );
}

function renderBackgroundKeywords(background) {
  const zhKeywords = normalizeList(background?.expandedKeywords?.zh);
  const enKeywords = normalizeList(background?.expandedKeywords?.en);
  const ipcHints = normalizeList(background?.searchStrings?.ipcHints);

  renderPanelState(
    dom.backgroundKeywords,
    `
      <div class="background-chip-group">
        <strong>中文关键词</strong>
        <div class="chip-row">${zhKeywords.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("") || '<span class="chip">待补充</span>'}</div>
      </div>
      <div class="background-chip-group">
        <strong>英文关键词</strong>
        <div class="chip-row">${enKeywords.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("") || '<span class="chip">待补充</span>'}</div>
      </div>
      <div class="background-chip-group">
        <strong>IPC / CPC 线索</strong>
        <div class="chip-row">${ipcHints.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("") || '<span class="chip">待补充</span>'}</div>
      </div>
    `,
    "这里会显示中文词、英文词和分类号线索。",
  );
}

function renderBackgroundSearchPlan(background) {
  const patentSources = normalizeList(background?.searchSourcePriorities?.patents);
  const paperSources = normalizeList(background?.searchSourcePriorities?.papers);
  const searchStrings = background?.searchStrings || {};
  const sourceChecklist = normalizeList(background?.sourceChecklist);
  const rows = [
    ["中文专利宽检索", searchStrings.patentCnWide],
    ["中文专利窄检索", searchStrings.patentCnNarrow],
    ["国际专利检索", searchStrings.patentGlobal],
    ["论文宽检索", searchStrings.paperWide],
    ["论文窄检索", searchStrings.paperNarrow],
    ["论文综合检索", searchStrings.paper],
  ];

  renderPanelState(
    dom.backgroundSearchPlan,
    `
      <div class="background-query-list">
        ${rows
          .map(
            ([label, value]) => `
              <div class="background-query-row">
                <strong>${escapeHtml(label)}</strong>
                <code>${escapeHtml(value || "待补充")}</code>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="background-source-grid">
        <div class="context-card">
          <strong>专利优先库</strong>
          <p>${patentSources.length ? patentSources.map(escapeHtml).join(" / ") : "Google Patents / Espacenet / WIPO PATENTSCOPE / CNIPA"}</p>
        </div>
        <div class="context-card">
          <strong>论文优先库</strong>
          <p>${paperSources.length ? paperSources.map(escapeHtml).join(" / ") : "Google Scholar / Semantic Scholar / Crossref / CNKI"}</p>
        </div>
      </div>
      <div class="context-card">
        <strong>后续怎么查</strong>
        <ul class="background-bullet-list">
          ${sourceChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `,
    "这里会给出宽检索、窄检索和推荐数据库。",
  );
}

function renderBackgroundCommonPracticeV2(background) {
  const profiles = normalizeList(background?.knownApproaches).map((item, index) => inferApproachProfile(item, index));

  renderPanelState(
    dom.backgroundCommonPractice,
    profiles.length
      ? `<div class="background-detail-list">
          ${profiles
            .map(
              (profile, index) => `
                <details class="background-detail" ${index === 0 ? "open" : ""}>
                  <summary>${escapeHtml(profile.paperTitle)}</summary>
                  <div class="background-detail-body">
                    <p><strong>这条路线一般在干什么：</strong>${escapeHtml(profile.innovation)}</p>
                    <p><strong>每部分在干什么：</strong></p>
                    <ol class="background-step-list">
                      ${profile.paperSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                    </ol>
                    <p><strong>常见权利切入点：</strong>${escapeHtml((profile.claimFocus || [])[0] || "围绕关键模块、判定条件和联动动作继续细化。")}</p>
                  </div>
                </details>
              `,
            )
            .join("")}
        </div>`
      : "",
    "这里会用通俗语言解释常见技术路线和每部分的作用。",
  );
}

function renderBackgroundEntryList(element, entries, type) {
  renderPanelState(
    element,
    entries.length
      ? `<div class="background-detail-list">
          ${entries
            .map(
              (entry, index) => `
                <details class="background-detail" ${index === 0 ? "open" : ""}>
                  <summary>${escapeHtml(entry.title)}</summary>
                  <div class="background-detail-body">
                    <p><strong>${type === "paper" ? "来源" : "专利信息"}：</strong>${
                      type === "paper"
                        ? escapeHtml(
                            [
                              entry.source,
                              entry.year,
                              entry.doi ? `DOI：${entry.doi}` : "",
                            ]
                              .filter(Boolean)
                              .join("；") || "待补充",
                          )
                        : escapeHtml(
                            [
                              entry.publicationNumber,
                              entry.applicant,
                              entry.publicationDate,
                            ]
                              .filter(Boolean)
                              .join("；") || "待补充",
                          )
                    }${
                      entry.sourceUrl
                        ? ` <a href="${escapeAttribute(entry.sourceUrl)}" target="_blank" rel="noopener noreferrer">打开链接</a>`
                        : ""
                    }</p>
                    <p><strong>相关性：</strong>${escapeHtml(entry.relevance || "待补充")}</p>
                    <p><strong>创新点：</strong>${escapeHtml(entry.innovationPoints.join("；") || "待补充")}</p>
                    <p><strong>${type === "paper" ? "方法步骤" : "方法或流程"}：</strong></p>
                    <ol class="background-step-list">
                      ${entry.methodSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                    </ol>
                    ${
                      type === "patent"
                        ? `<p><strong>对应权利焦点：</strong></p>
                           <ul class="background-bullet-list">
                             ${entry.claimFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>待补充</li>"}
                           </ul>`
                        : ""
                    }
                  </div>
                </details>
              `,
            )
            .join("")}
        </div>`
      : "",
    type === "paper" ? "这里会列出论文方法路线和创新点。" : "这里会列出专利方法路线、创新点和对应权利焦点。",
  );
}

function renderBackgroundPainPoints(background) {
  const painPoints = normalizeList(background?.painPoints);

  renderPanelState(
    dom.backgroundPainPoints,
    painPoints.length
      ? `<ul class="background-bullet-list">${painPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "",
    "这里会整理这个领域经常出现的问题和不足。",
  );
}

function renderBackground(background) {
  if (!dom.backgroundOutput) return;
  const normalizedBackground = normalizeBackgroundPackage(background);
  const paperEntries = getBackgroundPaperEntries(normalizedBackground);
  const patentEntries = getBackgroundPatentEntries(normalizedBackground);

  renderBackgroundOverview(normalizedBackground);
  renderBackgroundKeywords(normalizedBackground);
  renderBackgroundSearchPlan(normalizedBackground);
  renderBackgroundCommonPractice(normalizedBackground);
  renderBackgroundEntryList(dom.backgroundPaperResults, paperEntries, "paper");
  renderBackgroundEntryList(dom.backgroundPatentResults, patentEntries, "patent");
  renderBackgroundPainPoints(normalizedBackground);

  dom.backgroundOutput.classList.remove("empty-state");
  dom.backgroundOutput.classList.add("structured-output");
  dom.backgroundOutput.innerHTML = buildStructuredDraftHtml(normalizedBackground.dossierMarkdown);
  animateGeneratedOutput(dom.backgroundOutput);
}

function renderBackgroundCommonPractice(background) {
  const flow = normalizeCommonPracticeFlow(background);
  const hasSteps = Array.isArray(flow?.steps) && flow.steps.length;

  renderPanelState(
    dom.backgroundCommonPractice,
    hasSteps
      ? `
        <div class="background-detail-list">
          <details class="background-detail" open>
            <summary>${escapeHtml(flow.headline || "通用流程总结")}</summary>
            <div class="background-detail-body">
              <p><strong>一句话总结：</strong>${escapeHtml(flow.summary || "待补充")}</p>
              ${flow.explanation ? `<p><strong>这部分在干什么：</strong>${escapeHtml(flow.explanation)}</p>` : ""}
              <ol class="background-step-list">
                ${flow.steps
                  .map(
                    (step) =>
                      `<li><strong>${escapeHtml(step.title || "步骤")}：</strong>${escapeHtml(step.detail || "")}</li>`,
                  )
                  .join("")}
              </ol>
              ${flow.closing ? `<p><strong>落笔提示：</strong>${escapeHtml(flow.closing)}</p>` : ""}
            </div>
          </details>
        </div>
      `
      : "",
    "这里会总结这个领域常见的通用流程，不重复论文路线。",
  );
}

function renderBackgroundPanels(background) {
  const normalizedBackground = normalizeBackgroundPackage(background);
  const paperEntries = getBackgroundPaperEntries(normalizedBackground);
  const patentEntries = getBackgroundPatentEntries(normalizedBackground);

  renderBackgroundOverview(normalizedBackground);
  renderBackgroundKeywords(normalizedBackground);
  renderBackgroundSearchPlan(normalizedBackground);
  renderBackgroundCommonPractice(normalizedBackground);
  renderBackgroundEntryList(dom.backgroundPaperResults, paperEntries, "paper");
  renderBackgroundEntryList(dom.backgroundPatentResults, patentEntries, "patent");
  renderBackgroundPainPoints(normalizedBackground);
}

function renderBackgroundDraft(background) {
  if (!dom.backgroundOutput) return;
  const normalizedBackground = normalizeBackgroundPackage(background);
  dom.backgroundOutput.classList.remove("empty-state");
  dom.backgroundOutput.classList.add("structured-output");
  dom.backgroundOutput.innerHTML = buildStructuredDraftHtml(normalizedBackground.dossierMarkdown);
}

async function streamBackgroundDraft(background) {
  await progressivelyRenderOutput(dom.backgroundOutput, background?.dossierMarkdown || "", {
    formatter: buildStructuredDraftHtml,
    className: "structured-output",
    chunkMode: "section",
  });
}

async function streamStyleProfile(profile) {
  if (!profile?.analysisMarkdown || !dom.styleOutput) {
    renderStyleProfile(profile);
    return;
  }

  await progressivelyRenderOutput(dom.styleOutput, profile.analysisMarkdown, {
    formatter: buildStructuredDraftHtml,
    className: "structured-output",
    chunkMode: "section",
  });
}

async function streamTemplateResult(template) {
  await progressivelyRenderOutput(dom.templateOutput, template?.markdown || "", {
    formatter: formatTemplateOutputHtml,
    chunkMode: "line-group",
  });
}

function renderBackgroundV2(background) {
  renderBackgroundPanels(background);
  renderBackgroundDraft(background);
  [
    dom.backgroundOutput,
    dom.backgroundOverview,
    dom.backgroundKeywords,
    dom.backgroundSearchPlan,
    dom.backgroundCommonPractice,
    dom.backgroundPaperResults,
    dom.backgroundPatentResults,
    dom.backgroundPainPoints,
  ].forEach((element) => animateGeneratedOutput(element));
}

function renderTemplate(template) {
  if (!dom.templateOutput) return;
  dom.templateOutput.classList.remove("empty-state");
  dom.templateOutput.classList.remove("structured-output");
  dom.templateOutput.innerHTML = formatTemplateOutputHtml(template.markdown || "");
  animateGeneratedOutput(dom.templateOutput);
}

function renderWorkspaceOverview() {
  if (!dom.workspaceOverview) return;

  const selectedMaster = getSelectedDistilledMaster();
  const selectedBuilderTemplate = getSelectedBuilderTemplate();

  const items = [
    {
      label: "当前账号",
      value: state.authUser ? (state.authUser.role === "admin" ? "管理员" : "普通用户") : "未登录",
    },
    {
      label: "当前主题",
      value: state.workspace.sourceQuery || state.workspace.title || "还没填写",
    },
    {
      label: "大师模板",
      value: selectedMaster?.name || state.workspace.styleProfile?.displayName || "还没保存",
    },
    {
      label: "背景资料包",
      value: state.workspace.background?.domain || "还没生成",
    },
    {
      label: "搭建器模板",
      value: selectedBuilderTemplate?.name || "还没保存",
    },
    {
      label: "模板来源",
      value:
        state.workspace.templateSourceType === "master"
          ? "大师模板"
          : state.workspace.templateSourceType === "builder"
            ? "模板搭建器"
            : state.workspace.templateSourceType === "uploaded"
              ? "手动上传模板"
              : "系统默认模板",
    },
    {
      label: "风格预设",
      value: getStylePresetById(state.workspace.templateStylePreset || "steady-agent").name,
    },
  ];

  dom.workspaceOverview.innerHTML = items
    .map(
      (item) => `
        <div class="status-box">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </div>
      `,
    )
    .join("");
  animateListItems(dom.workspaceOverview, ".status-box");
}

function renderTemplateContext() {
  if (!dom.templateContext) return;

  const selectedMaster = getSelectedDistilledMaster();
  const selectedBuilderTemplate = getSelectedBuilderTemplate();
  const sourceType = state.workspace.templateSourceType || "default";
  const stylePreset = getStylePresetById(state.workspace.templateStylePreset || "steady-agent");

  const cards = [
    {
      title: "当前风格",
      value:
        sourceType === "master" && selectedMaster?.styleProfile
          ? `${selectedMaster.name} · ${selectedMaster.styleProfile.archetype || "大师模板风格"}`
          : `${stylePreset.name} · ${stylePreset.description}`,
    },
    {
      title: "当前背景资料",
      value: state.workspace.background
        ? `${state.workspace.background.domain} · 已整理通用做法、论文方法与创新点、专利方法与对应权利。`
        : "还没有背景资料，模板底稿会先按模板骨架输出。",
    },
    {
      title: "模板约束",
      value:
        sourceType === "master" && selectedMaster?.templateContent
          ? `已选择大师模板 ${selectedMaster.name}，生成时会优先严格沿用其标题、段落顺序和模板骨架。`
          : sourceType === "builder" && selectedBuilderTemplate?.content
            ? `已选择搭建器模板 ${selectedBuilderTemplate.name}，生成时会优先严格沿用其模块顺序和占位逻辑。`
            : state.workspace.customTemplateContent
              ? `已加载 ${state.workspace.customTemplateName || "手动粘贴模板"}，生成时会严格优先沿用它的结构。`
              : "当前未指定外部模板，将使用系统默认模板骨架。",
    },
    {
      title: "输出策略",
      value:
        state.workspace.blankMode === "guided"
          ? "保留引导：会用红色提示每一部分该写什么。"
          : "保留空白：只保留骨架和空位，不代写创新细节。",
    },
  ];

  dom.templateContext.innerHTML = cards
    .map(
      (card) => `
        <article class="context-card">
          <strong>${escapeHtml(card.title)}</strong>
          <p>${escapeHtml(card.value)}</p>
        </article>
      `,
    )
    .join("");
  animateListItems(dom.templateContext, ".context-card");
}

function renderDistilledMastersLibrary() {
  const masters = getDistilledMasters();
  const searchKeyword = String(dom.styleMasterSearch?.value || "")
    .trim()
    .toLowerCase();
  const filteredMasters = searchKeyword
    ? masters.filter((item) =>
        JSON.stringify([
          item.name,
          item.displayName,
          item.toneSummary,
          item.templateContent,
          item.analysisMarkdown,
        ])
          .toLowerCase()
          .includes(searchKeyword),
      )
    : masters;
  if (dom.masterSelect) {
    const preferredSelection = masters.find((item) => item.id === state.workspace.selectedDistilledMasterId);
    const visibleMasters =
      preferredSelection && filteredMasters.length && !filteredMasters.some((item) => item.id === preferredSelection.id)
        ? [preferredSelection, ...filteredMasters]
        : filteredMasters;
    dom.masterSelect.innerHTML = visibleMasters.length
      ? visibleMasters
          .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`)
          .join("")
      : masters.length
        ? '<option value="">没有匹配的大师模板</option>'
        : '<option value="">还没有保存的大师模板</option>';
    dom.masterSelect.value = state.workspace.selectedDistilledMasterId && visibleMasters.some((item) => item.id === state.workspace.selectedDistilledMasterId)
      ? state.workspace.selectedDistilledMasterId
      : visibleMasters[0]?.id || "";
  }

  if (!state.workspace.selectedDistilledMasterId && masters[0]) {
    state.workspace.selectedDistilledMasterId = masters[0].id;
  }

  if (dom.distilledMastersList) {
    dom.distilledMastersList.innerHTML = filteredMasters.length
      ? filteredMasters
          .map(
            (item) => `
              <article class="context-card context-card-shell ${item.id === state.workspace.selectedDistilledMasterId ? "is-selected-card" : ""}">
                <button
                  type="button"
                  class="context-card-button context-card-main"
                  data-master-id="${escapeAttribute(item.id)}"
                >
                  <div class="card-chip-row">
                    <strong>${escapeHtml(item.name)}</strong>
                    ${item.id === state.workspace.selectedDistilledMasterId ? '<span class="card-chip">当前选中</span>' : ""}
                  </div>
                  <p>${escapeHtml(item.styleProfile?.toneSummary || "模板 + 写作风格")}</p>
                </button>
                <button
                  type="button"
                  class="mini-button danger-button delete-master-inline"
                  data-delete-master-id="${escapeAttribute(item.id)}"
                >
                  删除
                </button>
              </article>
            `,
          )
          .join("")
      : masters.length
        ? '<article class="context-card"><strong>没有匹配结果</strong><p>换一个检索词，或者直接从下拉栏选择已有大师模板。</p></article>'
        : '<article class="context-card"><strong>还没有保存的大师模板</strong><p>先上传摘要、说明书和权利要求书，再点“解析并保存为大师模板”。</p></article>';
  }

  if (dom.deleteMasterButton) {
    dom.deleteMasterButton.disabled = !masters.length || !state.workspace.selectedDistilledMasterId;
  }
}

function applySelectedDistilledMaster(masterId, { persist = true, stream = false, statusText = "", tone = "success" } = {}) {
  const selected = getDistilledMasters().find((item) => item.id === masterId);
  if (!selected) {
    setStyleStatus("还没有可选的大师模板。先做一次蒸馏保存。", "neutral");
    return null;
  }

  state.workspace.selectedDistilledMasterId = selected.id;
  state.workspace.styleMasterName = selected.name || "";
  state.workspace.styleAbstractText = selected.abstractText || "";
  state.workspace.styleSpecificationText = selected.specificationText || "";
  state.workspace.styleClaimsText = selected.claimsText || "";
  state.workspace.styleProfile = getRenderableStyleProfile(selected);

  fillSharedFields({ restoreTextInputs: true });
  renderDistilledMastersLibrary();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();

  if (stream) {
    streamStyleProfile(state.workspace.styleProfile).catch((error) => {
      console.error(error);
      renderStyleProfile(state.workspace.styleProfile);
    });
  } else {
    renderStyleProfile(state.workspace.styleProfile);
  }

  if (persist) {
    scheduleWorkspaceSave();
  }

  setStyleStatus(
    statusText || `已选中大师模板：${selected.name}。左侧已带出原始材料，右侧显示这套模板的蒸馏结果。`,
    tone,
  );
  return selected;
}

async function deleteDistilledMaster(masterId, { silent = false } = {}) {
  const masters = getDistilledMasters();
  const target = masters.find((item) => item.id === masterId);
  if (!target) {
    if (!silent) {
      setStyleStatus("没有找到要删除的大师模板。", "error");
    }
    return false;
  }

  const nextMasters = masters.filter((item) => item.id !== masterId);
  state.workspace.distilledMasters = nextMasters;

  if (state.workspace.selectedDistilledMasterId === masterId) {
    state.workspace.selectedDistilledMasterId = nextMasters[0]?.id || "";
  }

  await persistWorkspaceNow();
  renderDistilledMastersLibrary();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();

  if (state.workspace.selectedDistilledMasterId) {
    applySelectedDistilledMaster(state.workspace.selectedDistilledMasterId, {
      persist: false,
      stream: false,
      statusText: `已删除大师模板：${target.name}。`,
      tone: "success",
    });
  } else {
    state.workspace.styleProfile = null;
    resetOutputBlock(dom.styleOutput, "上传材料后，这里会显示蒸馏结果和已保存大师模板内容。");
    setStyleStatus(`已删除大师模板：${target.name}。当前没有已保存模板了。`, "success");
  }

  return true;
}

function renderBuilderTemplateLibrary() {
  const templates = getBuilderSavedTemplates();
  if (dom.selectedBuilderTemplateId) {
    dom.selectedBuilderTemplateId.innerHTML = templates.length
      ? templates
          .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`)
          .join("")
      : '<option value="">还没有保存的搭建器模板</option>';
    dom.selectedBuilderTemplateId.value =
      state.workspace.selectedBuilderTemplateId && templates.some((item) => item.id === state.workspace.selectedBuilderTemplateId)
        ? state.workspace.selectedBuilderTemplateId
        : templates[0]?.id || "";
  }

  if (!state.workspace.selectedBuilderTemplateId && templates[0]) {
    state.workspace.selectedBuilderTemplateId = templates[0].id;
  }

  if (dom.builderSavedTemplates) {
    dom.builderSavedTemplates.innerHTML = templates.length
      ? templates
          .map(
            (item) => `
              <article class="context-card ${item.id === state.workspace.selectedBuilderTemplateId ? "is-selected-card" : ""}">
                <strong>${escapeHtml(item.name)}</strong>
                <p>共 ${escapeHtml(String(item.content.split("\n").filter((line) => line.trim()).length))} 行模板骨架，可在模板工坊里直接选用。</p>
              </article>
            `,
          )
          .join("")
      : '<article class="context-card"><strong>还没有保存的搭建器模板</strong><p>先在画布里搭好结构，再点“保存模板”。</p></article>';
  }
}

function renderTemplateSourceSelectors() {
  const masters = getDistilledMasters();
  const builderTemplates = getBuilderSavedTemplates();
  if (dom.selectedMasterTemplateId) {
    dom.selectedMasterTemplateId.innerHTML = masters.length
      ? masters.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`).join("")
      : '<option value="">还没有可选大师模板</option>';
    dom.selectedMasterTemplateId.value =
      state.workspace.selectedDistilledMasterId && masters.some((item) => item.id === state.workspace.selectedDistilledMasterId)
        ? state.workspace.selectedDistilledMasterId
        : masters[0]?.id || "";
  }

  if (dom.templateStylePreset) {
    dom.templateStylePreset.innerHTML = STYLE_PRESET_LIBRARY.map(
      (item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`,
    ).join("");
    dom.templateStylePreset.value = state.workspace.templateStylePreset || STYLE_PRESET_LIBRARY[0].id;
  }

  renderBuilderTemplateLibrary();

  if (dom.templateSourceNote) {
    const sourceType = state.workspace.templateSourceType || "default";
    const selectedMaster = getSelectedDistilledMaster();
    const selectedBuilderTemplate = getSelectedBuilderTemplate();
    dom.templateSourceNote.textContent =
      sourceType === "master" && selectedMaster
        ? `已选大师模板：${selectedMaster.name}。这一类模板同时携带“模板骨架 + 写作风格”，生成时会优先严格跟随。`
        : sourceType === "builder" && selectedBuilderTemplate
          ? `已选搭建器模板：${selectedBuilderTemplate.name}。这一类模板只有骨架，没有写作风格，需要再搭配右侧风格预设。`
          : sourceType === "uploaded"
            ? "当前会严格优先使用你上传或粘贴的模板骨架；写作风格则来自右侧风格预设。"
            : "当前使用系统默认模板骨架。";
    dom.templateSourceNote.dataset.tone = sourceType === "default" ? "neutral" : "success";
  }
}

function setBuilderStatus(text, tone = "neutral") {
  if (!dom.builderStatus) return;
  dom.builderStatus.textContent = text;
  dom.builderStatus.dataset.tone = tone;
}

function getBuilderModules() {
  state.workspace.templateBuilderModules = normalizeBuilderNodes(state.workspace.templateBuilderModules);
  return state.workspace.templateBuilderModules;
}

function ensureBuilderSelection() {
  const modules = getBuilderModules();
  if (!modules.length) {
    activeBuilderModuleId = "";
    return null;
  }

  const active = modules.find((module) => module.id === activeBuilderModuleId);
  if (active) {
    return active;
  }

  activeBuilderModuleId = modules[0].id;
  return modules[0];
}

function buildTemplateFromBuilder() {
  const modules = getBuilderModules();
  const chunks = [];
  const templateName = String(state.workspace.templateBuilderName || "").trim();
  let paragraphIndex = 0;

  if (templateName) {
    chunks.push(`# ${templateName}`);
  }

  for (const module of modules) {
    if (module.type === BUILDER_MODULE_TYPES.heading) {
      const levelPrefix = module.level === "document" ? "#" : module.level === "section" ? "###" : "##";
      chunks.push(`${levelPrefix} ${module.title || "未命名标题"}`.trim());
      if (module.note) {
        chunks.push(`> 备注：${module.note}`);
      }
      continue;
    }

    if (module.type === BUILDER_MODULE_TYPES.content) {
      chunks.push(`## ${module.blockTitle || "未命名内容块"}`);
      if (module.summary) {
        chunks.push(`本节说明：${module.summary}`);
      }

      const keyPoints = String(module.keyPoints || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

      if (keyPoints.length) {
        if (module.blockStyle === "checklist") {
          chunks.push(...keyPoints.map((item) => `- ${item}`));
        } else {
          chunks.push("建议覆盖：");
          chunks.push(...keyPoints.map((item, index) => `${index + 1}. ${item}`));
        }
      }
      continue;
    }

    const prefix = padParagraphIndex(paragraphIndex);
    paragraphIndex += 1;
    const sentenceParts = [];
    if (module.topic) {
      sentenceParts.push(`本段用于说明${module.topic}`);
    }
    if (module.guidance) {
      sentenceParts.push(`建议围绕${module.guidance}展开`);
    }
    if (module.keywords) {
      sentenceParts.push(`可优先覆盖关键词：${module.keywords}`);
    }
    if (module.placeholder) {
      sentenceParts.push(`具体内容占位：${module.placeholder}`);
    }
    chunks.push(`${prefix} ${sentenceParts.join("；")}。`.replace("。。", "。"));
  }

  return chunks.join("\n\n").trim();
}

function buildTemplateFromBuilderV2() {
  const modules = getBuilderModules();
  const chunks = [];
  const templateName = String(state.workspace.templateBuilderName || "").trim();
  let paragraphIndex = 0;
  const childMap = new Map();

  for (const module of modules) {
    const parentId = String(module.parentId || "");
    if (!childMap.has(parentId)) {
      childMap.set(parentId, []);
    }
    childMap.get(parentId).push(module);
  }

  const getChildren = (parentId) => childMap.get(String(parentId || "")) || [];
  const ensureSentenceEnd = (text) => {
    const value = String(text || "").trim();
    if (!value) return "";
    return /[。！？；.]$/.test(value) ? value : `${value}。`;
  };

  const buildSentenceText = (sentence) => ensureSentenceEnd(sentence.content || sentence.note || "【在这里填写一句具体内容】");
  const buildParagraphText = (paragraph) => {
    const sentences = getChildren(paragraph.id).filter((item) => item.type === BUILDER_MODULE_TYPES.sentence);
    if (sentences.length) {
      return sentences.map(buildSentenceText).join("");
    }

    if (String(paragraph.paragraphContent || "").trim()) {
      return ensureSentenceEnd(paragraph.paragraphContent);
    }

    const fallbackParts = [paragraph.topic, paragraph.guidance].map((item) => String(item || "").trim()).filter(Boolean);
    return ensureSentenceEnd(fallbackParts.join("，") || "【在这里补充本段整体内容】");
  };

  if (templateName) {
    chunks.push(`# ${templateName}`);
  }

  const rootModules = getChildren("");
  for (const heading of rootModules) {
    if (heading.type !== BUILDER_MODULE_TYPES.heading) continue;

    const levelPrefix = heading.level === "document" ? "#" : heading.level === "section" ? "###" : "##";
    chunks.push(`${levelPrefix} ${heading.title || "未命名标题"}`.trim());
    if (heading.note) {
      chunks.push(`> 备注：${heading.note}`);
    }

    for (const child of getChildren(heading.id)) {
      if (child.type === BUILDER_MODULE_TYPES.paragraph) {
        chunks.push(`${padParagraphIndex(paragraphIndex)} ${buildParagraphText(child)}`);
        paragraphIndex += 1;
        continue;
      }

      if (child.type === BUILDER_MODULE_TYPES.sentence) {
        chunks.push(`${padParagraphIndex(paragraphIndex)} ${buildSentenceText(child)}`);
        paragraphIndex += 1;
      }
    }
  }

  return chunks.join("\n\n").trim();
}

function renderBuilderPreview() {
  if (!dom.builderPreview) return;

  const output = buildTemplateFromBuilderV2();
  if (!output) {
    dom.builderPreview.classList.add("empty-state");
    dom.builderPreview.classList.remove("structured-output");
    dom.builderPreview.textContent = "画布里的模块会在这里实时拼成模板正文。";
    return;
  }

  dom.builderPreview.classList.remove("empty-state");
  dom.builderPreview.classList.add("structured-output");
  dom.builderPreview.innerHTML = buildStructuredDraftHtml(output);
}

function renderBuilderDropSlot(index, { empty = false } = {}) {
  const slotClassName = empty ? "builder-drop-slot is-empty" : "builder-drop-slot";
  const title = empty ? "从这里开始搭模板" : "插入到这里";
  const description = empty
    ? "不用只靠拖拽，直接点下面按钮也能往画布里插入模块。"
    : "支持拖拽插入，也支持直接点击按钮插入。";

  return `
    <div class="${slotClassName}" data-builder-drop-index="${index}">
      <div class="builder-drop-slot-copy">
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
      <div class="builder-drop-slot-actions">
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.heading}" data-builder-insert-index="${index}">插入标题</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.content}" data-builder-insert-index="${index}">插入内容</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.paragraph}" data-builder-insert-index="${index}">插入段落</button>
      </div>
    </div>
  `;
}

function hydrateBuilderDropSlots() {
  if (!dom.builderCanvas) return;

  dom.builderCanvas.querySelectorAll("[data-builder-drop-index]").forEach((slot) => {
    const dropIndex = Number(slot.dataset.builderDropIndex || 0);
    const empty = slot.classList.contains("is-empty");
    const title = empty ? "从这里开始搭模板" : "插入到这里";
    const description = empty
      ? "不用只靠拖拽，直接点下面按钮也能往画布里插入模块。"
      : "支持拖拽插入，也支持直接点击按钮插入。";

    slot.innerHTML = `
      <div class="builder-drop-slot-copy">
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
      <div class="builder-drop-slot-actions">
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.heading}" data-builder-insert-index="${dropIndex}">插入标题</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.content}" data-builder-insert-index="${dropIndex}">插入内容</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.paragraph}" data-builder-insert-index="${dropIndex}">插入段落</button>
      </div>
    `;
  });
}

function compactBuilderDropSlots() {
  if (!dom.builderCanvas) return;

  dom.builderCanvas.querySelectorAll(".builder-drop-slot:not(.is-empty)").forEach((slot) => {
    const dropIndex = Number(slot.dataset.builderDropIndex || 0);
    slot.classList.add("is-inline");
    slot.innerHTML = `
      <div class="builder-drop-slot-inline-copy">+ 插入模块</div>
      <div class="builder-drop-slot-actions">
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.heading}" data-builder-insert-index="${dropIndex}">标题</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.content}" data-builder-insert-index="${dropIndex}">内容</button>
        <button class="mini-button" type="button" data-builder-insert="${BUILDER_MODULE_TYPES.paragraph}" data-builder-insert-index="${dropIndex}">段落</button>
      </div>
    `;
  });
}

function renderBuilderCanvas() {
  if (!dom.builderCanvas) return;

  const modules = getBuilderModules();
  ensureBuilderSelection();

  if (!modules.length) {
    dom.builderCanvas.innerHTML = `
      <div class="builder-drop-slot is-empty" data-builder-drop-index="0">
        把左侧模块拖到这里，或者点击左侧模块直接追加到画布。
      </div>
    `;
    hydrateBuilderDropSlots();
    compactBuilderDropSlots();
    return;
  }

  dom.builderCanvas.innerHTML = modules
    .map(
      (module, index) => `
        <div class="builder-drop-slot" data-builder-drop-index="${index}">拖到这里插入</div>
        <article
          class="builder-module-card ${module.id === activeBuilderModuleId ? "is-active" : ""}"
          draggable="true"
          data-builder-module-id="${escapeAttribute(module.id)}"
        >
          <div class="builder-module-head">
            <div>
              <span class="module-badge">${escapeHtml(getBuilderTypeLabel(module.type))}</span>
              <strong>${escapeHtml(getBuilderSummary(module))}</strong>
            </div>
            <div class="builder-module-actions">
              <button class="mini-button" type="button" data-builder-duplicate="${escapeAttribute(module.id)}">复制</button>
              <button class="mini-button" type="button" data-builder-delete="${escapeAttribute(module.id)}">删除</button>
            </div>
          </div>
          <p class="output-meta">${escapeHtml(
            module.type === BUILDER_MODULE_TYPES.heading
              ? module.note || "点击后可设置标题层级和备注"
              : module.type === BUILDER_MODULE_TYPES.content
                ? module.summary || "点击后可设置这一节要写什么"
                : module.guidance || "点击后可设置段落主题和说明",
          )}</p>
        </article>
      `,
    )
    .concat(`<div class="builder-drop-slot" data-builder-drop-index="${modules.length}">拖到这里插入</div>`)
    .join("");
  hydrateBuilderDropSlots();
  compactBuilderDropSlots();
}

function renderBuilderSettings() {
  if (!dom.builderSettingsPanel) return;

  const activeModule = ensureBuilderSelection();
  if (!activeModule) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="context-card">
        <strong>还没有选中模块</strong>
        <p>先往画布里添加一个模块，再在这里设置详细内容。</p>
      </article>
    `;
    return;
  }

  if (activeModule.type === BUILDER_MODULE_TYPES.heading) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Heading</p>
            <h2>标题模块设置</h2>
          </div>
        </div>
        <div class="form-grid single-column">
          <label>
            <span>标题名称</span>
            <input class="text-input" data-builder-field="title" value="${escapeAttribute(activeModule.title)}" />
          </label>
          <label>
            <span>标题层级</span>
            <select class="text-input" data-builder-field="level">
              <option value="document" ${activeModule.level === "document" ? "selected" : ""}>文档总标题</option>
              <option value="chapter" ${activeModule.level === "chapter" ? "selected" : ""}>一级标题</option>
              <option value="section" ${activeModule.level === "section" ? "selected" : ""}>二级标题</option>
            </select>
          </label>
          <label>
            <span>备注说明</span>
            <textarea class="text-area compact" data-builder-field="note" placeholder="例如：这一节只写背景技术，不写效果。">${escapeHtml(activeModule.note)}</textarea>
          </label>
        </div>
      </article>
    `;
    return;
  }

  if (activeModule.type === BUILDER_MODULE_TYPES.content) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Content</p>
            <h2>内容模块设置</h2>
          </div>
        </div>
        <div class="form-grid">
          <label>
            <span>小节名称</span>
            <input class="text-input" data-builder-field="blockTitle" value="${escapeAttribute(activeModule.blockTitle)}" />
          </label>
          <label>
            <span>输出样式</span>
            <select class="text-input" data-builder-field="blockStyle">
              <option value="section" ${activeModule.blockStyle === "section" ? "selected" : ""}>说明 + 有序清单</option>
              <option value="checklist" ${activeModule.blockStyle === "checklist" ? "selected" : ""}>说明 + 无序清单</option>
            </select>
          </label>
        </div>
        <label class="full-span">
          <span>本节大概要写什么</span>
          <textarea class="text-area compact" data-builder-field="summary" placeholder="例如：交代现有技术痛点和本发明解决目标。">${escapeHtml(activeModule.summary)}</textarea>
        </label>
        <label class="full-span">
          <span>需要覆盖的关键点（每行一个）</span>
          <textarea class="text-area compact" data-builder-field="keyPoints" placeholder="例如：现有方案缺陷&#10;现有误差来源&#10;本节与后文技术方案的衔接">${escapeHtml(activeModule.keyPoints)}</textarea>
        </label>
      </article>
    `;
    return;
  }

  dom.builderSettingsPanel.innerHTML = `
    <article class="admin-panel">
      <div class="section-head">
        <div>
          <p class="section-tag">Paragraph</p>
          <h2>段落模块设置</h2>
        </div>
      </div>
      <p class="section-note">段落编号会自动从 [0000] 开始递增，你只需要管每段写什么。</p>
      <div class="form-grid single-column">
        <label>
          <span>段落主题</span>
          <input class="text-input" data-builder-field="topic" value="${escapeAttribute(activeModule.topic)}" />
        </label>
        <label>
          <span>内容大概是什么</span>
          <textarea class="text-area compact" data-builder-field="guidance" placeholder="例如：说明传感器布置方式与信号融合逻辑。">${escapeHtml(activeModule.guidance)}</textarea>
        </label>
        <label>
          <span>优先关键词</span>
          <input class="text-input" data-builder-field="keywords" value="${escapeAttribute(activeModule.keywords)}" placeholder="例如：融合判定、阈值、热失控预警" />
        </label>
        <label>
          <span>具体占位提示</span>
          <textarea class="text-area compact" data-builder-field="placeholder" placeholder="例如：在此补充步骤顺序、参数范围和部件连接关系。">${escapeHtml(activeModule.placeholder)}</textarea>
        </label>
      </div>
    </article>
  `;
}

function getBuilderChildren(parentId = "") {
  return getBuilderModules().filter((module) => String(module.parentId || "") === String(parentId || ""));
}

function getBuilderModuleById(moduleId = "") {
  return getBuilderModules().find((module) => module.id === moduleId) || null;
}

function getBuilderNodeDescription(module) {
  if (module.type === BUILDER_MODULE_TYPES.heading) {
    return module.note || "点击后设置标题层级和这一节的说明。";
  }

  if (module.type === BUILDER_MODULE_TYPES.paragraph) {
    return module.guidance || module.paragraphContent || "段落里可以继续添加句子；如果不加句子，也可以直接写整段内容。";
  }

  return module.note || module.content || "这一句写什么内容、承担什么作用，都可以在左侧细调。";
}

function renderBuilderAddBar({ parentId = "", allowedTypes = [BUILDER_MODULE_TYPES.heading], label = "+ 添加模块" } = {}) {
  return `
    <div class="builder-insert-bar" data-builder-insert-parent="${escapeAttribute(parentId)}">
      <span class="builder-insert-label">${escapeHtml(label)}</span>
      <div class="builder-insert-actions">
        ${allowedTypes
          .map(
            (type) =>
              `<button class="mini-button" type="button" data-builder-add-type="${escapeAttribute(type)}" data-builder-add-parent="${escapeAttribute(parentId)}">${escapeHtml(getBuilderTypeLabel(type))}</button>`,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSentenceNode(module) {
  return `
    <article class="builder-node builder-node-sentence ${module.id === activeBuilderModuleId ? "is-active" : ""}" data-builder-module-id="${escapeAttribute(module.id)}">
      <div class="builder-node-head">
        <div>
          <span class="module-badge">${escapeHtml(getBuilderTypeLabel(module.type))}</span>
          <strong>${escapeHtml(getBuilderSummary(module))}</strong>
        </div>
        <div class="builder-module-actions">
          <button class="mini-button" type="button" data-builder-duplicate="${escapeAttribute(module.id)}">复制</button>
          <button class="mini-button" type="button" data-builder-delete="${escapeAttribute(module.id)}">删除</button>
        </div>
      </div>
      <p class="output-meta">${escapeHtml(getBuilderNodeDescription(module))}</p>
    </article>
  `;
}

function renderParagraphNode(module) {
  const sentenceChildren = getBuilderChildren(module.id).filter((item) => item.type === BUILDER_MODULE_TYPES.sentence);
  return `
    <article class="builder-node builder-node-paragraph ${module.id === activeBuilderModuleId ? "is-active" : ""}" data-builder-module-id="${escapeAttribute(module.id)}">
      <div class="builder-node-head">
        <div>
          <span class="module-badge">${escapeHtml(getBuilderTypeLabel(module.type))}</span>
          <strong>${escapeHtml(getBuilderSummary(module))}</strong>
        </div>
        <div class="builder-module-actions">
          <button class="mini-button" type="button" data-builder-duplicate="${escapeAttribute(module.id)}">复制</button>
          <button class="mini-button" type="button" data-builder-delete="${escapeAttribute(module.id)}">删除</button>
        </div>
      </div>
      <p class="output-meta">${escapeHtml(getBuilderNodeDescription(module))}</p>
      <div class="builder-children-stack builder-sentence-stack">
        ${sentenceChildren.map(renderSentenceNode).join("")}
        ${renderBuilderAddBar({
          parentId: module.id,
          allowedTypes: [BUILDER_MODULE_TYPES.sentence],
          label: "+ 在这个段落里添加句子",
        })}
      </div>
    </article>
  `;
}

function renderHeadingNode(module) {
  const children = getBuilderChildren(module.id);
  return `
    <article class="builder-node builder-node-heading ${module.id === activeBuilderModuleId ? "is-active" : ""}" data-builder-module-id="${escapeAttribute(module.id)}">
      <div class="builder-node-head">
        <div>
          <span class="module-badge">${escapeHtml(getBuilderTypeLabel(module.type))}</span>
          <strong>${escapeHtml(getBuilderSummary(module))}</strong>
        </div>
        <div class="builder-module-actions">
          <button class="mini-button" type="button" data-builder-duplicate="${escapeAttribute(module.id)}">复制</button>
          <button class="mini-button" type="button" data-builder-delete="${escapeAttribute(module.id)}">删除</button>
        </div>
      </div>
      <p class="output-meta">${escapeHtml(getBuilderNodeDescription(module))}</p>
      <div class="builder-children-stack">
        ${children
          .map((child) => (child.type === BUILDER_MODULE_TYPES.paragraph ? renderParagraphNode(child) : renderSentenceNode(child)))
          .join("")}
        ${renderBuilderAddBar({
          parentId: module.id,
          allowedTypes: [BUILDER_MODULE_TYPES.paragraph, BUILDER_MODULE_TYPES.sentence],
          label: "+ 在这个标题里添加段落或句子",
        })}
      </div>
    </article>
  `;
}

function renderBuilderCanvasV2() {
  if (!dom.builderCanvas) return;

  const modules = getBuilderModules();
  ensureBuilderSelection();
  const rootHeadings = modules.filter((module) => module.type === BUILDER_MODULE_TYPES.heading && !module.parentId);

  if (!rootHeadings.length) {
    dom.builderCanvas.innerHTML = `
      <div class="builder-empty-shell">
        <div class="builder-drop-slot-copy">
          <strong>先放一个标题框</strong>
          <span>标题是最外层容器，标题里面再放段落，段落里面再放句子。</span>
        </div>
        ${renderBuilderAddBar({
          parentId: "",
          allowedTypes: [BUILDER_MODULE_TYPES.heading],
          label: "+ 添加标题",
        })}
      </div>
    `;
    return;
  }

  dom.builderCanvas.innerHTML = `
    <div class="builder-tree-root">
      ${rootHeadings.map(renderHeadingNode).join("")}
      ${renderBuilderAddBar({
        parentId: "",
        allowedTypes: [BUILDER_MODULE_TYPES.heading],
        label: "+ 添加下一个标题",
      })}
    </div>
  `;
}

function renderBuilderSettingsV2() {
  if (!dom.builderSettingsPanel) return;

  const activeModule = ensureBuilderSelection();
  if (!activeModule) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="context-card">
        <strong>还没有选中模块</strong>
        <p>先添加一个标题，再往标题里放段落和句子。</p>
      </article>
    `;
    return;
  }

  if (activeModule.type === BUILDER_MODULE_TYPES.heading) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Heading</p>
            <h2>标题设置</h2>
          </div>
        </div>
        <div class="form-grid single-column">
          <label>
            <span>标题名称</span>
            <input class="text-input" data-builder-field="title" value="${escapeAttribute(activeModule.title)}" />
          </label>
          <label>
            <span>标题层级</span>
            <select class="text-input" data-builder-field="level">
              <option value="document" ${activeModule.level === "document" ? "selected" : ""}>文档总标题</option>
              <option value="chapter" ${activeModule.level === "chapter" ? "selected" : ""}>一级标题</option>
              <option value="section" ${activeModule.level === "section" ? "selected" : ""}>二级标题</option>
            </select>
          </label>
          <label>
            <span>标题备注</span>
            <textarea class="text-area compact" data-builder-field="note" placeholder="这一节主要写什么、不要写什么">${escapeHtml(activeModule.note)}</textarea>
          </label>
        </div>
      </article>
    `;
    return;
  }

  if (activeModule.type === BUILDER_MODULE_TYPES.paragraph) {
    dom.builderSettingsPanel.innerHTML = `
      <article class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Paragraph</p>
            <h2>段落设置</h2>
          </div>
        </div>
        <p class="section-note">段落可以继续往里加句子；如果你不加句子，只填“整段内容”，生成时就按整段内容直接出一段。</p>
        <div class="form-grid single-column">
          <label>
            <span>段落主题</span>
            <input class="text-input" data-builder-field="topic" value="${escapeAttribute(activeModule.topic)}" />
          </label>
          <label>
            <span>段落作用</span>
            <textarea class="text-area compact" data-builder-field="guidance" placeholder="这一段主要说明什么">${escapeHtml(activeModule.guidance)}</textarea>
          </label>
          <label>
            <span>整段内容（选填）</span>
            <textarea class="text-area compact" data-builder-field="paragraphContent" placeholder="如果不往下拆句子，可以直接在这里写整段占位内容">${escapeHtml(activeModule.paragraphContent || "")}</textarea>
          </label>
        </div>
      </article>
    `;
    return;
  }

  dom.builderSettingsPanel.innerHTML = `
    <article class="admin-panel">
      <div class="section-head">
        <div>
          <p class="section-tag">Sentence</p>
          <h2>句子设置</h2>
        </div>
      </div>
      <div class="form-grid single-column">
        <label>
          <span>句子内容</span>
          <textarea class="text-area compact" data-builder-field="content" placeholder="这一句要表达什么">${escapeHtml(activeModule.content || "")}</textarea>
        </label>
        <label>
          <span>句子作用说明</span>
          <textarea class="text-area compact" data-builder-field="note" placeholder="这句承担什么作用，可选填">${escapeHtml(activeModule.note || "")}</textarea>
        </label>
      </div>
    </article>
  `;
}

function renderBuilderWorkspace() {
  if (dom.builderTemplateName) {
    dom.builderTemplateName.value = state.workspace.templateBuilderName || "";
  }
  dom.builderToolList?.querySelector('[data-builder-tool="sentence"] strong')?.replaceChildren("句子模块");
  dom.builderToolList?.querySelector('[data-builder-tool="sentence"] span')?.replaceChildren("适合拆到单句，每句单独设置写什么。");
  dom.builderToolList?.querySelector('[data-builder-tool="paragraph"] span')?.replaceChildren("自动从 [0000] 开始编号，可以直接写整段，也可以继续往里拆句子。");
  renderBuilderCanvasV2();
  renderBuilderSettingsV2();
  renderBuilderPreview();
  animateBuilderCanvas();
  animateActiveBuilderModule();
}

function renderChatState() {
  if (!dom.chatThread) return;

  const messages = state.chat.messages || [];
  if (!messages.length) {
    dom.chatThread.classList.add("empty-state");
    dom.chatThread.textContent = "还没有聊天记录。先发一句话，或者先上传材料。";
  } else {
    dom.chatThread.classList.remove("empty-state");
    dom.chatThread.innerHTML = messages
      .map(
        (message) => `
          <article class="chat-bubble chat-bubble-${message.role}">
            <div class="chat-bubble-meta">
              <strong>${message.role === "assistant" ? "助手" : "你"}</strong>
              <span>${escapeHtml(formatDate(message.createdAt))}</span>
            </div>
            ${message.meta?.generationModeLabel ? `<div class="output-meta">${escapeHtml(message.meta.generationModeLabel)}</div>` : ""}
            <div class="chat-bubble-body">${escapeHtml(message.content)}</div>
          </article>
        `,
      )
      .join("");
    dom.chatThread.scrollTop = dom.chatThread.scrollHeight;
  }

  if (dom.chatFiles) {
    const files = state.chat.files || [];
    dom.chatFiles.innerHTML = files.length
      ? files
          .map(
            (file) => `
              <article class="context-card">
                <strong>${escapeHtml(file.name)}</strong>
                <p>${escapeHtml(file.type || "unknown")} · ${escapeHtml(String(file.size || 0))} bytes</p>
                <p>${file.supported ? escapeHtml(file.preview || "已读取正文。") : "当前只记录文件名和类型，未自动提取正文。"}</p>
              </article>
            `,
          )
          .join("")
      : '<article class="context-card"><strong>还没有上传文件</strong><p>先上传文本材料，系统会把它们作为长期上下文记住。</p></article>';
  }

  if (dom.chatMemoryStatus) {
    const modelLabel = state.settingsSummary?.configured
      ? `当前对话优先走 ${state.settingsSummary.model}`
      : "当前未连接大模型，将走本地规则";
    dom.chatMemoryStatus.textContent = `${modelLabel}，已记住 ${messages.length} 条消息、${(state.chat.files || []).length} 个文件。`;
    dom.chatMemoryStatus.dataset.tone = state.settingsSummary?.configured ? "success" : "neutral";
  }
}

function fillSharedFields({ restoreTextInputs = true } = {}) {
  if (dom.agentName) dom.agentName.value = restoreTextInputs ? state.workspace.agentName : "";
  if (dom.topicTitle) dom.topicTitle.value = restoreTextInputs ? state.workspace.title : "";
  if (dom.topicKeywords) dom.topicKeywords.value = restoreTextInputs ? state.workspace.keywords : "";
  if (dom.topicFocus) dom.topicFocus.value = restoreTextInputs ? state.workspace.focus : "";
  if (dom.topicPainPoints) dom.topicPainPoints.value = restoreTextInputs ? state.workspace.painPoints : "";
  if (dom.sourceQuery) dom.sourceQuery.value = restoreTextInputs ? state.workspace.sourceQuery || state.workspace.keywords : "";
  if (dom.styleRawText) dom.styleRawText.value = restoreTextInputs ? state.workspace.styleRawText : "";
  if (dom.styleNotes) dom.styleNotes.value = restoreTextInputs ? state.workspace.styleNotes : "";
  if (dom.styleMasterName) dom.styleMasterName.value = restoreTextInputs ? state.workspace.styleMasterName || "" : "";
  if (dom.styleAbstractText) dom.styleAbstractText.value = restoreTextInputs ? state.workspace.styleAbstractText || "" : "";
  if (dom.styleSpecificationText) dom.styleSpecificationText.value = restoreTextInputs ? state.workspace.styleSpecificationText || "" : "";
  if (dom.styleClaimsText) dom.styleClaimsText.value = restoreTextInputs ? state.workspace.styleClaimsText || "" : "";
  if (dom.patentType) dom.patentType.value = state.workspace.patentType;
  if (dom.blankMode) dom.blankMode.value = state.workspace.blankMode;
  if (dom.templateSourceType) dom.templateSourceType.value = state.workspace.templateSourceType || "default";
  if (dom.templateSourceText) dom.templateSourceText.value = restoreTextInputs ? state.workspace.customTemplateContent || "" : "";
  if (dom.builderTemplateName) dom.builderTemplateName.value = restoreTextInputs ? state.workspace.templateBuilderName || "我的可视化模板" : "";
  renderCustomTemplateStatus();
  renderDistilledMastersLibrary();
  renderTemplateSourceSelectors();
  renderBuilderTemplateLibrary();
}

async function persistWorkspaceNow() {
  if (!state.authUser) return;
  const payload = { ...state.workspace };
  workspaceSaveRequest = workspaceSaveRequest.then(() =>
    requestJson("/api/workspace", {
      method: "POST",
      payload,
    }),
  );
  await workspaceSaveRequest;
}

function scheduleWorkspaceSave() {
  clearTimeout(workspaceSaveTimer);
  workspaceSaveTimer = window.setTimeout(() => {
    persistWorkspaceNow().catch((error) => {
      console.error(error);
    });
  }, 220);
}

function syncField(key, value) {
  state.workspace[key] = value;
  scheduleWorkspaceSave();
}

function attachPersistence() {
  dom.agentName?.addEventListener("input", (event) => syncField("agentName", event.target.value));
  dom.topicTitle?.addEventListener("input", (event) => syncField("title", event.target.value));
  dom.topicKeywords?.addEventListener("input", (event) => syncField("keywords", event.target.value));
  dom.topicFocus?.addEventListener("input", (event) => syncField("focus", event.target.value));
  dom.topicPainPoints?.addEventListener("input", (event) => syncField("painPoints", event.target.value));
  dom.sourceQuery?.addEventListener("input", (event) => {
    syncField("sourceQuery", event.target.value);
    if (!dom.topicKeywords) {
      syncField("keywords", event.target.value);
      syncField("title", event.target.value);
    }
  });
  dom.styleRawText?.addEventListener("input", (event) => syncField("styleRawText", event.target.value));
  dom.styleNotes?.addEventListener("input", (event) => syncField("styleNotes", event.target.value));
  dom.styleMasterName?.addEventListener("input", (event) => syncField("styleMasterName", event.target.value));
  dom.styleAbstractText?.addEventListener("input", (event) => syncField("styleAbstractText", event.target.value));
  dom.styleSpecificationText?.addEventListener("input", (event) => syncField("styleSpecificationText", event.target.value));
  dom.styleClaimsText?.addEventListener("input", (event) => syncField("styleClaimsText", event.target.value));
  dom.patentType?.addEventListener("change", (event) => syncField("patentType", event.target.value));
  dom.blankMode?.addEventListener("change", (event) => syncField("blankMode", event.target.value));
  dom.templateSourceType?.addEventListener("change", (event) => {
    syncField("templateSourceType", event.target.value);
    renderTemplateSourceSelectors();
    renderTemplateContext();
    renderWorkspaceOverview();
  });
  dom.templateStylePreset?.addEventListener("change", (event) => {
    syncField("templateStylePreset", event.target.value);
    renderTemplateContext();
    renderWorkspaceOverview();
  });
  dom.selectedMasterTemplateId?.addEventListener("change", (event) => {
    syncField("selectedDistilledMasterId", event.target.value);
    renderDistilledMastersLibrary();
    renderTemplateSourceSelectors();
    renderTemplateContext();
    renderWorkspaceOverview();
  });
  dom.selectedBuilderTemplateId?.addEventListener("change", (event) => {
    syncField("selectedBuilderTemplateId", event.target.value);
    renderBuilderTemplateLibrary();
    renderTemplateSourceSelectors();
    renderTemplateContext();
    renderWorkspaceOverview();
  });
  dom.builderTemplateName?.addEventListener("input", (event) => {
    state.workspace.templateBuilderName = event.target.value;
    renderBuilderPreview();
    renderWorkspaceOverview();
    scheduleWorkspaceSave();
  });
  dom.templateSourceText?.addEventListener("input", (event) => {
    const content = normalizeTemplateText(event.target.value);
    state.workspace.customTemplateContent = content;
    state.workspace.customTemplateName = content ? state.workspace.customTemplateName || "手动粘贴模板" : "";
    renderCustomTemplateStatus();
    renderTemplateSourceSelectors();
    renderTemplateContext();
    renderWorkspaceOverview();
    scheduleWorkspaceSave();
  });
}

function populateMasterSelect() {
  renderDistilledMastersLibrary();
  dom.styleMasterSearch?.addEventListener("input", () => {
    renderDistilledMastersLibrary();
  });
  dom.distilledMastersList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-master-id]");
    if (deleteButton) {
      deleteDistilledMaster(deleteButton.dataset.deleteMasterId).catch((error) => {
        console.error(error);
        setStyleStatus(`删除失败：${error.message}`, "error");
      });
      return;
    }
    const button = event.target.closest("[data-master-id]");
    if (!button) return;
    applySelectedDistilledMaster(button.dataset.masterId, {
      persist: true,
      stream: false,
    });
  });
  dom.masterSelect?.addEventListener("change", (event) => {
    applySelectedDistilledMaster(event.target.value, {
      persist: true,
      stream: false,
    });
  });
  dom.deleteMasterButton?.addEventListener("click", () => {
    if (!state.workspace.selectedDistilledMasterId) {
      setStyleStatus("先选中一个要删除的大师模板。", "error");
      return;
    }
    deleteDistilledMaster(state.workspace.selectedDistilledMasterId).catch((error) => {
      console.error(error);
      setStyleStatus(`删除失败：${error.message}`, "error");
    });
  });
}

function createLoginUi() {
  if (loginUi) return loginUi;

  const modal = document.createElement("div");
  modal.className = "settings-backdrop login-backdrop hidden";
  modal.innerHTML = `
    <div class="settings-dialog login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div class="section-head">
        <div>
          <p class="section-tag">Login</p>
          <h2 id="login-title">登录专利代写工作台</h2>
        </div>
      </div>
      <p class="section-note">这个副本已经改成双角色版本，先登录再使用。账号密码不再显示在弹窗里，请查看项目目录中的《账号密码.txt》。</p>
      <label>
        <span>用户名</span>
        <input id="login-username" class="text-input" placeholder="输入用户名" />
      </label>
      <label>
        <span>密码</span>
        <input id="login-password" class="text-input" type="password" placeholder="输入密码" />
      </label>
      <div id="login-status" class="settings-status">请先登录。</div>
      <div class="action-row">
        <button id="login-submit" class="primary-button" type="button">登录</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const elements = {
    modal,
    username: modal.querySelector("#login-username"),
    password: modal.querySelector("#login-password"),
    submit: modal.querySelector("#login-submit"),
    status: modal.querySelector("#login-status"),
  };

  function setStatus(text, tone = "neutral") {
    elements.status.textContent = text;
    elements.status.dataset.tone = tone;
  }

  async function submit() {
    setLoading(elements.submit, true, "登录中...");
    try {
      await requestJson("/api/auth/login", {
        method: "POST",
        payload: {
          username: elements.username.value,
          password: elements.password.value,
        },
        handleUnauthorized: false,
      });
      setStatus("登录成功，正在刷新页面。", "success");
      window.location.reload();
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setLoading(elements.submit, false);
    }
  }

  elements.submit.addEventListener("click", submit);
  elements.password.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });

  loginUi = {
    open(message = "请先登录。") {
      modal.classList.remove("hidden");
      document.body.classList.add("modal-open");
      setStatus(message, "neutral");
      elements.username.focus();
    },
    close() {
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    },
  };

  return loginUi;
}

async function loadCurrentUser() {
  try {
    const result = await requestJson("/api/auth/me", {
      handleUnauthorized: false,
    });
    return result.user || null;
  } catch (error) {
    if (error.status === 401) {
      return null;
    }
    throw error;
  }
}

function renderNavigationUi() {
  if (!dom.navPills || !state.authUser) return;
  const createLink = (href, label) => {
    const link = document.createElement("a");
    link.className = `nav-pill${window.location.pathname === href ? " active" : ""}`;
    link.href = href;
    link.textContent = label;
    return link;
  };

  const createButton = (label, handler, className = "nav-pill") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  };

  dom.navPills.innerHTML = "";
  dom.navPills.appendChild(createLink("/background.html", "背景资料"));
  dom.navPills.appendChild(createLink("/template.html", "模板工坊"));
  dom.navPills.appendChild(
    createButton("清空本页", () => {
      clearCurrentPageInputs().catch((error) => console.error(error));
    }, "nav-pill nav-pill-warning"),
  );
  dom.navPills.appendChild(
    createButton("重置全部", () => {
      resetEntireWorkspace().catch((error) => console.error(error));
    }, "nav-pill nav-pill-warning"),
  );
  dom.navPills.appendChild(createLink("/style.html", "风格蒸馏"));
  dom.navPills.appendChild(createLink("/chat.html", "模板搭建器"));

  if (state.authUser.role === "admin") {
    dom.navPills.appendChild(createButton("API 设置", () => settingsUi?.open()));
    dom.navPills.appendChild(createButton("用户管理", () => userAdminUi?.open()));
  }

  const roleBadge = document.createElement("span");
  roleBadge.className = `nav-pill nav-role-pill ${state.authUser.role === "admin" ? "nav-role-admin" : "nav-role-user"}`;
  roleBadge.textContent = state.authUser.role === "admin" ? "管理员" : "普通用户";
  dom.navPills.appendChild(roleBadge);

  dom.navPills.appendChild(
    createButton("退出", async () => {
      try {
        await requestJson("/api/auth/logout", {
          method: "POST",
          payload: {},
          handleUnauthorized: false,
        });
      } finally {
        window.location.reload();
      }
    }),
  );
}

async function loadAdminSettings() {
  const result = await requestJson("/api/settings");
  state.settings = result.settings;
  state.settingsSummary = result.summary;
  return result;
}

function createSettingsUi() {
  if (settingsUi || state.authUser?.role !== "admin") return settingsUi;

  const modal = document.createElement("div");
  modal.className = "settings-backdrop hidden";
  modal.innerHTML = `
    <div class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="section-head">
        <div>
          <p class="section-tag">Settings</p>
          <h2 id="settings-title">管理员 API 设置</h2>
        </div>
        <button type="button" class="mini-button" id="settings-close-top">关闭</button>
      </div>
      <label>
        <span>API Key</span>
        <input id="settings-api-key" class="text-input" type="password" placeholder="例如：sk-..." />
      </label>
      <label>
        <span>Base URL</span>
        <input id="settings-base-url" class="text-input" placeholder="例如：https://api.openai.com/v1" />
      </label>
      <label>
        <span>模型名</span>
        <input id="settings-model" class="text-input" placeholder="例如：gpt-4.1-mini" />
      </label>
      <p class="output-meta">这里只允许管理员操作。配置会保存在站点本地文件中，普通用户无法查看或修改。</p>
      <div id="settings-status" class="settings-status">还没有测试连接。</div>
      <div class="action-row">
        <button type="button" class="primary-button" id="settings-save">保存设置</button>
        <button type="button" class="ghost-button" id="settings-test">测试连接</button>
        <button type="button" class="ghost-button" id="settings-close">取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const elements = {
    modal,
    apiKey: modal.querySelector("#settings-api-key"),
    baseUrl: modal.querySelector("#settings-base-url"),
    model: modal.querySelector("#settings-model"),
    status: modal.querySelector("#settings-status"),
    save: modal.querySelector("#settings-save"),
    test: modal.querySelector("#settings-test"),
    close: modal.querySelector("#settings-close"),
    closeTop: modal.querySelector("#settings-close-top"),
  };

  function renderStatus(text, tone = "neutral") {
    elements.status.textContent = text;
    elements.status.dataset.tone = tone;
  }

  function syncModalFields() {
    elements.apiKey.value = state.settings.apiKey || "";
    elements.baseUrl.value = state.settings.baseUrl || defaultSettings.baseUrl;
    elements.model.value = state.settings.model || defaultSettings.model;
    if (state.settingsSummary?.configured) {
      renderStatus(`当前已接入：${state.settingsSummary.model} @ ${state.settingsSummary.baseUrl}`, "success");
    } else {
      renderStatus("当前未配置大模型，将自动使用本地规则。", "neutral");
    }
  }

  async function open() {
    await loadAdminSettings();
    syncModalFields();
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function close() {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  async function saveSettings() {
    setLoading(elements.save, true, "保存中...");
    try {
      const result = await requestJson("/api/settings", {
        method: "POST",
        payload: {
          apiKey: elements.apiKey.value,
          baseUrl: elements.baseUrl.value,
          model: elements.model.value,
        },
      });
      state.settings = result.settings;
      state.settingsSummary = result.summary;
      renderStatus("设置已保存。", "success");
      renderWorkspaceOverview();
      renderTemplateContext();
      renderChatState();
    } catch (error) {
      renderStatus(`保存失败：${error.message}`, "error");
    } finally {
      setLoading(elements.save, false);
    }
  }

  async function testSettings() {
    setLoading(elements.test, true, "测试中...");
    try {
      const result = await requestJson("/api/settings/test", {
        method: "POST",
        payload: {
          apiKey: elements.apiKey.value,
          baseUrl: elements.baseUrl.value,
          model: elements.model.value,
        },
      });
      renderStatus(`连接成功：${result.preview}`, "success");
    } catch (error) {
      renderStatus(`测试失败：${error.message}`, "error");
    } finally {
      setLoading(elements.test, false);
    }
  }

  elements.close.addEventListener("click", close);
  elements.closeTop.addEventListener("click", close);
  elements.save.addEventListener("click", saveSettings);
  elements.test.addEventListener("click", testSettings);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      close();
    }
  });

  settingsUi = { open, close };
  return settingsUi;
}

async function loadAdminUsers() {
  const result = await requestJson("/api/admin/users");
  state.adminUsers = result.users || [];
  state.adminPasswordFilePath = result.passwordFilePath || "";
}

function createUserAdminUi() {
  if (userAdminUi || state.authUser?.role !== "admin") return userAdminUi;

  const modal = document.createElement("div");
  modal.className = "settings-backdrop hidden";
  modal.innerHTML = `
    <div class="settings-dialog users-dialog" role="dialog" aria-modal="true" aria-labelledby="users-title">
      <div class="section-head">
        <div>
          <p class="section-tag">Users</p>
          <h2 id="users-title">管理员用户面板</h2>
        </div>
        <button type="button" class="mini-button" id="users-close-top">关闭</button>
      </div>
      <p class="section-note">这里可以新增普通用户或管理员，也可以直接查看当前密码、打开本地 txt 台账，或者给任意账号重置密码。</p>
      <div id="users-status" class="settings-status">准备就绪。</div>

      <section class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Ledger</p>
            <h2>密码台账</h2>
          </div>
          <a class="ghost-button" href="/api/admin/users/passwords.txt" target="_blank" rel="noreferrer">打开账号密码 TXT</a>
        </div>
        <p class="output-meta">账号变更后会自动同步到 txt 文件。当前文件位置：<span id="users-password-file-path"></span></p>
      </section>

      <section class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Create</p>
            <h2>新建账号</h2>
          </div>
        </div>
        <div class="form-grid">
          <label>
            <span>用户名</span>
            <input id="create-username" class="text-input" placeholder="例如：alice" />
          </label>
          <label>
            <span>显示名</span>
            <input id="create-display-name" class="text-input" placeholder="例如：Alice 专利助理" />
          </label>
          <label>
            <span>初始密码</span>
            <input id="create-password" class="text-input" placeholder="至少 8 位" />
          </label>
          <label>
            <span>角色</span>
            <select id="create-role" class="text-input">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </label>
        </div>
        <div class="action-row">
          <button id="create-user-button" class="primary-button" type="button">创建账号</button>
        </div>
      </section>

      <section class="admin-panel">
        <div class="section-head">
          <div>
            <p class="section-tag">Manage</p>
            <h2>已有账号</h2>
          </div>
        </div>
        <div id="users-list" class="admin-users-list"></div>
      </section>
    </div>
  `;
  document.body.appendChild(modal);

  const elements = {
    modal,
    status: modal.querySelector("#users-status"),
    list: modal.querySelector("#users-list"),
    passwordFilePath: modal.querySelector("#users-password-file-path"),
    closeTop: modal.querySelector("#users-close-top"),
    createUsername: modal.querySelector("#create-username"),
    createDisplayName: modal.querySelector("#create-display-name"),
    createPassword: modal.querySelector("#create-password"),
    createRole: modal.querySelector("#create-role"),
    createButton: modal.querySelector("#create-user-button"),
  };

  function setStatus(text, tone = "neutral") {
    elements.status.textContent = text;
    elements.status.dataset.tone = tone;
  }

  function renderUsers() {
    if (elements.passwordFilePath) {
      elements.passwordFilePath.textContent = state.adminPasswordFilePath || "账号密码.txt";
    }

    elements.list.innerHTML = state.adminUsers
      .map(
        (user) => `
          <article class="admin-user-card" data-user-card="${escapeAttribute(user.id)}">
            <div class="admin-user-head">
              <div>
                <strong>${escapeHtml(user.displayName)}</strong>
                <p class="output-meta">${escapeHtml(user.username)} · 上次登录：${escapeHtml(user.lastLoginAt ? formatDate(user.lastLoginAt) : "尚未登录")}</p>
              </div>
              <span class="role-chip ${user.role === "admin" ? "role-admin" : "role-user"}">
                ${user.role === "admin" ? "管理员" : "普通用户"}
              </span>
            </div>
            <div class="form-grid">
              <label>
                <span>显示名</span>
                <input class="text-input" data-user-field="displayName" value="${escapeAttribute(user.displayName)}" />
              </label>
              <label>
                <span>角色</span>
                <select class="text-input" data-user-field="role">
                  <option value="user" ${user.role === "user" ? "selected" : ""}>普通用户</option>
                  <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
                </select>
              </label>
              <label>
                <span>状态</span>
                <select class="text-input" data-user-field="status">
                  <option value="active" ${user.status === "active" ? "selected" : ""}>启用</option>
                  <option value="disabled" ${user.status === "disabled" ? "selected" : ""}>停用</option>
                </select>
              </label>
              <label class="full-span">
                <span>当前密码（管理员可见）</span>
                <div class="password-inline">
                  <input class="text-input" type="text" data-user-field="currentPassword" value="${escapeAttribute(user.password || "")}" readonly />
                  <button class="ghost-button" type="button" data-user-copy-password="${escapeAttribute(user.id)}">复制密码</button>
                </div>
                <p class="output-meta password-help">
                  ${user.passwordAvailable ? "这里显示当前保存的明文密码，txt 台账也会同步更新。" : "当前没有保存到明文台账，请给这个账号重置一次密码。"}
                </p>
              </label>
              <label>
                <span>新密码</span>
                <input class="text-input" type="text" data-user-field="password" placeholder="输入后点保存，即可完成重置" />
              </label>
            </div>
            <div class="action-row">
              <button class="ghost-button" type="button" data-user-generate-password="${escapeAttribute(user.id)}">生成新密码</button>
              <button class="primary-button" type="button" data-user-save="${escapeAttribute(user.id)}">保存这个用户</button>
            </div>
          </article>
        `,
      )
      .join("");
  }

  async function refreshUsers() {
    await loadAdminUsers();
    renderUsers();
  }

  async function open() {
    await refreshUsers();
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    setStatus("可以开始管理账号了。", "neutral");
  }

  function close() {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  async function createUserAccount() {
    setLoading(elements.createButton, true, "创建中...");
    try {
      await requestJson("/api/admin/users", {
        method: "POST",
        payload: {
          username: elements.createUsername.value,
          displayName: elements.createDisplayName.value,
          password: elements.createPassword.value,
          role: elements.createRole.value,
        },
      });
      elements.createUsername.value = "";
      elements.createDisplayName.value = "";
      elements.createPassword.value = "";
      elements.createRole.value = "user";
      await refreshUsers();
      setStatus("新账号已创建。", "success");
    } catch (error) {
      setStatus(`创建失败：${error.message}`, "error");
    } finally {
      setLoading(elements.createButton, false);
    }
  }

  async function saveUserAccount(userId, button) {
    const card = button.closest("[data-user-card]");
    if (!card) return;

    setLoading(button, true, "保存中...");
    try {
      await requestJson(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "POST",
        payload: {
          displayName: card.querySelector('[data-user-field="displayName"]').value,
          role: card.querySelector('[data-user-field="role"]').value,
          status: card.querySelector('[data-user-field="status"]').value,
          password: card.querySelector('[data-user-field="password"]').value,
        },
      });
      await refreshUsers();
      setStatus("账号已更新。", "success");
    } catch (error) {
      setStatus(`更新失败：${error.message}`, "error");
    } finally {
      setLoading(button, false);
    }
  }

  elements.closeTop.addEventListener("click", close);
  elements.createButton.addEventListener("click", createUserAccount);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      close();
      return;
    }

    const generateButton = event.target.closest("[data-user-generate-password]");
    if (generateButton) {
      const card = generateButton.closest("[data-user-card]");
      const input = card?.querySelector('[data-user-field="password"]');
      if (input) {
        input.value = generateReadablePassword();
        setStatus("已生成一个新密码，确认后点“保存这个用户”即可重置。", "neutral");
      }
      return;
    }

    const copyButton = event.target.closest("[data-user-copy-password]");
    if (copyButton) {
      const card = copyButton.closest("[data-user-card]");
      const input = card?.querySelector('[data-user-field="currentPassword"]');
      const password = input?.value || "";
      if (!password) {
        setStatus("这个账号当前没有可复制的明文密码，请先重置。", "error");
        return;
      }

      navigator.clipboard
        .writeText(password)
        .then(() => setStatus("密码已复制到剪贴板。", "success"))
        .catch(() => setStatus("复制失败，请手动选中文本复制。", "error"));
      return;
    }

    const saveButton = event.target.closest("[data-user-save]");
    if (saveButton) {
      saveUserAccount(saveButton.dataset.userSave, saveButton);
    }
  });

  userAdminUi = { open, close };
  return userAdminUi;
}

function createAuthUi() {
  if (!dom.navPills || !state.authUser) return;
  const createLink = (href, label) => {
    const link = document.createElement("a");
    link.className = `nav-pill${window.location.pathname === href ? " active" : ""}`;
    link.href = href;
    link.textContent = label;
    return link;
  };

  const createButton = (label, handler, className = "nav-pill") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  };

  dom.navPills.innerHTML = "";
  dom.navPills.appendChild(createLink("/background.html", "背景"));
  dom.navPills.appendChild(createLink("/template.html", "模板"));
  dom.navPills.appendChild(
    createButton("清空", () => {
      clearCurrentPageInputs().catch((error) => console.error(error));
    }, "nav-pill nav-pill-warning"),
  );
  dom.navPills.appendChild(
    createButton("重置", () => {
      resetEntireWorkspace().catch((error) => console.error(error));
    }, "nav-pill nav-pill-warning"),
  );
  dom.navPills.appendChild(createLink("/style.html", "蒸馏"));
  dom.navPills.appendChild(createLink("/chat.html", "搭建"));

  if (state.authUser.role === "admin") {
    dom.navPills.appendChild(createButton("API", () => settingsUi?.open()));
    dom.navPills.appendChild(createLink("/users.html", "用户"));
  }

  const roleBadge = document.createElement("span");
  roleBadge.className = `nav-pill nav-role-pill ${state.authUser.role === "admin" ? "nav-role-admin" : "nav-role-user"}`;
  roleBadge.textContent = state.authUser.role === "admin" ? "管理" : "用户";
  dom.navPills.appendChild(roleBadge);

  dom.navPills.appendChild(
    createButton("退出", async () => {
      try {
        await requestJson("/api/auth/logout", {
          method: "POST",
          payload: {},
          handleUnauthorized: false,
        });
      } finally {
        window.location.reload();
      }
    }),
  );
}

function disableUserAdminModal() {
  return null;
}

function setUserAdminStatus(text, tone = "neutral") {
  if (!dom.userAdminStatus) return;
  dom.userAdminStatus.textContent = text;
  dom.userAdminStatus.dataset.tone = tone;
}

function renderUserAdminPage() {
  if (!dom.userAdminList) return;

  if (dom.userAdminPasswordFilePath) {
    dom.userAdminPasswordFilePath.textContent = state.adminPasswordFilePath || "账号密码.txt";
  }

  dom.userAdminList.innerHTML = state.adminUsers.length
    ? state.adminUsers
        .map(
          (user) => `
            <article class="admin-user-card" data-user-card="${escapeAttribute(user.id)}">
              <div class="admin-user-head">
                <div>
                  <strong>${escapeHtml(user.displayName)}</strong>
                  <p class="output-meta">${escapeHtml(user.username)} · 上次登录：${escapeHtml(user.lastLoginAt ? formatDate(user.lastLoginAt) : "尚未登录")}</p>
                </div>
                <span class="role-chip ${user.role === "admin" ? "role-admin" : "role-user"}">
                  ${user.role === "admin" ? "管理员" : "普通用户"}
                </span>
              </div>
              <details class="fold-panel" open>
                <summary>基础信息</summary>
                <div class="fold-panel-body">
                  <div class="form-grid">
                    <label>
                      <span>显示名</span>
                      <input class="text-input" data-user-field="displayName" value="${escapeAttribute(user.displayName)}" />
                    </label>
                    <label>
                      <span>角色</span>
                      <select class="text-input" data-user-field="role">
                        <option value="user" ${user.role === "user" ? "selected" : ""}>普通用户</option>
                        <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
                      </select>
                    </label>
                    <label>
                      <span>状态</span>
                      <select class="text-input" data-user-field="status">
                        <option value="active" ${user.status === "active" ? "selected" : ""}>启用</option>
                        <option value="disabled" ${user.status === "disabled" ? "selected" : ""}>停用</option>
                      </select>
                    </label>
                  </div>
                </div>
              </details>
              <details class="fold-panel" open>
                <summary>密码管理</summary>
                <div class="fold-panel-body">
                  <label class="full-span">
                    <span>当前密码（管理员可见）</span>
                    <div class="password-inline">
                      <input class="text-input" type="text" data-user-field="currentPassword" value="${escapeAttribute(user.password || "")}" readonly />
                      <button class="ghost-button" type="button" data-user-copy-password="${escapeAttribute(user.id)}">复制密码</button>
                    </div>
                    <p class="output-meta password-help">
                      ${user.passwordAvailable ? "这里显示的是当前保存的明文密码，TXT 台账也会同步更新。" : "当前还没有可见密码，重置一次后会写入 TXT 台账。"}
                    </p>
                  </label>
                  <label>
                    <span>新密码</span>
                    <input class="text-input" type="text" data-user-field="password" placeholder="输入后保存即可重置密码" />
                  </label>
                  <div class="action-row">
                    <button class="ghost-button" type="button" data-user-generate-password="${escapeAttribute(user.id)}">生成新密码</button>
                    <button class="primary-button" type="button" data-user-save="${escapeAttribute(user.id)}">保存这个用户</button>
                  </div>
                </div>
              </details>
            </article>
          `,
        )
        .join("")
    : '<article class="context-card"><strong>还没有账号</strong><p>先在左侧创建一个普通用户或管理员账号。</p></article>';
}

async function refreshUserAdminPage() {
  if (state.authUser?.role !== "admin" || !dom.userAdminList) return;
  await loadAdminUsers();
  renderUserAdminPage();
}

async function createUserAccountFromPage() {
  if (!dom.userAdminCreateButton) return;
  setLoading(dom.userAdminCreateButton, true, "创建中...");
  try {
    await requestJson("/api/admin/users", {
      method: "POST",
      payload: {
        username: dom.userAdminCreateUsername?.value,
        displayName: dom.userAdminCreateDisplayName?.value,
        password: dom.userAdminCreatePassword?.value,
        role: dom.userAdminCreateRole?.value,
      },
    });
    if (dom.userAdminCreateUsername) dom.userAdminCreateUsername.value = "";
    if (dom.userAdminCreateDisplayName) dom.userAdminCreateDisplayName.value = "";
    if (dom.userAdminCreatePassword) dom.userAdminCreatePassword.value = "";
    if (dom.userAdminCreateRole) dom.userAdminCreateRole.value = "user";
    await refreshUserAdminPage();
    setUserAdminStatus("新账号已创建。", "success");
  } catch (error) {
    setUserAdminStatus(`创建失败：${error.message}`, "error");
  } finally {
    setLoading(dom.userAdminCreateButton, false);
  }
}

async function saveUserAccountFromPage(userId, button) {
  const card = button.closest("[data-user-card]");
  if (!card) return;

  setLoading(button, true, "保存中...");
  try {
    await requestJson(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: "POST",
      payload: {
        displayName: card.querySelector('[data-user-field="displayName"]')?.value,
        role: card.querySelector('[data-user-field="role"]')?.value,
        status: card.querySelector('[data-user-field="status"]')?.value,
        password: card.querySelector('[data-user-field="password"]')?.value,
      },
    });
    await refreshUserAdminPage();
    setUserAdminStatus("账号已更新。", "success");
  } catch (error) {
    setUserAdminStatus(`更新失败：${error.message}`, "error");
  } finally {
    setLoading(button, false);
  }
}

function wireUserAdminPage() {
  if (wireUserAdminPage.bound || !dom.userAdminList) return;
  wireUserAdminPage.bound = true;

  dom.userAdminCreateButton?.addEventListener("click", createUserAccountFromPage);
  dom.userAdminList.addEventListener("click", (event) => {
    const generateButton = event.target.closest("[data-user-generate-password]");
    if (generateButton) {
      const card = generateButton.closest("[data-user-card]");
      const input = card?.querySelector('[data-user-field="password"]');
      if (input) {
        input.value = generateReadablePassword();
        setUserAdminStatus("已生成一个新密码，确认后点“保存这个用户”即可重置。", "neutral");
      }
      return;
    }

    const copyButton = event.target.closest("[data-user-copy-password]");
    if (copyButton) {
      const card = copyButton.closest("[data-user-card]");
      const password = card?.querySelector('[data-user-field="currentPassword"]')?.value || "";
      if (!password) {
        setUserAdminStatus("这个账号当前没有可复制的明文密码，请先重置。", "error");
        return;
      }
      navigator.clipboard
        .writeText(password)
        .then(() => setUserAdminStatus("密码已复制到剪贴板。", "success"))
        .catch(() => setUserAdminStatus("复制失败，请手动选中文本复制。", "error"));
      return;
    }

    const saveButton = event.target.closest("[data-user-save]");
    if (saveButton) {
      saveUserAccountFromPage(saveButton.dataset.userSave, saveButton);
    }
  });
}

async function refreshSourceGuides() {
  setLoading(dom.refreshGuides, true, "生成中...");
  try {
    const data = await requestJson("/api/workbench/source-guides", {
      method: "POST",
      payload: {
        title: state.workspace.title,
        keywords: state.workspace.sourceQuery || state.workspace.keywords,
        agentName: state.workspace.agentName,
      },
    });
    renderSourceGuides(data.sourceGuides);
  } finally {
    setLoading(dom.refreshGuides, false);
  }
}

async function readTemplateLikeFile(file, label = "文件") {
  if (!file) return "";
  if (file.size > MAX_TEMPLATE_FILE_BYTES) {
    throw new Error(`${label}不能超过 10 MB。`);
  }

  if (isSupportedTemplateTextFile(file)) {
    return normalizeTemplateText(await file.text());
  }

  if (isSupportedTemplateOfficeFile(file)) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await requestJson("/api/template/extract-office", {
      method: "POST",
      payload: {
        fileName: file.name,
        contentBase64: arrayBufferToBase64(arrayBuffer),
      },
    });
    return normalizeTemplateText(result.text || "");
  }

  throw new Error(`${label}目前支持 txt、md、html 和 .docx。若你手里是 .doc，请先另存为 .docx。`);
}

async function uploadStyleDocument(file, fieldKey, textArea, label) {
  const content = await readTemplateLikeFile(file, label);
  state.workspace[fieldKey] = content;
  if (textArea) {
    textArea.value = content;
  }
  await persistWorkspaceNow();
}

function buildStylePresetProfile(presetId, sourceLabel = "模板工坊风格预设") {
  const preset = getStylePresetById(presetId);
  return {
    id: createStoredItemId("preset-profile"),
    displayName: `${preset.name}（预设）`,
    archetype: "风格预设",
    toneSummary: preset.toneSummary,
    metrics: {
      structure: "模板优先",
      problemOrientation: preset.id === "problem-solution" ? "明显" : "中等",
      claimSkeleton: "按模板来源决定",
      embodimentDetail: "由用户后续补充",
      effectEmphasis: preset.id === "steady-agent" ? "克制" : "中等",
      averageSentenceLength: "跟随实际写作",
    },
    signaturePhrases: [preset.name, preset.toneSummary],
    writingHabits: preset.writingHabits,
    templateMoves: preset.templateMoves,
    rawExcerptPreview: sourceLabel,
  };
}

function buildSmartDefaultPatentTemplate(title, patentType) {
  const subject = getClaimStyleSubject(title || "某技术方案");
  return `# ${title || "未命名专利模板"}

## 说明书摘要
第1句：【模板】本发明公开了${subject}，包括[核心步骤/核心模块概述]。

第2句：【模板】本发明通过[关键模块/关键步骤]，解决[现有问题]，提高[性能指标/处理效果]。

## 技术领域
[0001] 【模板】本发明涉及[上位技术领域]，具体是一种[方法/系统/装置/介质]。

## 背景技术
[0002] 【模板】随着[行业背景/技术发展]，现有方案通常采用[通用做法]完成[对应任务]。

[0003] 【模板】现有技术存在[具体问题/局限]，导致[准确率低/效率低/成本高/稳定性不足]。

## 发明内容
[0004] 【模板】针对上述问题，本发明提出${subject}，用于解决[现有问题]。

[0005] 【模板】为了达到上述目的，本发明提供的${subject}按以下步骤进行：

[0006] 步骤1：【模板】这里写第一步总体动作。

[0007] 步骤1.1：【模板】这里写第一步中的细化动作。

[0008] 步骤2：【模板】这里写第二步总体动作。

## 附图说明
[0039] 【模板】图1为[整体框架/流程/模块关系]示意图。

## 具体实施方式
[0045] 【模板】下面结合附图和实施例对本发明作进一步说明。

[0046] 【模板】这里按照实施顺序展开具体结构、步骤、参数范围和可替换方案。

## 权利要求书
1.${subject}，其特征在于，包括如下步骤：

步骤1：【模板】这里写第一步总体动作。

步骤2：【模板】这里写第二步总体动作。

2.根据权利要求1所述的${subject}，其特征在于：

【模板】这里补充从属权利要求的限定特征。

> 模板备注：当前专利类型为 ${patentType || "发明专利"}。`.trim();
}

function buildDefaultPatentTemplate(title, patentType) {
  const resolvedTitle = String(title || "未命名专利模板").trim();
  const subject = getClaimStyleSubject(resolvedTitle);
  const subjectName = subject.replace(/^一种/, "");
  const lowerTitle = resolvedTitle.toLowerCase();
  const isBertTicket =
    /bert|工单|热线|识别|分类|bert-base-chinese/i.test(resolvedTitle) ||
    lowerTitle.includes("bert-base-chinese");
  const domain = isBertTicket
    ? "自然语言处理、文本分类以及公共服务热线工单智能处理"
    : "数据处理、智能识别以及业务信息自动分类";
  const scenario = isBertTicket ? "公共服务热线工单" : "待处理业务文本";
  const conventionalPractice = isBertTicket
    ? "人工阅读工单内容、按关键词规则筛选或者采用传统机器学习分类器进行工单归类"
    : "人工规则、关键词匹配或者通用分类模型进行业务文本归类";
  const problemText = isBertTicket
    ? "对语义相近但诉求不同的工单区分能力不足，且人工分派效率受工单数量影响较大"
    : "对复杂语义和多类别业务场景的适应能力不足，处理效率和识别稳定性仍有提升空间";
  const effectText = isBertTicket
    ? "公共服务热线工单的识别准确性、分派效率和处理一致性"
    : "业务文本的识别准确性、处理效率和分类一致性";

  return `# ${resolvedTitle}

## 说明书摘要
本发明公开了一种${subjectName}，属于${domain}技术领域，可用于对${scenario}进行智能识别、类别判断或辅助分派。
本发明利用中文预训练语言模型增强${scenario}的语义理解能力，能够解决${problemText}的问题，提高${effectText}。

## 技术领域
[0001] 本发明涉及${domain}技术领域，具体涉及一种${subjectName}。

## 背景技术
[0002] 随着政务服务、企业客服和公共服务热线业务量的持续增加，${scenario}的数量和类型不断增多，如何快速、准确地识别工单内容并分派至对应处理类别，已经成为热线平台智能化处理中的重要问题。
[0003] 现有方案通常采用${conventionalPractice}。该类方案在规则明确、类别较少的场景下能够完成基础识别，但在工单表述口语化、同义表达较多、文本长度差异明显或者类别边界相近时，容易出现误分、漏分和重复人工核对的问题，从而影响后续派单效率和处理稳定性。
[0004] 因此，有必要提出一种能够结合中文语义特征、适应公共服务热线工单表达特点并便于后续部署的工单识别方案，以提高工单识别的准确性和自动化处理水平。

## 发明内容
[0005] 针对现有技术中${problemText}的问题，本发明提出一种${subjectName}，用于对${scenario}进行自动识别并输出对应类别结果。
[0006] 为实现上述目的，本发明提供的${subject}包括如下步骤：
[0007] 步骤1，获取待识别的${scenario}数据，并提取工单标题、工单正文、来电描述、业务来源或者其他可用于识别的文本字段。【待补充：如果你的工单字段、数据来源或清洗规则有特殊设计，在这里写清楚。】
[0008] 步骤2，对所述工单数据进行预处理，得到适于模型输入的文本序列，所述预处理至少包括文本规范化、无效字符处理、长度截断或者字段拼接。【待补充：这里保留给你的创新预处理方式，例如字段加权、关键词增强、标签映射或样本均衡。】
[0009] 步骤3，将预处理后的文本序列输入bert-base-chinese模型，获得与所述工单文本对应的语义向量表示，并基于所述语义向量进行工单类别识别。【待补充：这里写你的核心创新方法，例如微调策略、分类层结构、损失函数、阈值策略或多任务识别方式。】
[0010] 步骤4，根据模型输出结果确定工单类别，并将所述工单类别、置信度或者分派建议输出至工单处理系统。【待补充：如果有人工复核、低置信度回退、规则融合或闭环更新机制，在这里写。】
[0011] 通过上述步骤，本发明能够利用bert-base-chinese模型对中文工单文本的上下文语义进行建模，相比单纯关键词匹配或人工分类方式，能够提高对复杂表达、同义表述和相近类别的识别能力。

## 附图说明
[0039] 图1为本发明所述${subjectName}的整体流程示意图。
[0040] 图2为本发明中工单文本预处理及模型识别流程示意图。【待补充：如果你后续有系统模块图、训练流程图或数据流图，可继续增加图3、图4。】

## 具体实施方式
[0045] 下面结合附图和实施例对本发明作进一步说明。应当理解，以下实施例仅用于说明本发明的技术方案，并不用于限定本发明的保护范围。
[0046] 在一种实施方式中，系统首先接收来自公共服务热线平台的工单数据，所述工单数据可以包括工单编号、工单标题、工单正文、来电描述、业务类型、受理时间以及历史处理标签中的一种或多种。
[0047] 系统对接收到的工单文本进行预处理，以减少噪声文本对识别结果的影响，并将处理后的文本转换为bert-base-chinese模型可接收的输入格式。【待补充：写你的具体预处理细节，例如分隔符、最大长度、字段顺序、特殊标记。】
[0048] 经预处理后的文本被输入bert-base-chinese模型，模型输出对应的语义表示；随后通过分类层、判别模块或类别映射模块得到工单识别结果。【待补充：写你的模型训练、识别和输出逻辑，这是核心创新内容。】
[0049] 在可选实施方式中，系统还可以根据识别置信度设置复核阈值，当模型输出置信度低于预设阈值时，将该工单转入人工复核流程；当置信度满足要求时，自动输出类别结果或者分派建议。

## 权利要求书
1.一种${subjectName}，其特征在于，包括如下步骤：
获取待识别的${scenario}数据；
对所述${scenario}数据进行文本预处理，得到适于bert-base-chinese模型输入的文本序列；
将所述文本序列输入bert-base-chinese模型，得到对应的语义向量表示；
基于所述语义向量表示进行工单类别识别，并输出工单识别结果；
其中，【待补充：这里写你真正想保护的核心创新点，例如特殊字段融合方式、语义增强方式、分类判别方式、阈值回退机制或训练策略。】

2.根据权利要求1所述的${subjectName}，其特征在于，所述文本预处理包括文本清洗、字段拼接、长度截断、特殊符号处理和标签规范化中的一种或多种。

3.根据权利要求1所述的${subjectName}，其特征在于，所述bert-base-chinese模型通过热线工单样本进行微调训练，并利用训练后的模型对待识别工单进行类别预测。【待补充：补充你的训练样本构建、损失函数、分类层或评价指标。】

4.根据权利要求1所述的${subjectName}，其特征在于，所述工单识别结果包括工单类别、类别置信度、分派建议和复核标记中的一种或多种。

> 模板备注：当前专利类型为 ${patentType || "发明专利"}；默认只把真正涉及创新细节的位置保留为【待补充】。`.trim();
}

function explainHeadingForGuidance(heading = "") {
  const title = heading.replace(/^#+\s*/, "").trim();
  if (!title) return "这一节写这一部分该交代的内容。";
  if (/摘要/.test(title)) return "这里简短交代对象、核心动作和用途。";
  if (/技术领域/.test(title)) return "这里点明技术归属，不展开方案。";
  if (/背景技术/.test(title)) return "这里写现有做法、现有问题和改进必要性。";
  if (/发明内容|方案/.test(title)) return "这里概括整体方案和预期效果。";
  if (/附图/.test(title)) return "这里按图号解释每张图代表什么。";
  if (/实施|实施例/.test(title)) return "这里按结构或步骤展开可实施内容。";
  if (/权利要求/.test(title)) return "这里按权利要求层级写保护范围。";
  return `这里写“${title}”这一节该覆盖的要点。`;
}

function decorateTemplateForMode(baseContent, mode) {
  const lines = normalizeTemplateText(baseContent)
    .split("\n")
    .map((item) => item.trimEnd());
  const output = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      output.push("");
      continue;
    }

    if (/^#+\s/.test(line)) {
      output.push(line);
      output.push(mode === "guided" ? `【引导】${explainHeadingForGuidance(line)}` : "");
      continue;
    }

    if (/^\[\d{4}\]/.test(line)) {
      const prefix = line.match(/^\[\d{4}\]/)?.[0] || "[0000]";
      if (/【模板】/.test(line)) {
        output.push(line);
      } else {
        output.push(mode === "guided" ? `${prefix} 【引导】${line.replace(/^\[\d{4}\]\s*/, "")}` : `${prefix} `);
      }
      continue;
    }

    if (/^###?\s*权利要求/.test(line)) {
      output.push(line);
      output.push(mode === "guided" ? "【引导】这里写对应层级的权利要求内容，保持保护范围清楚。": "");
      continue;
    }

    if (/^第\d+句：|^\d+\.(?:根据权利要求|一种)|^步骤\d+(?:\.\d+)?[:：]/.test(line) || /【模板】/.test(line)) {
      output.push(line);
      continue;
    }

    if (/^【引导】/.test(line)) {
      output.push(mode === "guided" ? line : "______");
      continue;
    }

    if (/^>/.test(line)) {
      output.push(mode === "guided" ? line : "");
      continue;
    }

    output.push(mode === "guided" ? `【引导】${line}` : "______");
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function resolveTemplateSource() {
  const sourceType = state.workspace.templateSourceType || "default";
  const selectedMaster = getSelectedDistilledMaster();
  const selectedBuilderTemplate = getSelectedBuilderTemplate();

  if (sourceType === "master" && selectedMaster?.templateContent) {
    return {
      sourceLabel: `大师模板：${selectedMaster.name}`,
      templateName: selectedMaster.name,
      baseContent: selectedMaster.templateContent,
      styleProfile: selectedMaster.styleProfile || buildStylePresetProfile(state.workspace.templateStylePreset, selectedMaster.name),
    };
  }

  if (sourceType === "builder" && selectedBuilderTemplate?.content) {
    return {
      sourceLabel: `搭建器模板：${selectedBuilderTemplate.name}`,
      templateName: selectedBuilderTemplate.name,
      baseContent: selectedBuilderTemplate.content,
      styleProfile: buildStylePresetProfile(state.workspace.templateStylePreset, selectedBuilderTemplate.name),
    };
  }

  if (sourceType === "uploaded" && state.workspace.customTemplateContent) {
    return {
      sourceLabel: `手动模板：${state.workspace.customTemplateName || "手动粘贴模板"}`,
      templateName: state.workspace.customTemplateName || "手动粘贴模板",
      baseContent: state.workspace.customTemplateContent,
      styleProfile: buildStylePresetProfile(state.workspace.templateStylePreset, state.workspace.customTemplateName || "手动模板"),
    };
  }

  return {
    sourceLabel: "系统默认模板",
    templateName: state.workspace.title || "系统默认模板",
    baseContent: buildDefaultPatentTemplate(state.workspace.title, state.workspace.patentType),
    styleProfile: buildStylePresetProfile(state.workspace.templateStylePreset, "系统默认模板"),
  };
}

function buildLocalTemplateResult() {
  const templateSource = resolveTemplateSource();
  const mode = state.workspace.blankMode === "guided" ? "guided" : "blank";
  const isDefaultTemplate = /系统默认|绯荤粺榛樿/.test(templateSource.sourceLabel || "");
  const decorated = isDefaultTemplate ? templateSource.baseContent : decorateTemplateForMode(templateSource.baseContent, mode);

  return {
    markdown: decorated.trim(),
    generationMode: "local-template",
    generationModeLabel: "本地模板工坊",
    sourceLabel: templateSource.sourceLabel,
    styleProfile: templateSource.styleProfile,
  };
}

async function saveBuilderTemplateRecord({ syncToTemplate = false } = {}) {
  const output = normalizeTemplateText(buildTemplateFromBuilderV2());
  if (!output) {
    setBuilderStatus("画布还是空的，先加几个模块再保存。", "error");
    return null;
  }

  const templateName = String(state.workspace.templateBuilderName || "").trim() || "我的可视化模板";
  const templates = getBuilderSavedTemplates();
  const currentIndex = templates.findIndex((item) => item.name === templateName);
  const record = normalizeBuilderSavedTemplate({
    ...templates[currentIndex],
    name: templateName,
    content: output,
    modules: getBuilderModules(),
  });

  if (currentIndex >= 0) {
    templates[currentIndex] = record;
  } else {
    templates.unshift(record);
  }

  state.workspace.builderSavedTemplates = templates;
  state.workspace.selectedBuilderTemplateId = record.id;
  if (syncToTemplate) {
    state.workspace.templateSourceType = "builder";
    state.workspace.customTemplateName = record.name;
    state.workspace.customTemplateContent = record.content;
  }

  renderBuilderTemplateLibrary();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();
  renderCustomTemplateStatus();
  await persistWorkspaceNow();
  return record;
}

async function distillStyle() {
  setLoading(dom.distillButton, true, "蒸馏中...");
  try {
    setStyleStatus("正在蒸馏并保存大师模板，完成后右侧会刷新结果。", "neutral");
    resetOutputBlock(dom.styleOutput, "正在蒸馏并保存大师模板…");
    if (!String(state.workspace.styleMasterName || "").trim()) {
      throw new Error("先给大师模板起个名字。");
    }
    if (!String(state.workspace.styleSpecificationText || "").trim()) {
      throw new Error("至少要提供说明书正文。");
    }
    if (!String(state.workspace.styleClaimsText || "").trim()) {
      throw new Error("至少要提供权利要求书。");
    }
    const profile = buildDistilledStyleProfile();
    const storedMaster = normalizeDistilledMaster({
      id: createStoredItemId("master"),
      name: profile.displayName,
      abstractText: profile.abstractText,
      specificationText: profile.specificationText,
      claimsText: profile.claimsText,
      templateContent: profile.templateContent,
      analysisMarkdown: profile.analysisMarkdown,
      styleProfile: profile,
    });
    const masters = getDistilledMasters().filter((item) => item.name !== storedMaster.name);
    masters.unshift(storedMaster);
    state.workspace.distilledMasters = masters;
    state.workspace.selectedDistilledMasterId = storedMaster.id;
    state.workspace.styleProfile = profile;
    await persistWorkspaceNow();
    renderDistilledMastersLibrary();
    renderTemplateSourceSelectors();
    renderWorkspaceOverview();
    renderTemplateContext();
    setStyleStatus(`已保存大师模板：${storedMaster.name}。右侧正在显示蒸馏结果，左侧“已保存大师模板”里也已经加入它。`, "success");
    await streamStyleProfile(profile);
    applySelectedDistilledMaster(storedMaster.id, {
      persist: false,
      stream: false,
      statusText: `已保存并选中大师模板：${storedMaster.name}。现在点左侧列表或下拉栏，都能直接回看这套蒸馏结果。`,
      tone: "success",
    });
  } catch (error) {
    if (dom.styleOutput) {
      dom.styleOutput.textContent = `蒸馏失败：${error.message}`;
      dom.styleOutput.classList.remove("empty-state");
    }
    setStyleStatus(`蒸馏失败：${error.message}`, "error");
  } finally {
    setLoading(dom.distillButton, false);
  }
}

async function generateBackground() {
  setLoading(dom.backgroundButton, true, "生成中...");
  try {
    const query = String(state.workspace.sourceQuery || state.workspace.title || state.workspace.keywords || "").trim();
    if (!query) {
      throw new Error("先输入标题或关键词。");
    }
    resetBackgroundPanels();
    resetOutputBlock(dom.backgroundOutput, "正在整理背景资料…");
    state.workspace.title = query;
    state.workspace.keywords = query;
    let finalBackground = null;
    await requestNdjsonStream("/api/workbench/generate-background-stream", {
      method: "POST",
      payload: {
        title: query,
        keywords: query,
        focus: "",
        customPainPoints: "",
      },
      onMessage: async (message) => {
        if (message.type === "status") {
          setLoadingText(dom.backgroundButton, message.message || "整理中...");
          return;
        }
        if (message.type === "error") {
          throw new Error(message.message || "背景资料生成失败。");
        }
        if (!message.background) {
          return;
        }

        const normalized = normalizeBackgroundPackage(message.background);
        state.workspace.background = normalized;
        state.workspace.sourceQuery = query;
        if (dom.topicTitle) dom.topicTitle.value = query;
        if (dom.topicKeywords) dom.topicKeywords.value = query;

        if (message.type === "partial") {
          renderBackgroundV2(normalized);
          renderWorkspaceOverview();
          renderTemplateContext();
          return;
        }

        finalBackground = normalized;
        renderBackgroundPanels(normalized);
        await streamBackgroundDraft(normalized);
        renderWorkspaceOverview();
        renderTemplateContext();
      },
    });
    if (finalBackground) {
      state.workspace.background = finalBackground;
      state.workspace.sourceQuery = query;
      await persistWorkspaceNow();
    }
  } catch (error) {
    if (dom.backgroundOutput) {
      dom.backgroundOutput.textContent = `生成失败：${error.message}`;
      resetBackgroundPanels();
      dom.backgroundOutput.classList.remove("empty-state");
    }
  } finally {
    setLoading(dom.backgroundButton, false);
  }
}

async function generateTemplate() {
  setLoading(dom.templateButton, true, "生成中...");
  try {
    if (!String(state.workspace.title || "").trim()) {
      throw new Error("先填写专利题目。");
    }
    const response = buildLocalTemplateResult();
    state.workspace.styleProfile = response.styleProfile;
    state.workspace.template = response;
    await persistWorkspaceNow();

    renderStyleProfile(response.styleProfile);
    renderWorkspaceOverview();
    renderTemplateContext();
    await streamTemplateResult(response);
  } catch (error) {
    if (dom.templateOutput) {
      dom.templateOutput.textContent = `模板生成失败：${error.message}`;
      dom.templateOutput.classList.remove("empty-state");
    }
  } finally {
    setLoading(dom.templateButton, false);
  }
}

async function uploadTemplateSourceFile() {
  if (!dom.templateFileInput?.files?.length) return;
  const file = dom.templateFileInput.files[0];

  try {
    setTemplateStatus("正在解析模板，请稍等…", "neutral");
    const content = await readTemplateLikeFile(file, "模板文件");

    if (!content) {
      throw new Error("模板文件内容为空。");
    }

    setTemplateFileName(file.name);
    await applyTemplateSourceContent(file.name, content);
  } catch (error) {
    setTemplateFileName("未选择任何文件");
    setTemplateStatus(`模板上传失败：${error.message}`, "error");
  } finally {
    dom.templateFileInput.value = "";
  }
}

async function applyTemplateSourceContent(templateName, content) {
  state.workspace.customTemplateName = templateName;
  state.workspace.customTemplateContent = content;
  if (dom.templateSourceText) {
    dom.templateSourceText.value = content;
  }
  state.workspace.templateSourceType = "uploaded";
  renderCustomTemplateStatus();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();
  await persistWorkspaceNow();
}

function setTemplateFileName(fileName = "") {
  if (!dom.templateFileName) return;
  dom.templateFileName.textContent = fileName || "未选择任何文件";
}

function buildFileSelectionSignature(input) {
  const file = input?.files?.[0];
  return file ? `${file.name}:${file.size}:${file.lastModified}` : "";
}

function openFilePickerWithFallback(input, handler) {
  if (!input) return;

  const beforeSelection = buildFileSelectionSignature(input);
  let finished = false;
  const timerIds = [];

  const cleanup = () => {
    finished = true;
    timerIds.forEach((timerId) => window.clearTimeout(timerId));
    window.removeEventListener("focus", detectSelection, true);
    document.removeEventListener("visibilitychange", detectSelectionFromVisibility, true);
  };

  const detectSelection = () => {
    if (finished) return;
    const afterSelection = buildFileSelectionSignature(input);
    if (!afterSelection || afterSelection === beforeSelection) return;
    cleanup();
    handleFileInputSelection({ target: input }, handler);
  };

  const detectSelectionFromVisibility = () => {
    if (document.visibilityState === "visible") {
      detectSelection();
    }
  };

  [180, 480, 960, 1600].forEach((delay) => {
    timerIds.push(window.setTimeout(detectSelection, delay));
  });
  window.addEventListener("focus", detectSelection, true);
  document.addEventListener("visibilitychange", detectSelectionFromVisibility, true);

  try {
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
  } catch {}

  input.click();
}

async function handleFileInputSelection(event, handler) {
  const input = event?.target;
  if (!input?.files?.length || input.dataset.uploading === "1") return;
  input.dataset.uploading = "1";
  try {
    await handler();
  } finally {
    delete input.dataset.uploading;
  }
}

async function clearTemplateSource() {
  state.workspace.customTemplateName = "";
  state.workspace.customTemplateContent = "";
  state.workspace.templateSourceType = "default";
  setTemplateFileName("未选择任何文件");
  if (dom.templateSourceText) {
    dom.templateSourceText.value = "";
  }
  renderCustomTemplateStatus();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();
  await persistWorkspaceNow();
}

function cloneBuilderSubtree(modules, sourceId, nextParentId = "") {
  const source = modules.find((module) => module.id === sourceId);
  if (!source) return [];

  const nextId = createBuilderModuleId();
  const cloned = [{ ...source, id: nextId, parentId: nextParentId }];
  const children = modules.filter((module) => module.parentId === sourceId);
  for (const child of children) {
    cloned.push(...cloneBuilderSubtree(modules, child.id, nextId));
  }
  return cloned;
}

function collectBuilderDescendantIds(modules, sourceId) {
  const ids = [sourceId];
  const children = modules.filter((module) => module.parentId === sourceId);
  for (const child of children) {
    ids.push(...collectBuilderDescendantIds(modules, child.id));
  }
  return ids;
}

function saveBuilderModules(modules, { statusText = "", tone = "neutral", selectId = activeBuilderModuleId } = {}) {
  state.workspace.templateBuilderModules = normalizeBuilderNodes(modules);
  activeBuilderModuleId = selectId || state.workspace.templateBuilderModules[0]?.id || "";
  renderBuilderWorkspace();
  renderWorkspaceOverview();
  renderTemplateContext();
  scheduleWorkspaceSave();
  if (statusText) {
    setBuilderStatus(statusText, tone);
  }
}

function addBuilderNode(type, parentId = "") {
  const modules = [...getBuilderModules()];
  if (type !== BUILDER_MODULE_TYPES.heading && !parentId) {
    setBuilderStatus("先添加一个标题，再往标题里放段落或句子。", "error");
    return;
  }

  const module = {
    ...createNestedBuilderModuleSkeleton(type),
    parentId: type === BUILDER_MODULE_TYPES.heading ? "" : String(parentId || ""),
  };
  modules.push(module);
  saveBuilderModules(modules, {
    statusText: `已添加${getBuilderTypeLabel(type)}。`,
    tone: "success",
    selectId: module.id,
  });
}

function deleteBuilderNodeTree(moduleId) {
  const modules = getBuilderModules();
  const removeIds = new Set(collectBuilderDescendantIds(modules, moduleId));
  const nextModules = modules.filter((module) => !removeIds.has(module.id));
  saveBuilderModules(nextModules, {
    statusText: "模块已删除。",
    tone: "success",
    selectId: nextModules[0]?.id || "",
  });
}

function duplicateBuilderNodeTree(moduleId) {
  const modules = [...getBuilderModules()];
  const source = modules.find((module) => module.id === moduleId);
  if (!source) return;

  const clonedModules = cloneBuilderSubtree(modules, moduleId, source.parentId || "");
  modules.push(...clonedModules);
  saveBuilderModules(modules, {
    statusText: "模块已复制。",
    tone: "success",
    selectId: clonedModules[0]?.id || "",
  });
}

function addBuilderModule(type, insertIndex = getBuilderModules().length) {
  const modules = [...getBuilderModules()];
  const module = createBuilderModuleSkeleton(type);
  modules.splice(insertIndex, 0, module);
  saveBuilderModules(modules, {
    statusText: `已添加${getBuilderTypeLabel(type)}。`,
    tone: "success",
    selectId: module.id,
  });
}

function updateActiveBuilderModule(field, value) {
  const modules = getBuilderModules().map((module) =>
    module.id === activeBuilderModuleId
      ? {
          ...module,
          [field]: value,
        }
      : module,
  );
  saveBuilderModules(modules, { selectId: activeBuilderModuleId });
}

function deleteBuilderModule(moduleId) {
  const modules = getBuilderModules().filter((module) => module.id !== moduleId);
  const nextActiveId = modules[0]?.id || "";
  saveBuilderModules(modules, {
    statusText: "模块已删除。",
    tone: "success",
    selectId: nextActiveId,
  });
}

function duplicateBuilderModule(moduleId) {
  const modules = [...getBuilderModules()];
  const currentIndex = modules.findIndex((module) => module.id === moduleId);
  if (currentIndex === -1) return;

  const duplicated = {
    ...modules[currentIndex],
    id: createBuilderModuleId(),
  };
  modules.splice(currentIndex + 1, 0, duplicated);
  saveBuilderModules(modules, {
    statusText: "模块已复制。",
    tone: "success",
    selectId: duplicated.id,
  });
}

function moveBuilderModule(moduleId, nextIndex) {
  const modules = [...getBuilderModules()];
  const currentIndex = modules.findIndex((module) => module.id === moduleId);
  if (currentIndex === -1) return;

  const [module] = modules.splice(currentIndex, 1);
  const insertIndex = currentIndex < nextIndex ? nextIndex - 1 : nextIndex;
  modules.splice(insertIndex, 0, module);
  saveBuilderModules(modules, {
    statusText: "模块顺序已更新。",
    tone: "success",
    selectId: module.id,
  });
}

async function syncBuilderToTemplateWorkspace() {
  const record = await saveBuilderTemplateRecord({ syncToTemplate: true });
  if (!record) {
    return;
  }

  state.workspace.customTemplateName = record.name;
  state.workspace.customTemplateContent = record.content;
  if (dom.templateSourceText) {
    dom.templateSourceText.value = record.content;
  }
  renderCustomTemplateStatus();
  renderTemplateSourceSelectors();
  renderTemplateContext();
  renderWorkspaceOverview();
  setBuilderStatus("模板已保存并同步到模板工坊，现在可以直接在模板工坊里选它。", "success");
}

async function clearBuilderCanvas() {
  state.workspace.templateBuilderModules = [];
  activeBuilderModuleId = "";
  renderBuilderWorkspace();
  renderWorkspaceOverview();
  renderTemplateContext();
  await persistWorkspaceNow();
  setBuilderStatus("画布已清空。", "neutral");
}

function initBuilderWorkspace() {
  state.workspace.templateBuilderName = String(state.workspace.templateBuilderName || "").trim() || "我的可视化模板";
  state.workspace.templateBuilderModules = normalizeBuilderNodes(state.workspace.templateBuilderModules);
  renderBuilderWorkspace();
}

function resetOutputBlock(element, emptyText) {
  if (!element) return;
  element.classList.add("empty-state");
  element.classList.remove("structured-output");
  element.textContent = emptyText;
}

function resetBackgroundPanels() {
  renderPanelState(dom.backgroundOverview, "", "这里会先把标题拆成对象、方法、场景和约束。");
  renderPanelState(dom.backgroundKeywords, "", "这里会显示中文词、英文词和分类号线索。");
  renderPanelState(dom.backgroundSearchPlan, "", "这里会给出宽检索、窄检索和推荐数据库。");
  renderPanelState(dom.backgroundCommonPractice, "", "这里会用通俗语言解释常见技术路线和每部分的作用。");
  renderPanelState(dom.backgroundPaperResults, "", "这里会列出论文方法路线和创新点。");
  renderPanelState(dom.backgroundPatentResults, "", "这里会列出专利方法路线、创新点和对应权利焦点。");
  renderPanelState(dom.backgroundPainPoints, "", "这里会整理这个领域经常出现的问题和不足。");
}

function renderCurrentPageAfterWorkspaceReset() {
  fillSharedFields({ restoreTextInputs: false });
  hydrateSavedOutputs();
  if (dom.masterSelect && state.workspace.masterId) {
    dom.masterSelect.value = state.workspace.masterId;
  }

  if (page === "sources") {
    renderSourceGuides([]);
  }

  if (page === "style" && dom.styleOutput) {
    resetOutputBlock(dom.styleOutput, "风格画像会出现在这里。");
  }

  if (page === "background" && dom.backgroundOutput) {
    resetBackgroundPanels();
    resetOutputBlock(
      dom.backgroundOutput,
      "这里会输出相关领域的通用做法、论文的方法与创新点，以及专利的方法、创新点和对应权利。",
    );
  }

  if (page === "template") {
    renderCustomTemplateStatus();
    resetOutputBlock(dom.templateOutput, "模板会出现在这里。");
  }

  if (page === "builder") {
    activeBuilderModuleId = "";
    renderBuilderWorkspace();
    setBuilderStatus("画布和输入已经清空。", "neutral");
  }
}

function buildPageScopedWorkspaceReset() {
  const nextWorkspace = {
    ...state.workspace,
  };

  if (page === "sources") {
    nextWorkspace.title = "";
    nextWorkspace.agentName = "";
    nextWorkspace.sourceQuery = "";
    nextWorkspace.keywords = "";
    return nextWorkspace;
  }

  if (page === "style") {
    nextWorkspace.styleMasterName = "";
    nextWorkspace.styleAbstractText = "";
    nextWorkspace.styleSpecificationText = "";
    nextWorkspace.styleClaimsText = "";
    nextWorkspace.styleProfile = null;
    return nextWorkspace;
  }

  if (page === "background") {
    nextWorkspace.sourceQuery = "";
    nextWorkspace.title = "";
    nextWorkspace.keywords = "";
    nextWorkspace.background = null;
    return nextWorkspace;
  }

  if (page === "template") {
    nextWorkspace.title = "";
    nextWorkspace.patentType = defaultWorkspace.patentType;
    nextWorkspace.blankMode = defaultWorkspace.blankMode;
    nextWorkspace.templateSourceType = defaultWorkspace.templateSourceType;
    nextWorkspace.customTemplateName = "";
    nextWorkspace.customTemplateContent = "";
    nextWorkspace.template = null;
    return nextWorkspace;
  }

  if (page === "builder") {
    nextWorkspace.templateBuilderName = defaultWorkspace.templateBuilderName;
    nextWorkspace.templateBuilderModules = [];
    return nextWorkspace;
  }

  return {
    ...defaultWorkspace,
    masterId: state.sampleMasters[0]?.id || "",
  };
}

async function clearCurrentPageInputs() {
  const confirmed = window.confirm("确定清空当前页输入吗？这一页相关内容会恢复为空。");
  if (!confirmed) return;

  state.workspace = buildPageScopedWorkspaceReset();
  await persistWorkspaceNow();
  renderCurrentPageAfterWorkspaceReset();
}

async function resetEntireWorkspace() {
  const confirmed = window.confirm("确定重置整个工作区吗？这会清空所有页面里保存的输入、模板和中间结果。");
  if (!confirmed) return;

  state.workspace = {
    ...defaultWorkspace,
    masterId: state.sampleMasters[0]?.id || "",
  };
  await persistWorkspaceNow();
  renderCurrentPageAfterWorkspaceReset();
}

async function loadChatStateFromServer() {
  const result = await requestJson("/api/chat/state");
  state.chat.messages = result.messages || [];
  state.chat.files = result.files || [];
  renderChatState();
}

async function sendChatMessage() {
  if (!dom.chatInput || !dom.chatSendButton) return;
  const message = dom.chatInput.value.trim();
  if (!message) return;

  setLoading(dom.chatSendButton, true, "发送中...");
  try {
    const result = await requestJson("/api/chat/message", {
      method: "POST",
      payload: { message },
    });
    state.chat.messages = result.messages || [];
    state.chat.files = result.files || [];
    dom.chatInput.value = "";
    renderChatState();
  } catch (error) {
    if (dom.chatMemoryStatus) {
      dom.chatMemoryStatus.textContent = `发送失败：${error.message}`;
      dom.chatMemoryStatus.dataset.tone = "error";
    }
  } finally {
    setLoading(dom.chatSendButton, false);
  }
}

function isTextFileClient(file) {
  return (
    file.type.startsWith("text/") ||
    /\.(txt|md|markdown|csv|json|xml|ya?ml|log|ini|cfg|html?|js|ts|tsx|jsx|py|java|c|cpp|h|hpp|sql)$/i.test(file.name)
  );
}

async function uploadChatFiles() {
  if (!dom.chatFileInput?.files?.length) return;
  const fileList = [...dom.chatFileInput.files];
  const files = await Promise.all(
    fileList.map(async (file) => {
      const supported = isTextFileClient(file);
      const content = supported ? await file.text() : "";
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        supported,
        content,
      };
    }),
  );

  try {
    const result = await requestJson("/api/chat/upload", {
      method: "POST",
      payload: { files },
    });
    state.chat.files = result.files || [];
    state.chat.messages = result.messages || state.chat.messages;
    renderChatState();
    dom.chatFileInput.value = "";
  } catch (error) {
    if (dom.chatMemoryStatus) {
      dom.chatMemoryStatus.textContent = `上传失败：${error.message}`;
      dom.chatMemoryStatus.dataset.tone = "error";
    }
  }
}

async function clearChatMemory() {
  try {
    const result = await requestJson("/api/chat/clear", {
      method: "POST",
      payload: {},
    });
    state.chat.messages = result.messages || [];
    state.chat.files = result.files || [];
    renderChatState();
  } catch (error) {
    if (dom.chatMemoryStatus) {
      dom.chatMemoryStatus.textContent = `清空失败：${error.message}`;
      dom.chatMemoryStatus.dataset.tone = "error";
    }
  }
}

function copyOutput(targetId) {
  const element = document.querySelector(`#${targetId}`);
  navigator.clipboard.writeText(element?.textContent || "").catch(() => {});
}

function refreshNavigationLabels() {
  if (page === "sources") {
    window.location.replace("/background.html");
  }
}

function wireNavigationPersistence() {
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) {
        return;
      }

      if (link.getAttribute("target") === "_blank") {
        return;
      }

      if (link.classList.contains("brand-mark")) {
        return;
      }

      const nextUrl = new URL(href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      clearTimeout(workspaceSaveTimer);
      try {
        await persistWorkspaceNow();
      } catch (error) {
        console.error(error);
      }
      window.location.href = nextUrl.toString();
    });
  });
}

function wireActions() {
  dom.builderSyncButton?.addEventListener("click", syncBuilderToTemplateWorkspace);
  dom.builderSaveButton?.addEventListener("click", async () => {
    const record = await saveBuilderTemplateRecord();
    if (record) {
      setBuilderStatus(`已保存模板：${record.name}。`, "success");
    }
  });
  dom.builderClearButton?.addEventListener("click", clearBuilderCanvas);
  dom.builderToolList?.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-builder-tool]");
    if (tool) {
      const activeModule = getBuilderModuleById(activeBuilderModuleId);
      if (tool.dataset.builderTool === BUILDER_MODULE_TYPES.heading) {
        addBuilderNode(BUILDER_MODULE_TYPES.heading, "");
        return;
      }

      if (!activeModule) {
        setBuilderStatus("先放一个标题框，再继续往里面加段落或句子。", "error");
        return;
      }

      const parentId =
        tool.dataset.builderTool === BUILDER_MODULE_TYPES.paragraph
          ? activeModule.type === BUILDER_MODULE_TYPES.heading
            ? activeModule.id
            : activeModule.type === BUILDER_MODULE_TYPES.paragraph
              ? activeModule.parentId
              : activeModule.parentId
          : activeModule.type === BUILDER_MODULE_TYPES.paragraph
            ? activeModule.id
            : activeModule.type === BUILDER_MODULE_TYPES.heading
              ? activeModule.id
              : activeModule.parentId;
      addBuilderNode(tool.dataset.builderTool, parentId || "");
    }
  });
  dom.builderToolList?.addEventListener("dragstart", (event) => {
    const tool = event.target.closest("[data-builder-tool]");
    if (!tool) return;
    builderDragPayload = {
      source: "tool",
      type: tool.dataset.builderTool,
    };
  });
  dom.refreshGuides?.addEventListener("click", refreshSourceGuides);
  dom.distillButton?.addEventListener("click", distillStyle);
  dom.backgroundButton?.addEventListener("click", generateBackground);
  dom.templateButton?.addEventListener("click", generateTemplate);
  document.querySelectorAll("[data-file-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.fileTrigger;
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;
      input.click();
    });
  });
  dom.templateFileInput?.addEventListener("change", (event) =>
    handleFileInputSelection(event, uploadTemplateSourceFile),
  );
  dom.templateFileInput?.addEventListener("input", (event) =>
    handleFileInputSelection(event, uploadTemplateSourceFile),
  );
  dom.templateFileButton?.addEventListener("click", () =>
    openFilePickerWithFallback(dom.templateFileInput, uploadTemplateSourceFile),
  );
  dom.templateClearButton?.addEventListener("click", clearTemplateSource);
  const bindStyleFileInput = (input, fieldKey, textArea, label) => {
    const handleUpload = async () => {
      const file = input?.files?.[0];
      if (!file) return;
      await uploadStyleDocument(file, fieldKey, textArea, label);
      input.value = "";
    };

    input?.addEventListener("change", (event) => handleFileInputSelection(event, handleUpload));
    input?.addEventListener("input", (event) => handleFileInputSelection(event, handleUpload));
  };

  bindStyleFileInput(dom.styleAbstractFileInput, "styleAbstractText", dom.styleAbstractText, "摘要文件");
  bindStyleFileInput(
    dom.styleSpecificationFileInput,
    "styleSpecificationText",
    dom.styleSpecificationText,
    "说明书文件",
  );
  bindStyleFileInput(dom.styleClaimsFileInput, "styleClaimsText", dom.styleClaimsText, "权利要求书文件");
  dom.builderCanvas?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-builder-delete]");
    if (deleteButton) {
      deleteBuilderNodeTree(deleteButton.dataset.builderDelete);
      return;
    }

    const duplicateButton = event.target.closest("[data-builder-duplicate]");
    if (duplicateButton) {
      duplicateBuilderNodeTree(duplicateButton.dataset.builderDuplicate);
      return;
    }

    const insertButton = event.target.closest("[data-builder-insert]");
    if (insertButton) {
      addBuilderNode(insertButton.dataset.builderInsert, "");
      return;
    }

    const addButton = event.target.closest("[data-builder-add-type]");
    if (addButton) {
      addBuilderNode(addButton.dataset.builderAddType, addButton.dataset.builderAddParent || "");
      return;
    }

    const card = event.target.closest("[data-builder-module-id]");
    if (card) {
      activeBuilderModuleId = card.dataset.builderModuleId;
      renderBuilderWorkspace();
    }
  });
  dom.builderCanvas?.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-builder-module-id]");
    if (!card) return;
    builderDragPayload = {
      source: "canvas",
      moduleId: card.dataset.builderModuleId,
    };
  });
  dom.builderCanvas?.addEventListener("dragend", () => {
    builderDragPayload = null;
    dom.builderCanvas
      ?.querySelectorAll(".builder-drop-slot.is-over")
      .forEach((slot) => slot.classList.remove("is-over"));
  });
  dom.builderCanvas?.addEventListener("dragover", (event) => {
    const slot = event.target.closest("[data-builder-drop-index]");
    if (!slot) return;
    event.preventDefault();
    dom.builderCanvas
      .querySelectorAll(".builder-drop-slot.is-over")
      .forEach((item) => item.classList.remove("is-over"));
    slot.classList.add("is-over");
  });
  dom.builderCanvas?.addEventListener("dragleave", (event) => {
    const slot = event.target.closest("[data-builder-drop-index]");
    if (slot) {
      slot.classList.remove("is-over");
    }
  });
  dom.builderCanvas?.addEventListener("drop", (event) => {
    const slot = event.target.closest("[data-builder-drop-index]");
    if (!slot || !builderDragPayload) return;
    event.preventDefault();
    slot.classList.remove("is-over");
    if (builderDragPayload.source === "tool") {
      addBuilderNode(builderDragPayload.type, "");
    } else if (builderDragPayload.moduleId) {
      activeBuilderModuleId = builderDragPayload.moduleId;
      renderBuilderWorkspace();
    }
    builderDragPayload = null;
  });
  dom.builderSettingsPanel?.addEventListener("input", (event) => {
    const field = event.target.closest("[data-builder-field]");
    if (!field) return;
    updateActiveBuilderModule(field.dataset.builderField, field.value);
  });
  dom.chatSendButton?.addEventListener("click", sendChatMessage);
  dom.chatFileInput?.addEventListener("change", uploadChatFiles);
  dom.chatClearButton?.addEventListener("click", clearChatMemory);
  dom.chatInput?.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      sendChatMessage();
    }
  });

  dom.useSampleText?.addEventListener("click", async () => {
    state.workspace.styleMasterName = "演示大师模板：电池热安全";
    state.workspace.styleAbstractText =
      "本发明涉及一种电池热安全监测方法，通过温度、气体和压力多信号联合判断热失控风险，并在异常早期输出预警结果。";
    state.workspace.styleSpecificationText = `技术领域
本发明涉及电池安全监测领域，尤其涉及一种多模态热失控预警方法。

背景技术
现有电池热失控预警大多依赖单一温度信号，容易受环境和工况波动影响，误报率较高。

发明内容
为了解决现有技术中预警滞后和误报率较高的问题，本发明提供一种结合温度、气体和压力信息的联合预警方法。

具体实施方式
系统采集电池包内多个监测点的温度信号、气体浓度信号和压力变化信号。
当多类信号同时满足阈值条件时，系统输出一级预警。
当气体和压力继续异常时，系统提高告警等级并联动保护模块。`;
    state.workspace.styleClaimsText = `1.一种电池热失控预警方法，其特征在于，包括：采集温度信号、气体信号和压力信号；根据联合判据输出预警结果。
2.根据权利要求1所述的方法，其特征在于，所述联合判据包括温升速率阈值和气体浓度阈值。
3.根据权利要求1所述的方法，其特征在于，预警结果包括分级告警和联动保护控制。`;
    await persistWorkspaceNow();
    fillSharedFields({ restoreTextInputs: true });
    setStyleStatus("演示样本已载入。现在点“解析并保存为大师模板”才会真正保存到左侧列表。", "neutral");
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      copyOutput(button.dataset.copyTarget);
      animateCopyFeedback(button);
    });
  });

  wireNavigationPersistence();
}

function hydrateSavedOutputs() {
  const selectedMaster = getSelectedDistilledMaster();
  if (selectedMaster) {
    applySelectedDistilledMaster(selectedMaster.id, {
      persist: false,
      stream: false,
      statusText: `当前选中大师模板：${selectedMaster.name}。点左侧列表或下拉栏可以切换。`,
      tone: "success",
    });
  } else if (state.workspace.styleProfile) {
    renderStyleProfile(state.workspace.styleProfile);
    setStyleStatus("当前显示的是最近一次蒸馏结果。保存后会出现在左侧列表。", "neutral");
  } else {
    setStyleStatus("还没有开始蒸馏。保存后会在右侧显示结果，并加入左侧“已保存大师模板”列表。", "neutral");
  }
  if (state.workspace.background) renderBackgroundV2(state.workspace.background);
  if (state.workspace.template) renderTemplate(state.workspace.template);
  renderCustomTemplateStatus();
  renderDistilledMastersLibrary();
  renderTemplateSourceSelectors();
  renderBuilderTemplateLibrary();
  renderWorkspaceOverview();
  renderTemplateContext();
  renderBuilderWorkspace();
}

async function initAuthenticatedApp() {
  const [initData, workspaceResult] = await Promise.all([
    requestJson("/api/workbench/init"),
    requestJson("/api/workspace"),
  ]);

  state.sampleMasters = initData.sampleMasters || [];
  state.disclaimer = initData.disclaimer || "";
  state.settingsSummary = initData.settingsSummary || null;
  state.workspace = {
    ...defaultWorkspace,
    ...(workspaceResult.workspace || {}),
  };
  state.workspace.background = normalizeBackgroundPackage(state.workspace.background);
  state.workspace.distilledMasters = getDistilledMasters();
  state.workspace.builderSavedTemplates = getBuilderSavedTemplates();
  state.workspace.templateBuilderModules = normalizeBuilderNodes(state.workspace.templateBuilderModules);
  state.workspace.templateBuilderName = state.workspace.templateBuilderName || "我的可视化模板";
  state.workspace.templateSourceType = state.workspace.templateSourceType || "default";
  state.workspace.templateStylePreset = state.workspace.templateStylePreset || "steady-agent";
  state.workspace.selectedDistilledMasterId =
    state.workspace.selectedDistilledMasterId || state.workspace.distilledMasters[0]?.id || "";
  state.workspace.selectedBuilderTemplateId =
    state.workspace.selectedBuilderTemplateId || state.workspace.builderSavedTemplates[0]?.id || "";

  if (dom.disclaimer) {
    dom.disclaimer.textContent = state.disclaimer;
  }

  fillSharedFields({ restoreTextInputs: false });
  attachPersistence();
  populateMasterSelect();
  createAuthUi();
  createSettingsUi();
  hydrateSavedOutputs();
  wireActions();
  wireUserAdminPage();

  if (page === "sources") {
    renderSourceGuides(initData.sourceGuides || []);
    if (state.workspace.sourceQuery || state.workspace.title || state.workspace.agentName) {
      await refreshSourceGuides();
    }
  }

  if (page === "builder") {
    initBuilderWorkspace();
  }

  if (page === "chat") {
    await loadChatStateFromServer();
  }

  if (page === "users") {
    if (state.authUser.role !== "admin") {
      window.location.replace("/background.html");
      return;
    }
    await refreshUserAdminPage();
    setUserAdminStatus("可以开始管理账号、查看密码和重置密码。", "neutral");
  }

  loadMotionLibrary().then(() => {
    animatePageEntrance();
    [dom.styleOutput, dom.backgroundOutput, dom.templateOutput, dom.builderPreview].forEach(animateGeneratedOutput);
    animateBuilderCanvas();
  });
}

async function init() {
  refreshNavigationLabels();
  createLoginUi();
  const currentUser = await loadCurrentUser();
  if (!currentUser) {
    loginUi.open();
    return;
  }

  state.authUser = currentUser;
  loginUi.close();
  await initAuthenticatedApp();
}

init().catch((error) => {
  if (dom.disclaimer) {
    dom.disclaimer.textContent = `初始化失败：${error.message}`;
  }
  if (dom.chatMemoryStatus) {
    dom.chatMemoryStatus.textContent = `初始化失败：${error.message}`;
    dom.chatMemoryStatus.dataset.tone = "error";
  }
  setTemplateStatus(`初始化失败：${error.message}`, "error");
});
