# Long 轻量智慧停车管理平台

一个前后端分离的小型停车场管理系统，覆盖停车场与车位管理、车主车辆管理、车辆进出场、
基础计费与模拟支付、月租套餐与月租申请审核，按 `USER / OPERATOR / ADMIN` 三种角色划分权限。

- **前端** `long-parking-lite-web`：Vue 3 + TypeScript + Vite，含 Mock 假后端，可脱离服务端独立运行。
- **后端** `car-parking`：Spring Boot 3 + MyBatis-Plus + Sa-Token，提供固定 24 个 REST 接口。

---

## 1. 仓库结构

```text
tes6-mofang-69/
├─ long-parking-lite-web/        # 前端：Vue 3 + TypeScript + Vite
│  ├─ src/
│  │  ├─ api/                    # 24 个接口调用函数（auth/public/user/operator/admin）
│  │  ├─ components/             # 公共、车辆、停车、月租、图表组件
│  │  ├─ constants/              # 枚举、角色首页、localStorage 键
│  │  ├─ layouts/                # Public / User / Operator / Admin 四套布局
│  │  ├─ mock/                   # 8 组表数据 + 24 个 Mock Handler（本地假后端）
│  │  ├─ router/                 # 路由、标题、登录与角色守卫
│  │  ├─ stores/                 # Auth Pinia Store
│  │  ├─ types/                  # 严格业务类型
│  │  ├─ utils/                  # 日期、金额格式化
│  │  └─ views/                  # 四端页面 + 403/404
│  ├─ database/long_parking_lite.sql   # MySQL 8 建表 + 初始数据
│  └─ docs/                      # API、前端映射、数据库关系、验收、启动、环境文档
└─ car-parking/                  # 后端：Spring Boot 3
   ├─ pom.xml                    # 依赖与构建配置
   └─ src/main/
      ├─ java/com/lon/
      │  ├─ CarParkApplication.java    # 启动类
      │  ├─ CodeDb.java                # MyBatis-Plus 代码生成器（生成 entity / mapper）
      │  ├─ controller/                # 接口层：认证、公共、用户、工作人员、管理员
      │  ├─ entity/                    # 8 个实体，与 8 张表一一对应
      │  └─ mapper/                    # 8 个 Mapper 接口（继承 BaseMapper + 少量自定义查询）
      └─ resources/
         ├─ application.yml            # 端口、数据源、MyBatis-Plus、Sa-Token
         └─ mapper/*.xml               # 自定义 SQL（联表、统计、聚合）
```

前端页面与组件的详细说明见 [`long-parking-lite-web/README.md`](long-parking-lite-web/README.md)。

---

## 2. 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3.5、TypeScript（严格模式）、Vite 7、Vue Router 4、Pinia 3 |
| 前端 UI | Element Plus 2 + Icons、ECharts 5、Sass |
| 前端网络 | Axios + Axios Mock Adapter（本地假数据） |
| 后端 | JDK 21、Spring Boot 3.5.4、Maven |
| 持久层 | MyBatis-Plus 3.5.17（+ 代码生成器 3.5.9 / Freemarker 模板） |
| 数据库 | MySQL 8（库名 `long_parking_lite`，utf8mb4）+ Druid 连接池 |
| 认证 | Sa-Token 1.45.0 + spring-security-crypto（BCrypt） |

前端所有业务组件统一使用 `<script setup lang="ts">`；后端金额统一 `BigDecimal`，
数据库对应 `decimal(10,2)`，JSON 中为两位小数 number。

---

## 3. 三种角色与核心流程

| 角色 | 功能 |
|---|---|
| `USER` 车主 | 注册/登录、浏览停车场与月租套餐、管理车辆（最多 3 辆）、查看停车记录、缴费（模拟）、提交/取消月租申请、修改个人资料 |
| `OPERATOR` 工作人员 | 车辆入场、按车牌查场内记录与费用、正常出场、人工放行、记录查询 |
| `ADMIN` 管理员 | 运营看板、用户状态/角色管理、停车场/车位/计费规则/月租套餐维护、月租申请审核 |

> 普通注册只能创建 `USER`，前端没有工作人员和管理员的注册入口。
> Mock 模式下 `user` / `operator` / `admin`（密码 `123456`）都已内置；
> 服务端建表脚本不初始化任何账号，首次部署需自行向 `sys_user` 插入 BCrypt 密码的账号。

主要业务闭环：

```text
车主注册 → 工作人员录入车辆入场 → 车主查看费用并模拟支付
        → 工作人员按车牌查询并放行出场（或人工放行）

车主提交月租申请 → 管理员审核通过 → 该车在有效期内入场自动识别为月租，出场无需付费
```

