# Patent Writing Studio Role Auth

这是 `patent-writing-studio` 的一份角色权限版副本，目录如下：

```text
E:\codex空间\patent-writing-studio-role-auth
```

这个版本新增了两类用户：

- `admin` 管理员：可使用全部写作功能、可管理用户账号、可修改 API 设置
- `user` 普通用户：可使用检索、风格蒸馏、背景资料、模板生成、聊天助手，但不能查看或修改 API 设置，也不能管理其他账号

## 默认账号

- 管理员：`admin` / `Admin@123456`
- 普通用户：`writer` / `User@123456`

建议你首次登录后就把默认密码改掉。

## 数据隔离

这个版本不再把草稿只存浏览器本地，而是改成按用户分别保存：

- 用户账号：`E:\codex空间\patent-writing-studio-role-auth\.local\users.json`
- 登录会话：`E:\codex空间\patent-writing-studio-role-auth\.local\sessions.json`
- 每个用户的工作区：`E:\codex空间\patent-writing-studio-role-auth\.local\workspaces\`
- 每个用户的聊天记忆：`E:\codex空间\patent-writing-studio-role-auth\.local\chats\`
- 全站 API 设置：`E:\codex空间\patent-writing-studio-role-auth\.local\app-settings.json`

## 运行要求

- Windows PowerShell
- Node.js 20+
- 浏览器

说明：

- `npm` 是 Node.js 自带的包管理命令。这个项目没有额外第三方依赖，但仍然建议用 `npm start`、`npm test`、`npm run stop` 这类命令统一操作。

## 如何启动

1. 打开 PowerShell。
2. 进入项目目录：

```powershell
Set-Location 'E:\codex空间\patent-writing-studio-role-auth'
```

3. 启动网站：

```powershell
npm start
```

4. 正常启动后会看到类似输出：

```text
Patent Writing Studio Role Auth is running at http://localhost:3036
```

5. 在浏览器打开：

[http://localhost:3036](http://localhost:3036)

## 页面入口

- 首页：`http://localhost:3036/`
- 背景资料：`http://localhost:3036/background.html`
- 风格蒸馏：`http://localhost:3036/style.html`
- 模板工坊：`http://localhost:3036/template.html`
- 模板搭建器：`http://localhost:3036/chat.html`

说明：

- 旧版“检索向导”已经并入 `背景资料`
- 旧版“智能助手”已经改成 `模板搭建器`

## 如何停止

如果你是在当前 PowerShell 直接运行的 `npm start`：

- 直接按 `Ctrl + C`

如果你怀疑 3036 端口被旧进程占用了，在项目目录运行：

```powershell
Set-Location 'E:\codex空间\patent-writing-studio-role-auth'
npm run status
npm run stop
```

## API 设置

只有管理员可以打开右上角的 `API 设置` 并填写：

- `API Key`
- `Base URL`
- `Model`

普通用户只能使用写作功能，不能看到敏感配置。

## 账号与密码

- 登录弹窗里不再展示默认账号密码
- 管理员可以在右上角 `用户管理` 里查看所有账号、查看当前密码、重置密码、生成新密码
- 账号密码会同步保存到项目里的 txt 账本文件，后台也提供直接打开入口

## 已验证

- `node --check server.js`
- `node --check public/app.js`
- `npm test`
- 临时端口 `3037` 启动烟雾检查：
  - 首页返回 `200`
  - 未登录访问 `/api/auth/me` 返回 `401`

## 常见说明

### 1. 为什么现在先登录才能用？

因为这个副本已经从单人本地站改成多用户站点。登录后，系统才知道该把谁的草稿、聊天记录和权限加载出来。

### 2. 管理员和普通用户最大的区别是什么？

管理员多了两块能力：

- 用户管理
- API 设置

普通用户专注写作流程，不接触全站配置。

### 3. 为什么要把工作区改成后端存储？

因为以前只存在浏览器 `localStorage` 里，多个账号共用一台电脑时很容易串草稿。现在按用户分文件保存，隔离更稳。
