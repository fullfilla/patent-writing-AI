import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDir = path.join(__dirname, "..", ".local");
const workspaceDir = path.join(localDir, "workspaces");

export const defaultWorkspace = {
  agentName: "",
  masterId: "",
  styleRawText: "",
  styleNotes: "",
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
  styleProfile: null,
  background: null,
  template: null,
};

function getWorkspacePath(userId = "default") {
  return path.join(workspaceDir, `${userId}.json`);
}

export function normalizeWorkspace(input = {}) {
  const workspace = {
    ...defaultWorkspace,
    ...(input && typeof input === "object" ? input : {}),
  };

  if (!workspace.keywords && workspace.sourceQuery) {
    workspace.keywords = workspace.sourceQuery;
  }

  if (!workspace.sourceQuery && workspace.keywords) {
    workspace.sourceQuery = workspace.keywords;
  }

  if (!workspace.templateBuilderName) {
    workspace.templateBuilderName = "我的可视化模板";
  }

  if (!Array.isArray(workspace.templateBuilderModules)) {
    workspace.templateBuilderModules = [];
  }

  return workspace;
}

export async function loadWorkspace(userId) {
  try {
    const raw = await readFile(getWorkspacePath(userId), "utf8");
    return normalizeWorkspace(JSON.parse(raw));
  } catch {
    return { ...defaultWorkspace };
  }
}

export async function saveWorkspace(userId, input = {}) {
  const workspace = normalizeWorkspace(input);
  await mkdir(workspaceDir, { recursive: true });
  await writeFile(getWorkspacePath(userId), `${JSON.stringify(workspace, null, 2)}\n`, "utf8");
  return workspace;
}
