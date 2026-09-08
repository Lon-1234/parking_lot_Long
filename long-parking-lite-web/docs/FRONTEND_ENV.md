# 前端环境说明

## 技术与依赖

| 依赖 | package.json 范围 | 用途 |
|---|---:|---|
| Vue | `^3.5.17` | Composition API 与 `<script setup lang="ts">` |
| Vue Router | `^4.5.1` | 懒加载路由、守卫、角色限制 |
| Pinia | `^3.0.3` | 登录态与用户信息 |
| Element Plus | `^2.10.4` | UI、表单校验、确认和反馈 |
| Element Plus Icons | `^2.3.1` | 本地图标组件 |
| Axios | `^1.10.0` | 统一 API 调用层 |
| Axios Mock Adapter | `^2.1.0` | 浏览器内 Mock |
| ECharts | `^5.6.0` | 运营看板，按需注册折/柱/饼图 |
| Sass | `^1.89.2` | SCSS 样式 |
| Vite | `^7.0.4` | 开发与构建 |
| TypeScript | `~5.8.3` | 严格类型 |
| vue-tsc | `^3.0.1` | Vue 模板类型检查 |
| @vitejs/plugin-vue | `^6.0.0` | Vite Vue SFC 插件 |
| @vue/tsconfig | `^0.8.1` | Vue 官方 TypeScript 基础配置 |
| @tsconfig/node22 | `^22.0.2` | Vite 配置的 Node 22 类型基线 |
| @types/node | `^24.0.13` | Node API 类型 |

实际解析版本以 `package-lock.json` 为准。建议 Node.js 22 LTS/24、npm 10/11。

## 环境变量

| 变量 | 示例 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Axios `baseURL`，`src/api` 不再重复前缀 |
| `VITE_USE_MOCK` | `true` / `false` | 是否动态加载 Mock Adapter |

开发默认 Mock 开启；生产默认关闭。Vite 代理 `/api -> http://localhost:9001`。

## 目录

```text
src/
├─ api/          # 24 个固定接口函数
├─ types/        # API、用户、停车、月租、统计类型
├─ constants/    # 枚举、路由首页、存储键
├─ layouts/      # public/user/operator/admin 四套布局
├─ views/        # public/user/operator/admin/error 页面
├─ components/   # common/vehicle/parking/monthly/charts
├─ stores/       # Pinia 登录态
├─ mock/         # 8 组表数据与 24 个 Handler
├─ router/       # 懒加载路由和权限守卫
├─ utils/        # 格式化与日期工具
└─ styles/       # 全局 SCSS
```

## 脚本与构建

- `npm run dev`：开发服务器。
- `npm run type-check`：严格模板和 TS 检查，不输出文件。
- `npm run build`：先类型检查再生产构建。
- `npm run preview`：预览 `dist`。

Rollup 手动拆分 `vue`、`element`、`charts` 三组 vendor；页面路由全部动态 import。ECharts 只注册 Line、Bar、Pie 及必要组件，图表监听容器 resize，并在卸载时 dispose。

## 浏览器与存储

需要支持 ES Modules、ResizeObserver、localStorage 的现代浏览器。固定键：

- `long-parking-lite-token`
- `long-parking-lite-user`
- `long-parking-lite-mock-db`

会话 JSON 或 Mock DB 损坏时安全回退，不让页面白屏。Mock 的新增、修改、支付、入出场和审核会立即写回 localStorage。