### 关键状态机

```text
停车中(0) → 待缴费(1) → 已缴费(2) → 已出场(3)
停车中/待缴费/已缴费 → 人工放行(4)
月租车辆：停车中(0) → paymentStatus=2(无需支付) → 已出场(3)
```

| 枚举 | 取值 |
|---|---|
| 角色 | `USER` / `OPERATOR` / `ADMIN` |
| 用户、车辆启停 | 0 禁用/停用，1 正常 |
| 停车场状态 | 0 停用，1 营业中，2 维护中 |
| 车辆类型 | `SMALL` / `NEW_ENERGY` |
| 车位类型 | `NORMAL` / `NEW_ENERGY` / `DISABLED` |
| 车位状态 | 0 停用，1 空闲，2 已占用，3 维护中 |
| 停车记录状态 | 0 停车中，1 待缴费，2 已缴费，3 已出场，4 人工放行 |
| 支付状态 | 0 未支付，1 已支付，2 无需支付 |
| 月租申请状态 | 0 待审核，1 通过，2 拒绝，3 取消，4 过期 |

### 基础计费规则

30 分钟免费；首小时 5 元；超过首小时每小时 3 元；不足一小时按一小时；单日封顶 30 元。
规则存在 `billing_rule` 表，一个停车场只允许一条规则，由唯一索引和业务校验共同保证。
前端只展示计算结果，**计费权威在服务端**。

---

## 4. 数据库设计

初始化脚本：[`long-parking-lite-web/database/long_parking_lite.sql`](long-parking-lite-web/database/long_parking_lite.sql)。
只建 8 张业务表，**不建物理外键**（一致性由应用层保证）。

| 表名 | 说明 | 后端实体 |
|---|---|---|
| `sys_user` | 系统用户（密码存 BCrypt） | `SysUser` |
| `user_vehicle` | 车主车辆（车牌全局唯一） | `UserVehicle` |
| `parking_lot` | 停车场（含 total/available 冗余计数） | `ParkingLot` |
| `parking_space` | 车位（含当前占用车牌） | `ParkingSpace` |
| `billing_rule` | 计费规则（每场唯一） | `BillingRule` |
| `parking_record` | 停车记录（含支付与人工放行字段） | `ParkingRecord` |
| `monthly_plan` | 月租套餐 | `MonthlyPlan` |
| `monthly_application` | 月租申请 + 有效月租 | `MonthlyApplication` |

设计取舍：**不额外建** 支付流水表、放行记录表、月租车辆表、角色表、日志表、停车区域表。
支付和放行信息直接放 `parking_record`；有效月租直接查 `monthly_application`（`status=1` 且未过期）。

脚本附带初始数据：1 个停车场、6 个车位（含 1 个维护中的无障碍车位）、1 条计费规则、2 个月租套餐。
`current_plate_number` 用 `null` 表示空闲。

---

## 5. 接口清单（固定 24 个）

Base URL：`/api`。统一响应 `{ code, msg, data }`；分页 `{ list, total, page, pageSize, pages }`；
除公开接口外请求头必须带 `Authorization: Bearer <token>`。
完整字段与请求/响应示例见 [`long-parking-lite-web/docs/API.md`](long-parking-lite-web/docs/API.md)。

| # | 方法 | 路径 | 权限 | 说明 |
|---:|---|---|---|---|
| 1 | POST | `/auth/register` | 公开 | 车主注册（只能建 USER） |
| 2 | POST | `/auth/login` | 公开 | 登录，返回 token + userInfo |
| 3 | POST | `/auth/logout` | 登录 | 退出登录 |
| 4 | GET | `/auth/me` | 登录 | 当前用户信息 |
| 5 | PUT | `/users/profile` | 登录 | 修改个人资料 |
| 6 | GET | `/home` | 公开 | 首页聚合数据 |
| 7 | GET | `/parking-lots` | 公开 | 停车场分页 |
| 8 | GET | `/parking-lots/{id}` | 公开 | 停车场详情（含车位、规则、套餐） |
| 9 | GET | `/monthly-plans` | 公开 | 月租套餐列表 |
| 10 | GET | `/user/vehicles` | USER | 我的车辆 |
| 11 | POST | `/user/vehicles/save` | USER | 车辆增改/设默认（action 区分） |
| 12 | DELETE | `/user/vehicles/{id}` | USER | 删除车辆 |
| 13 | GET | `/user/parking-records` | USER | 我的停车记录分页 |
| 14 | GET | `/user/parking-records/{id}` | USER | 停车详情；`?action=PAY` 复用为模拟支付 |
| 15 | POST | `/user/monthly-applications/save` | USER | 月租申请创建/取消 |
| 16 | POST | `/operator/vehicles/entry` | OPERATOR | 车辆入场 |
| 17 | GET | `/operator/parking-records` | OPERATOR | 工作人员记录查询 |
| 18 | GET | `/operator/parking-records/current/{plateNumber}` | OPERATOR | 按车牌查场内记录 + 实时费用 |
| 19 | POST | `/operator/vehicles/exit` | OPERATOR | 正常出场 / 人工放行 |
| 20 | GET | `/admin/dashboard` | ADMIN | 运营看板（指标 + 7 天趋势） |
| 21 | GET | `/admin/users` | ADMIN | 用户分页 |
| 22 | POST | `/admin/users/action` | ADMIN | 改用户状态 / 角色 |
| 23 | GET | `/admin/resources` | ADMIN | 综合资源查询（`resourceType` 分派 5 种资源） |
| 24 | POST | `/admin/resources/action` | ADMIN | 综合资源写操作（CREATE/UPDATE/DELETE/CHANGE_STATUS/AUDIT） |

