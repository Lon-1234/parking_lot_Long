# 启动文档

## 环境建议

- Node.js：22 LTS 或 24；最低满足 Vite 7 要求的 Node.js 20.19+ / 22.12+。
- npm：10 或 11。
- 浏览器：Chrome、Edge、Firefox、Safari 最近两个大版本。
- 开发端口：`5173`；后端约定端口：`9001`。

## 安装与运行

```bash
npm install
npm run dev
npm run type-check
npm run build
npm run preview
```

开发地址通常为 `http://localhost:5173`。`preview` 默认使用 Vite 预览端口并只用于检查构建产物。

## Mock 模式

`.env.development`：

```env
VITE_API_BASE_URL=/api
VITE_USE_MOCK=true
```

Mock 使用 Axios Mock Adapter，延迟 200～500ms，数据持久化在 `long-parking-lite-mock-db`。页脚“重置 Mock 数据”会恢复初始状态。测试账号：`user`、`operator`、`admin`，密码均为 `123456`。

## 真实 Spring Boot 模式

创建或修改环境文件：

```env
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

`vite.config.ts` 将 `/api` 代理到 `http://localhost:9001`。`src/api` 内路径不带 `/api`，因此请求只能形成 `/api/auth/login`，不会出现 `/api/api/`。登录后请求头为：

```http
Authorization: Bearer <token>
```

切换步骤：启动 Spring Boot 9001 → 关闭 Mock → 重启 Vite → 在浏览器 Network 中确认请求进入 9001 并返回统一结构。

## Network 检查

1. 请求 URL 是否只含一个 `/api`。
2. 受保护请求是否携带 Bearer Token。
3. 响应是否为 `{ code, msg, data }`。
4. 分页是否返回 `{ list,total,page,pageSize,pages }`。
5. 401 是否只触发一次退出和重定向。

## 常见问题

- 依赖安装失败：清理 npm 代理/镜像配置后重试，不要手工复制 `node_modules`。
- 页面刷新 404：生产 Web Server 需要把未知路径回退到 `index.html`。
- 接口 404：检查 `VITE_USE_MOCK`、后端端口和 `/api` 前缀。
- 登录后立即退出：检查 Token 格式、`Authorization` 解析和 `/auth/me`。
- Mock 状态异常：使用页脚重置按钮；localStorage 损坏时应用会自动回退初始库。
- 修改 `.env` 未生效：环境变量只在 Vite 启动时读取，需重启开发服务器。
