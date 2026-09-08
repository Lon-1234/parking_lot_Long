# Long 轻量智慧停车管理平台

`long-parking-lite-web` 是一个前后端分离的 Vue 3 停车管理前端，覆盖停车场、车位、车主车辆、入出场、基础计费、模拟支付、月租套餐和申请。仓库不包含 Java、Spring Boot、Node 后端或其他可运行后端代码。

## 技术栈

Vue 3、TypeScript 严格模式、Vite、Vue Router、Pinia、Element Plus、Element Plus Icons、Axios、Axios Mock Adapter、ECharts、Sass。所有 Vue 业务组件均使用 `<script setup lang="ts">`。

## 三种角色

- USER：注册/登录、停车场与套餐、车辆、停车记录、费用与模拟支付、月租申请、个人资料。
- OPERATOR：车辆入场、场内/费用查询、正常出场、人工放行、记录查询。
- ADMIN：运营看板、用户状态/角色、停车场/车位/计费规则、套餐和月租审核。

普通注册只创建 USER；没有工作人员和管理员注册入口。

## 页面路由

- 公共：`/`、`/login`、`/register`、`/parking-lots`、`/parking-lot/:id`、`/monthly-plans`、`/403`、`/404`。
- 用户：`/user/dashboard`、`/user/vehicles`、`/user/parking-records`、`/user/parking-record/:id`、`/user/monthly-applications`、`/user/monthly-application/create`、`/user/profile`。
- 工作人员：`/operator/dashboard`、`/operator/entry`、`/operator/exit`、`/operator/in-yard`、`/operator/parking-records`。
- 管理员：`/admin/login`、`/admin/dashboard`、`/admin/users`、`/admin/parking-management`、`/admin/monthly-management`。
- `/:pathMatch(.*)*` 统一进入 404。全部业务页面使用路由懒加载。

## 目录

```text
long-parking-lite-web/
├─ src/
│  ├─ api/             # 固定 24 个 API 函数
│  ├─ components/      # 公共、车辆、停车、月租和图表组件
│  ├─ constants/       # 枚举、角色首页、localStorage 键
│  ├─ layouts/         # Public/User/Operator/Admin
│  ├─ mock/            # 8 组表数据、持久化与 24 个 Handler
│  ├─ router/          # 路由、标题、登录和角色守卫
│  ├─ stores/          # Auth Pinia Store
│  ├─ styles/          # 全局 SCSS
│  ├─ types/           # 严格业务类型
│  ├─ utils/           # 日期、金额格式工具
│  └─ views/           # 四端页面与错误页
├─ database/           # MySQL 8 建表 SQL
├─ docs/               # API、映射、关系、验收和环境文档
└─ README.md
```

## 安装、启动与构建

建议 Node.js 22 LTS 或 24，npm 10/11。

```bash
npm install
npm run dev
npm run type-check
npm run build
npm run preview
```

开发端口为 5173。完整说明见 [docs/STARTUP.md](docs/STARTUP.md)。

## Mock 账号和持久化

| 角色 | 用户名 | 密码 |
|---|---|---|
| USER | `user` | `123456` |
| OPERATOR | `operator` | `123456` |
| ADMIN | `admin` | `123456` |

开发环境默认 `VITE_USE_MOCK=true`。Mock 延迟 200～500ms，所有写操作持久化到 `long-parking-lite-mock-db`。页脚“重置 Mock 数据”可恢复初始状态；也可以在浏览器中删除该键后刷新。

## 切换 Spring Boot

1. 按 [docs/API.md](docs/API.md) 实现固定 24 个接口。
2. 后端运行于 `http://localhost:9001`，统一前缀 `/api`。
3. 设置 `VITE_USE_MOCK=false` 并重启 Vite。
4. 保持 `VITE_API_BASE_URL=/api`；`src/api` 内只写 `/auth/login` 等相对路径。
5. 登录后请求自动附加 `Authorization: Bearer token`。
6. 在 Network 验证统一响应、分页、401/403/409，以及不存在 `/api/api/`。

## 核心一致性

- 24 个 API 均有集中函数和 Mock Handler，没有额外业务接口。
- Mock 数据库固定 8 组：用户、车辆、停车场、车位、计费规则、停车记录、月租套餐、月租申请。
- 入场原子更新记录、车位和空闲数量；车牌在场时返回 409。
- 支付仅允许未支付、未出场临时记录；支付流水号持久化，重复支付返回 409。
- 正常出场校验支付/月租，出场与放行都会释放车位；重复出场返回 409。
- 月租创建和审核都检查已通过申请的日期区间重叠。
- 管理员以两个综合资源接口管理五种 resourceType，避免增加 Controller/接口数量。

## 文档与 SQL

- [API 接口文档](docs/API.md)
- [前端接口映射](docs/FRONTEND_API_MAPPING.md)
- [数据库关系说明](docs/DATABASE_RELATION.md)
- [前端验收文档](docs/FRONTEND_ACCEPTANCE.md)
- [启动文档](docs/STARTUP.md)
- [前端环境说明](docs/FRONTEND_ENV.md)
- [后端环境与对接说明](docs/BACKEND_ENV.md)
- [MySQL 8 建表 SQL](database/long_parking_lite.sql)

SQL 只创建固定 8 张表，不创建物理外键、停车区域、支付记录、月租车辆、放行记录、角色或日志表。支付和放行信息在 `parking_record`，有效月租直接查询审核通过且未过期的 `monthly_application`。
