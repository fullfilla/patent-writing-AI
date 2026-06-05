import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCredentialsText,
  buildPermissions,
  createPasswordRecord,
  sanitizeUsername,
  verifyPassword,
} from "../src/user-store.js";

test("sanitizeUsername trims and lowercases values", () => {
  assert.equal(sanitizeUsername("  Alice.Admin  "), "alice.admin");
});

test("createPasswordRecord and verifyPassword work together", () => {
  const record = createPasswordRecord("SecretPass123");
  assert.equal(typeof record.salt, "string");
  assert.equal(typeof record.hash, "string");
  assert.equal(verifyPassword("SecretPass123", record), true);
  assert.equal(verifyPassword("wrong-pass", record), false);
});

test("buildPermissions grants admin-only capabilities", () => {
  const adminPermissions = buildPermissions("admin");
  const userPermissions = buildPermissions("user");

  assert.match(adminPermissions.join(","), /settings:write/);
  assert.match(adminPermissions.join(","), /users:write/);
  assert.equal(userPermissions.includes("settings:write"), false);
});

test("buildCredentialsText prints plaintext passwords for local ledger", () => {
  const text = buildCredentialsText([
    {
      username: "admin",
      displayName: "系统管理员",
      role: "admin",
      status: "active",
      passwordPlaintext: "Admin@123456",
    },
  ]);

  assert.match(text, /账号密码清单/);
  assert.match(text, /用户名：admin/);
  assert.match(text, /密码：Admin@123456/);
});
