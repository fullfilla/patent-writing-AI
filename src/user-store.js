import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localDir = path.join(__dirname, "..", ".local");
const usersPath = path.join(localDir, "users.json");
const sessionsPath = path.join(localDir, "sessions.json");
const passwordsTextPath = path.join(__dirname, "..", "账号密码.txt");
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = "pws_session";
export const PASSWORDS_TEXT_FILE_PATH = passwordsTextPath;
export const USER_ROLES = {
  admin: "admin",
  user: "user",
};

const defaultSeedUsers = [
  {
    username: "admin",
    displayName: "系统管理员",
    password: "Admin@123456",
    role: USER_ROLES.admin,
  },
  {
    username: "writer",
    displayName: "专利用户",
    password: "User@123456",
    role: USER_ROLES.user,
  },
];

const defaultSeedUsersByUsername = new Map(
  defaultSeedUsers.map((user) => [sanitizeUsername(user.username), user]),
);

export function buildPermissions(role = USER_ROLES.user) {
  if (role === USER_ROLES.admin) {
    return [
      "workspace:use",
      "chat:use",
      "settings:read",
      "settings:write",
      "users:read",
      "users:write",
    ];
  }

  return ["workspace:use", "chat:use"];
}

export function sanitizeUsername(value = "") {
  return String(value || "").trim().toLowerCase();
}

function validateRole(role = USER_ROLES.user) {
  if (Object.values(USER_ROLES).includes(role)) {
    return role;
  }
  throw new Error("用户角色不合法");
}

function validateStatus(status = "active") {
  if (status === "active" || status === "disabled") {
    return status;
  }
  throw new Error("用户状态不合法");
}

