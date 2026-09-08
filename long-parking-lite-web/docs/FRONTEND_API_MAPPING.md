# 前端页面与 API 映射

## 调用约定

页面只调用 `src/api` 或 Pinia，不直接使用 Axios，也不读取 Mock 数组。Mock Handler 均位于 `src/mock/handlers/index.ts`；统一错误由 `src/api/request.ts` 显示，页面保留加载、空数据、局部重试或业务确认状态。`Auth Store` 指 `src/stores/auth.ts`，其他页面无专用 Store。

## 按页面映射

| 页面/路由 | API（请求 → 响应类型） | API 文件 | Store | 调用时机与错误展示 |
|---|---|---|---|---|
| 首页 `/` | `GET /home` → `HomeData` | `public.ts` | Auth（可选用户） | mounted；加载/错误重试；登录车主时同时返回月租申请 |
| 登录 `/login` | `POST /auth/login` → `LoginResult` | `auth.ts` | Auth | 表单校验后；错误消息；成功按角色或 redirect 跳转 |
| 注册 `/register` | `POST /auth/register` → `ActionResult` | `auth.ts` | 无 | 表单校验后；重复账号 409；成功回登录 |
| 停车场 `/parking-lots` | `GET /parking-lots` → `PageResult<ParkingLot>` | `public.ts` | 无 | mounted、搜索、筛选、分页；空状态 |
| 停车场详情 `/parking-lot/:id` | `GET /parking-lots/{id}` → `ParkingLotDetail`；`GET /monthly-plans` → `MonthlyPlan[]` | `public.ts` | 无 | mounted 并行/串行加载；404 显示可重试错误 |
| 月租套餐 `/monthly-plans` | `GET /monthly-plans` → `MonthlyPlan[]`；`GET /parking-lots` → `PageResult<ParkingLot>` | `public.ts` | Auth（判断申请去向） | mounted、筛选；空状态 |
| USER 概览 `/user/dashboard` | `GET /user/vehicles` → `Vehicle[]`；`GET /user/parking-records` → `PageResult<ParkingRecord>`；`GET /home` → `HomeData` | `user.ts`, `public.ts` | Auth | mounted 并发；加载状态，统一错误 |
| 我的车辆 `/user/vehicles` | `GET /user/vehicles`；`POST /user/vehicles/save` → `Vehicle`；`DELETE /user/vehicles/{id}` → `ActionResult` | `user.ts` | Auth | mounted/保存后；表单校验，删除/默认二次确认，409 提示 |
| 用户停车记录 `/user/parking-records` | `GET /user/parking-records` → `PageResult<ParkingRecord>` | `user.ts` | Auth | mounted、筛选、分页；空状态 |
| 停车详情 `/user/parking-record/:id` | `GET /user/parking-records/{id}` → `ParkingRecordDetail`，同端点 `action=PAY` 支付 | `user.ts` | Auth | mounted、二次确认支付后；按钮立即禁用，409 防重复 |
| 月租申请 `/user/monthly-applications` | `GET /home` → `HomeData.monthlyApplications`；`POST /user/monthly-applications/save` → `MonthlyApplicationSaveResult` | `public.ts`, `user.ts` | Auth | mounted、取消后；取消二次确认 |
| 新建月租 `/user/monthly-application/create` | `GET /user/vehicles`；`GET /monthly-plans`；`POST /user/monthly-applications/save` | `user.ts`, `public.ts` | Auth | mounted、提交；类型/日期表单校验，重叠 409 |
| 个人资料 `/user/profile` | `PUT /users/profile` → `UserInfo` | `auth.ts` | Auth | 保存后 Store 与 localStorage 同步；唯一性 409 |
| OPERATOR 概览 `/operator/dashboard` | `GET /operator/parking-records` → `PageResult<ParkingRecord>`；`GET /parking-lots` | `operator.ts`, `public.ts` | Auth | mounted 并发；加载状态 |
| 车辆入场 `/operator/entry` | `GET /parking-lots`；`GET /parking-lots/{id}`；`POST /operator/vehicles/entry` → `VehicleEntryResult` | `public.ts`, `operator.ts` | Auth | mounted/停车场改变/提交；表单校验、提交禁用、409 |
| 车辆出场 `/operator/exit` | `GET /operator/parking-records/current/{plate}` → `ParkingRecord`；`POST /operator/vehicles/exit` → `VehicleExitResult` | `operator.ts` | Auth | 查询、二次确认出场/放行；未支付和原因校验 |
| 场内车辆 `/operator/in-yard` | `GET /operator/parking-records?currentOnly=true` | `operator.ts` | Auth | mounted、搜索、分页；表格加载 |
| 工作人员记录 `/operator/parking-records` | `GET /operator/parking-records` | `operator.ts` | Auth | mounted、筛选、分页；表格加载 |
| 管理员登录 `/admin/login` | `POST /auth/login` → `LoginResult` | `auth.ts` | Auth | 表单校验后；非 ADMIN 清会话并提示 |
| 管理看板 `/admin/dashboard` | `GET /admin/dashboard` → `AdminDashboard` | `admin.ts` | Auth | mounted；加载；图表响应更新/resize/dispose |
| 用户管理 `/admin/users` | `GET /admin/users` → `PageResult<UserInfo>`；`POST /admin/users/action` → `UserInfo` | `admin.ts` | Auth | mounted、筛选、操作后；状态/角色二次确认 |
| 停车综合管理 `/admin/parking-management` | `GET /admin/resources` → `PageResult<T>`；`POST /admin/resources/action` → `ActionResult` | `admin.ts` | Auth | tab 切换、CRUD/状态；保存/删除二次确认，409 |
| 月租综合管理 `/admin/monthly-management` | 同上，resourceType 为套餐/申请 | `admin.ts` | Auth | tab 切换、套餐 CRUD、申请审核；拒绝原因和二次确认 |
| 403 `/403` | 无 | 无 | Auth（返回角色首页） | 路由守卫越权后显示 |
| 404 `/404` | 无 | 无 | 无 | catch-all 重定向后显示 |