错误码：400 参数错误；401 未登录或 Token 失效；403 无权限；404 数据不存在；409 业务冲突；500 服务异常。

几个刻意的设计约束：

- **第 14 个接口复用**：接口总数锁定为 24 个，所以模拟支付没有单独接口，而是
  `GET /user/parking-records/{id}?action=PAY`。
- **第 23/24 个接口是综合接口**：管理员用两个接口管理 `PARKING_LOT`、`PARKING_SPACE`、
  `BILLING_RULE`、`MONTHLY_PLAN`、`MONTHLY_APPLICATION`，避免接口数膨胀。服务端按 `resourceType`
  分派并逐类型独立校验，禁止把 payload 字段直接拼进 SQL。
- 月租申请只允许管理员做 `AUDIT`，创建与取消走用户接口。

---

## 6. 服务端实现要点

### 分层与公共组件

- **接口层**：`controller` 按认证、公共、用户、工作人员、管理员分组，方法只做参数校验与调用。
- **统一响应**：`Result<T>` 包装 `code/msg/data`；分页统一 `PageResult<T>`
  （`list/total/page/pageSize/pages`），默认 `page=1&pageSize=10`。
- **全局异常处理**：业务异常与参数校验异常统一转成 400/404/409，认证与权限异常映射 401/403，
  未预期异常兜底 500，响应体结构与成功响应一致。
- **分页与映射**：MyBatis-Plus 分页插件 + 驼峰映射开启；单表 CRUD 用 `BaseMapper` + Wrapper，
  联表与统计查询写在 `resources/mapper/*.xml`（如停车场详情的车位类型统计、运营看板趋势聚合）。
- **认证与鉴权**：Sa-Token 配置 token 名称与超时时间，拦截器放行注册、登录、首页、停车场、套餐等
  公开路径，其余接口校验登录态；角色校验按 `roleCode` 限定 USER / OPERATOR / ADMIN。
  密码统一 BCrypt 哈希存储，登录成功后签发 token，`/auth/logout` 使当前会话失效。
- **跨域**：前后端分离，开发环境通过 Vite 代理同源访问，生产环境按前端域名白名单放开 CORS。

### 事务边界

| 业务 | 事务内动作 |
|---|---|
| 入场 | 创建停车记录 + 占用车位 + 更新停车场空闲数量 |
| 出场/放行 | 更新停车记录 + 释放车位 + 更新停车场空闲数量 |
| 支付 | 条件更新停车记录金额、支付状态、流水号与支付时间 |
| 月租审核 | 日期重叠校验 + 更新申请状态、审核意见、审核人与审核时间 |

异常必须整体回滚。车位状态与停车场冗余数量提供定时对账任务；另每日任务把已通过且
`end_date < current_date` 的月租申请置为已过期（状态 4）。

### 并发与幂等

- **防重复入场**：先按车牌查未结束记录，事务内再次复查，并对车位做条件更新
  （`where status=1`），重复入场返回 409。
- **防重复出场**：只允许状态 0/1/2 迁移到 3/4，按记录 ID 条件更新，重复出场返回 409。
- **支付幂等**：只允许 `payment_status=0` 更新，`payment_no` 唯一，重复请求返回同一结果或 409。
- **月租重叠**：创建与审核时检查同车 `status=1` 且日期区间相交
  （`newStart <= oldEnd && newEnd >= oldStart`），审核在事务内锁定相关记录。