export function createPasswordRecord(password = "") {
  const normalized = String(password || "");
  if (normalized.length < 8) {
    throw new Error("密码至少需要 8 位");
  }

  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(normalized, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password = "", record = {}) {
  if (!record?.salt || !record?.hash) {
    return false;
  }

  const actual = Buffer.from(record.hash, "hex");
  const expected = scryptSync(String(password || ""), record.salt, 64);
  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function buildCredentialsText(users = []) {
  const lines = [
    "Patent Writing Studio 账号密码清单",
    `生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    "说明：此文件包含明文密码，仅限本机管理员查看和维护，请勿外传。",
    "",
  ];

  for (const user of users) {
    lines.push(`用户名：${user.username || ""}`);
    lines.push(`显示名：${user.displayName || ""}`);
    lines.push(`角色：${user.role || USER_ROLES.user}`);
    lines.push(`状态：${user.status || "active"}`);
    lines.push(`密码：${user.passwordPlaintext || "未保存明文，请在管理员后台重置密码"}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

async function syncPasswordsTextFile(users = []) {
  await writeFile(passwordsTextPath, buildCredentialsText(users), "utf8");
}

function toPublicUser(user = {}, { includePassword = false } = {}) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt || null,
    permissions: buildPermissions(user.role),
    ...(includePassword
      ? {
          password: user.passwordPlaintext || "",
          passwordAvailable: Boolean(user.passwordPlaintext),
        }
      : {}),
  };
}

function createUserRecord({ username, displayName, password, role = USER_ROLES.user, status = "active" }) {
  const normalizedUsername = sanitizeUsername(username);
  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    throw new Error("用户名需要 3 到 32 位，只能使用字母、数字、点、下划线或连字符");
  }

  const name = String(displayName || "").trim() || normalizedUsername;
  const now = new Date().toISOString();
  const passwordRecord = createPasswordRecord(password);

  return {
    id: randomUUID(),
    username: normalizedUsername,
    displayName: name,
    role: validateRole(role),
    status: validateStatus(status),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    passwordSalt: passwordRecord.salt,
    passwordHash: passwordRecord.hash,
    passwordPlaintext: normalized,
  };
}

async function ensureLocalDir() {
  await mkdir(localDir, { recursive: true });
}

async function writeJson(targetPath, payload) {
  await ensureLocalDir();
  await writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function readJson(targetPath, fallbackFactory) {
  try {
    const raw = await readFile(targetPath, "utf8");
    return JSON.parse(raw);
  } catch {
    const fallback = fallbackFactory();
    await writeJson(targetPath, fallback);
    return fallback;
  }
}

async function loadUserStore() {
  const store = await readJson(usersPath, () => ({
    version: 1,
    users: defaultSeedUsers.map((item) => createUserRecord(item)),
  }));

  let mutated = false;
  store.version = Math.max(Number(store.version) || 1, 2);
  store.users = store.users.map((user) => {
    if (typeof user.passwordPlaintext === "string") {
      return user;
    }

    const seedUser = defaultSeedUsersByUsername.get(user.username);
    if (
      seedUser &&
      verifyPassword(seedUser.password, {
        salt: user.passwordSalt,
        hash: user.passwordHash,
      })
    ) {
      mutated = true;
      return {
        ...user,
        passwordPlaintext: seedUser.password,
      };
    }

    mutated = true;
    return {
      ...user,
      passwordPlaintext: "",
    };
  });

  if (mutated) {
    await writeJson(usersPath, store);
  }
  await syncPasswordsTextFile(store.users);
  return store;
}

async function saveUserStore(store) {
  await writeJson(usersPath, store);
  await syncPasswordsTextFile(store.users);
  return store;
}

async function loadSessionStore() {
  return readJson(sessionsPath, () => ({
    version: 1,
    sessions: [],
  }));
}

async function saveSessionStore(store) {
  await writeJson(sessionsPath, store);
  return store;
}

function countActiveAdmins(users = []) {
  return users.filter((user) => user.role === USER_ROLES.admin && user.status === "active").length;
}

export async function listUsers(options = {}) {
  const store = await loadUserStore();
  return store.users.map((user) => toPublicUser(user, options));
}

export async function findUserById(userId) {
  const store = await loadUserStore();
  const user = store.users.find((item) => item.id === userId);
  return user ? toPublicUser(user) : null;
}

export async function createUser(input = {}) {
  const store = await loadUserStore();
  const username = sanitizeUsername(input.username);
  if (store.users.some((item) => item.username === username)) {
    throw new Error("这个用户名已经存在");
  }

  const user = createUserRecord(input);
  store.users.push(user);
  await saveUserStore(store);
  return toPublicUser(user);
}

export async function updateUser(userId, updates = {}, actingUserId = "") {
  const store = await loadUserStore();
  const index = store.users.findIndex((item) => item.id === userId);
  if (index === -1) {
    throw new Error("用户不存在");
  }

  const current = store.users[index];
  const next = {
    ...current,
    displayName: String(updates.displayName ?? current.displayName).trim() || current.displayName,
    role: updates.role ? validateRole(updates.role) : current.role,
    status: updates.status ? validateStatus(updates.status) : current.status,
    updatedAt: new Date().toISOString(),
  };

  if (updates.password) {
    const passwordRecord = createPasswordRecord(updates.password);
    next.passwordSalt = passwordRecord.salt;
    next.passwordHash = passwordRecord.hash;
    next.passwordPlaintext = String(updates.password);
  }

  if (actingUserId && current.id === actingUserId) {
    if (next.role !== USER_ROLES.admin || next.status !== "active") {
      throw new Error("不能把当前登录管理员降级或停用");
    }
  }

  const projectedUsers = store.users.map((user) => (user.id === userId ? next : user));
  if (countActiveAdmins(projectedUsers) < 1) {
    throw new Error("系统里至少要保留一个启用中的管理员");
  }

  store.users[index] = next;
  await saveUserStore(store);
  return toPublicUser(next);
}

export async function authenticateUser({ username, password } = {}) {
  const store = await loadUserStore();
  const normalizedUsername = sanitizeUsername(username);
  const user = store.users.find((item) => item.username === normalizedUsername);
  if (!user || user.status !== "active") {
    return null;
  }

  const matched = verifyPassword(password, {
    salt: user.passwordSalt,
    hash: user.passwordHash,
  });
  if (!matched) {
    return null;
  }

  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = user.lastLoginAt;
  await saveUserStore(store);
  return toPublicUser(user);
}

export async function createSession(userId) {
  const store = await loadSessionStore();
  const now = Date.now();
  const session = {
    token: randomBytes(24).toString("hex"),
    userId,
    createdAt: new Date(now).toISOString(),
    lastSeenAt: new Date(now).toISOString(),
    expiresAt: new Date(now + sessionTtlMs).toISOString(),
  };

  store.sessions = store.sessions.filter((item) => Date.parse(item.expiresAt) > now);
  store.sessions.push(session);
  await saveSessionStore(store);
  return session;
}

export async function destroySession(token = "") {
  const store = await loadSessionStore();
  const nextSessions = store.sessions.filter((item) => item.token !== token);
  if (nextSessions.length === store.sessions.length) {
    return;
  }

  store.sessions = nextSessions;
  await saveSessionStore(store);
}

export async function resolveSession(token = "") {
  if (!token) {
    return null;
  }

  const [sessionStore, userStore] = await Promise.all([loadSessionStore(), loadUserStore()]);
  const now = Date.now();
  const validSessions = sessionStore.sessions.filter((item) => Date.parse(item.expiresAt) > now);
  const session = validSessions.find((item) => item.token === token);

  if (validSessions.length !== sessionStore.sessions.length) {
    sessionStore.sessions = validSessions;
    await saveSessionStore(sessionStore);
  }

  if (!session) {
    return null;
  }

  const user = userStore.users.find((item) => item.id === session.userId);
  if (!user || user.status !== "active") {
    await destroySession(token);
    return null;
  }

  session.lastSeenAt = new Date().toISOString();
  await saveSessionStore(sessionStore);

  return {
    session,
    user: toPublicUser(user),
  };
}