## 24 个接口覆盖索引

| # | 固定接口 | API 函数 | Handler | 使用页面 |
|---:|---|---|---|---|
| 1 | `POST /auth/register` | `register` | Handler 1 | 注册 |
| 2 | `POST /auth/login` | `login` | Handler 2 | 普通/管理员登录 |
| 3 | `POST /auth/logout` | `logout` | Handler 3 | 四套布局 Header |
| 4 | `GET /auth/me` | `getCurrentUser` | Handler 4 | Auth Store 会话校验能力 |
| 5 | `PUT /users/profile` | `updateProfile` | Handler 5 | 个人资料 |
| 6 | `GET /home` | `getHome` | Handler 6 | 首页、用户概览、月租申请 |
| 7 | `GET /parking-lots` | `getParkingLots` | Handler 7 | 首页搜索结果、列表、套餐、工作台、入场 |
| 8 | `GET /parking-lots/{id}` | `getParkingLotDetail` | Handler 8 | 详情、入场选位 |
| 9 | `GET /monthly-plans` | `getMonthlyPlans` | Handler 9 | 公共套餐、详情、新建申请 |
| 10 | `GET /user/vehicles` | `getVehicles` | Handler 10 | 用户概览、车辆、新建申请 |
| 11 | `POST /user/vehicles/save` | `saveVehicle` | Handler 11 | 我的车辆 |
| 12 | `DELETE /user/vehicles/{id}` | `deleteVehicle` | Handler 12 | 我的车辆 |
| 13 | `GET /user/parking-records` | `getUserParkingRecords` | Handler 13 | 用户概览、用户记录 |
| 14 | `GET /user/parking-records/{id}` | `getUserParkingRecordDetail` | Handler 14 | 停车详情/支付动作 |
| 15 | `POST /user/monthly-applications/save` | `saveMonthlyApplication` | Handler 15 | 申请列表、新建申请 |
| 16 | `POST /operator/vehicles/entry` | `enterVehicle` | Handler 16 | 车辆入场 |
| 17 | `GET /operator/parking-records` | `getOperatorParkingRecords` | Handler 17 | 工作概览、场内、记录 |
| 18 | `GET /operator/parking-records/current/{plateNumber}` | `getCurrentRecord` | Handler 18 | 车辆出场 |
| 19 | `POST /operator/vehicles/exit` | `exitVehicle` | Handler 19 | 正常出场/人工放行 |
| 20 | `GET /admin/dashboard` | `getAdminDashboard` | Handler 20 | 管理看板 |
| 21 | `GET /admin/users` | `getAdminUsers` | Handler 21 | 用户管理 |
| 22 | `POST /admin/users/action` | `actOnAdminUser` | Handler 22 | 用户管理 |
| 23 | `GET /admin/resources` | `getAdminResources<T>` | Handler 23 | 两个综合管理页 |
| 24 | `POST /admin/resources/action` | `actOnAdminResource` | Handler 24 | 两个综合管理页 |

每个 Handler 的成功、参数错误、未登录、越权、未找到或业务冲突按场景返回 200/400/401/403/404/409；网络或未捕获服务异常由真实后端按 500 返回。