- **可选 Redis 键**：`parking:space-lock:{spaceId}`、`parking:plate-in-yard:{plateNumber}`、
  `parking:payment-lock:{parkingRecordId}`。锁设置短 TTL、唯一 value 并安全释放；
  Redis 只做并发协调，MySQL 状态仍是最终依据。

---

## 7. 本地启动

### 环境准备

- JDK 21、Maven 3.9+、MySQL 8（本地 3306）、Node.js 22/24（最低满足 Vite 7 要求）
- 执行 `long-parking-lite-web/database/long_parking_lite.sql` 建库建表与初始数据
- 服务端数据源在 `car-parking/src/main/resources/application.yml`（库名 `long_parking_lite`，
  账号密码按自己机器修改）
- 前端 `vite.config.ts` 已配好代理：`/api` → `http://localhost:9001`

### 启动后端

```bash
cd car-parking
mvn spring-boot:run     # 或用 IDEA 运行 CarParkApplication，端口 9001
```

> `CodeDb` 是代码生成器，运行会覆盖 `entity` / `mapper` 生成结果，仅在表结构变更后按需执行。
> `application.yml` 中的数据库口令属于本地测试配置，正式部署请改为环境变量或外部配置。

### 启动前端

```bash
cd long-parking-lite-web
npm install
npm run dev          # http://localhost:5173
npm run type-check   # 类型检查
npm run build        # 类型检查 + 生产构建
```

### 两种运行模式

| 模式 | 配置 | 说明 |
|---|---|---|
| 真实接口 | `.env.development` → `VITE_USE_MOCK=false` | 默认模式。请求经 Vite 代理打到 9001，需先启动后端 |
| 纯前端演示 | `.env.development` → `VITE_USE_MOCK=true` | 前端用 Axios Mock Adapter 顶替后端，数据存 localStorage，适合脱离数据库演示 |

两种模式共用同一套 `src/api` 调用代码与类型定义，切换只改环境变量并**重启** Vite。

---

## 8. 常见问题

- **接口 404**：确认 `VITE_USE_MOCK`、后端是否启动在 9001、路径是否只带一个 `/api`
  （`src/api` 里写的是 `/auth/login` 这类相对路径，baseURL 才是 `/api`）。
- **登录后立刻退出**：检查 token 格式、`Authorization: Bearer <token>` 解析、`/auth/me` 返回。
- **页面刷新 404**：生产部署时 Web Server 需要把未知路径回退到 `index.html`。
- **Mock 数据乱了**：点页脚「重置 Mock 数据」，或删掉 localStorage 键
  `long-parking-lite-mock-db` 后刷新（token 键为 `long-parking-lite-token`）。
- **改了 `.env` 不生效**：环境变量只在 Vite 启动时读取，需重启开发服务器。
- **`mvn` 依赖下载慢**：配置国内镜像后再重试，不要手工复制 `node_modules` 或 jar。

---

## 9. 详细文档索引

| 文档 | 内容 |
|---|---|
| [`long-parking-lite-web/README.md`](long-parking-lite-web/README.md) | 前端完整说明（角色、路由、目录、Mock、一致性约束） |
| [`docs/API.md`](long-parking-lite-web/docs/API.md) | 24 个接口的完整契约与示例 |
| [`docs/FRONTEND_API_MAPPING.md`](long-parking-lite-web/docs/FRONTEND_API_MAPPING.md) | 页面 ↔ 接口 ↔ 类型映射 |
| [`docs/DATABASE_RELATION.md`](long-parking-lite-web/docs/DATABASE_RELATION.md) | 表关系与字段语义 |
| [`docs/BACKEND_ENV.md`](long-parking-lite-web/docs/BACKEND_ENV.md) | 服务端环境、事务边界、并发与幂等要求 |
| [`docs/FRONTEND_ACCEPTANCE.md`](long-parking-lite-web/docs/FRONTEND_ACCEPTANCE.md) | 前端验收清单 |
| [`docs/STARTUP.md`](long-parking-lite-web/docs/STARTUP.md) | 启动与 Network 自检 |
| [`docs/FRONTEND_ENV.md`](long-parking-lite-web/docs/FRONTEND_ENV.md) | 前端环境变量说明 |

---

## 10. 项目说明

本项目为学习性质的停车场管理系统，重点是跑通「三端角色 + 停车计费 + 月租」这条完整业务链。
为控制复杂度，以下部分做了简化：支付为模拟支付（无真实支付渠道对接）、无车牌识别等硬件对接、
无地图与停车区域管理、数据库不建物理外键、鉴权使用 Sa-Token 而非完整的 Spring Security 体系。
