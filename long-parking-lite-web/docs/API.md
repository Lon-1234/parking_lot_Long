# Long 轻量智慧停车 API 文档

版本：1.0；固定接口总数：**24**。Base URL：`/api`。下文路径均省略 Base URL；前端文件位于 `src/api`。

## 全局约定

### 统一响应与分页

```ts
interface ApiResponse<T> { code: number; msg: string; data: T }
interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; pages: number }
```

分页默认 `page=1&pageSize=10`。成功 HTTP 状态与 `code` 均为 200。失败响应示例：

```json
{ "code": 409, "msg": "该车牌已在场内，禁止重复入场", "data": null }
```

错误码：400 参数错误；401 未登录或 Token 失效；403 无权限；404 数据不存在；409 业务冲突；500 服务异常。

### 认证、时间与金额

除明确“否”外，Header 必须为 `Authorization: Bearer <token>`。日期使用 `yyyy-MM-dd`；时间使用 ISO 8601 或统一的 `yyyy-MM-dd HH:mm:ss`；金额 JSON 为两位小数 number，后端必须用 `BigDecimal`、数据库用 `decimal(10,2)`。

### 公共枚举

| 对象 | 值 |
|---|---|
| 角色 | `USER`, `OPERATOR`, `ADMIN` |
| 用户/车辆启停 | 0 禁用/停用，1 正常 |
| 停车场 | 0 停用，1 营业中，2 维护中 |
| 车辆类型 | `SMALL`, `NEW_ENERGY` |
| 车位类型 | `NORMAL`, `NEW_ENERGY`, `DISABLED` |
| 车位状态 | 0 停用，1 空闲，2 占用，3 维护中 |
| 停车记录 | 0 停车中，1 待缴费，2 已缴费，3 已出场，4 人工放行 |
| 支付状态 | 0 未支付，1 已支付，2 无需支付 |
| 月租申请 | 0 待审核，1 通过，2 拒绝，3 取消，4 过期 |

### 核心对象字段

- `UserInfo`：`id,username,nickname,avatar,phone,email,roleCode,status`。
- `Vehicle`：`id,userId,plateNumber,brand,model,color,vehicleType,isDefault,status,inYard?`。
- `ParkingLot`：`id,lotName,lotCode,address,contactPhone,businessStartTime,businessEndTime,description,totalSpaces,availableSpaces,status,temporaryPrice`。
- `ParkingSpace`：`id,parkingLotId,spaceCode,spaceType,status,currentPlateNumber`。
- `ParkingRecord`：记录号、用户/车辆/场/位、车牌、进出时间、分钟、应付金额、支付字段、记录状态、是否月租、放行原因、操作员。
- `MonthlyPlan`：`id,parkingLotId,parkingLotName,planName,vehicleType,monthCount,price,description,status`。
- `MonthlyApplication`：申请号、用户/车辆/场/套餐、金额、日期范围、状态、审核字段。

### 全局业务规则

- 基础计费：30 分钟免费；首小时 5 元；超过首小时每小时 3 元；不足一小时按一小时；单日封顶 30 元。最终结果以后端为准。
- 同一车牌只能有一条未结束记录；入场、支付、出场均需服务端幂等。
- 临时车辆未支付不能正常出场；有效月租无需支付；人工放行必须有原因。
- 月租通过前必须检查同车已通过记录的日期区间重叠。
- 一个用户最多 3 辆车，仅一辆默认；占用中的车辆不能删除。

## 认证与个人资料（1～5）

### 1. 车主注册

- **方法/路径**：`POST /auth/register`；登录：否；角色：公开（只能创建 USER）。
- **Path/Query**：无。
- **Body/字段**：`RegisterRequest { username,password,confirmPassword,nickname,phone,email }`；密码至少 6 位、两次一致，手机/邮箱格式有效。
- **成功**：`ActionResult { success,message,id }`。
- **失败**：400 格式或密码错误；409 用户名、手机或邮箱已存在；500。
- **规则/枚举**：角色强制 USER、状态 1；密码后端 BCrypt，不返回密码。
- **前端/页面**：`src/api/auth.ts#register`；`/register`。

请求体示例：

```json
{ "username":"longuser", "password":"123456", "confirmPassword":"123456", "nickname":"Long用户", "phone":"13800009999", "email":"long@example.com" }
```

响应体示例：

```json
{ "code":200, "msg":"注册成功", "data":{ "success":true, "message":"注册成功", "id":4 } }
```

### 2. 登录

- **方法/路径**：`POST /auth/login`；登录：否；角色：三种角色。
- **Path/Query**：无。
- **Body/字段**：`LoginRequest { username,password }`，均必填。
- **成功**：`LoginResult { token,userInfo }`。
- **失败**：400 用户名或密码错误；403 账号禁用；500。
- **规则/枚举**：普通注册不产生 OPERATOR/ADMIN；Token 不含密码。
- **前端/页面**：`src/api/auth.ts#login`；`/login`, `/admin/login`。

请求体示例：

```json
{ "username":"user", "password":"123456" }
```

响应体示例：

```json
{ "code":200, "msg":"登录成功", "data":{ "token":"token-value", "userInfo":{ "id":1, "username":"user", "nickname":"张车主", "avatar":"", "phone":"13800000001", "email":"user@long.test", "roleCode":"USER", "status":1 } } }
```

### 3. 退出登录

- **方法/路径**：`POST /auth/logout`；登录：是；角色：USER/OPERATOR/ADMIN。
- **Path/Query/Body**：均无。
- **成功**：`ActionResult`。
- **失败**：401；500。
- **规则/枚举**：后端使当前会话失效；前端无论接口结果如何都清本地会话。
- **前端/页面**：`src/api/auth.ts#logout`；四套布局 Header。

响应体示例：

```json
{ "code":200, "msg":"成功", "data":{ "success":true, "message":"已退出登录" } }
```

### 4. 当前用户

- **方法/路径**：`GET /auth/me`；登录：是；角色：三种角色。
- **Path/Query/Body**：均无。
- **成功**：`UserInfo`。
- **失败**：401 Token 无效；403 用户被禁用；404 用户不存在；500。
- **规则/枚举**：只返回状态 1 的当前账号；角色为固定三值。
- **前端/页面**：`src/api/auth.ts#getCurrentUser`；Auth Store 的 `fetchCurrentUser()`，会话恢复/校验。

响应体示例：

```json
{ "code":200, "msg":"成功", "data":{ "id":1, "username":"user", "nickname":"张车主", "avatar":"", "phone":"13800000001", "email":"user@long.test", "roleCode":"USER", "status":1 } }
```

### 5. 修改个人资料

- **方法/路径**：`PUT /users/profile`；登录：是；角色：三种角色。
- **Path/Query**：无。
- **Body/字段**：`ProfileRequest { nickname,avatar?,phone,email }`。
- **成功**：更新后的 `UserInfo`。
- **失败**：400 格式错误；401；409 手机或邮箱占用；500。
- **规则/枚举**：不能在此接口改变用户名、角色和状态。
- **前端/页面**：`src/api/auth.ts#updateProfile`；`/user/profile`。

响应体示例：

```json
{ "code":200, "msg":"资料已更新", "data":{ "id":1, "username":"user", "nickname":"张车主", "avatar":"https://example.com/avatar/1.png", "phone":"13800000001", "email":"user@long.test", "roleCode":"USER", "status":1 } }
```

## 公共数据（6～9）

### 6. 首页数据

- **方法/路径**：`GET /home`；登录：否（Bearer 可选）；角色：公开。
- **Path/Query/Body**：无。
- **成功**：`HomeData { totalAvailableSpaces,totalSpaces,recommendedLots,recommendedPlans,monthlyApplications }`。
- **失败**：500。
- **规则/枚举**：未登录或非 USER 时 `monthlyApplications=[]`；推荐仅取启用/营业数据。
- **前端/页面**：`src/api/public.ts#getHome`；`/`, `/user/dashboard`, `/user/monthly-applications`。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalAvailableSpaces": 11,
    "totalSpaces": 14,
    "recommendedLots": [
      { "id":1, "lotName":"Long 中心停车场", "lotCode":"LONG-CENTER", "address":"北京市朝阳区长安路 88 号", "contactPhone":"010-80001111", "businessStartTime":"00:00", "businessEndTime":"23:59", "description":"城市中心 24 小时轻量停车场", "totalSpaces":8, "availableSpaces":6, "status":1, "temporaryPrice":5.00 }
    ],
    "recommendedPlans": [
      { "id":1, "parkingLotId":1, "parkingLotName":"Long 中心停车场", "planName":"小型车月享套餐", "vehicleType":"SMALL", "monthCount":1, "price":399.00, "description":"一个月不限次进出", "status":1 }
    ],
    "monthlyApplications": [
      { "id":2, "applicationNo":"MA202607180002", "userId":1, "userName":"张车主", "vehicleId":1, "plateNumber":"京A12345", "parkingLotId":2, "parkingLotName":"Long 科技园停车场", "planId":3, "planName":"园区通勤月卡", "applicationAmount":299.00, "startDate":"2026-07-23", "endDate":"2026-08-23", "status":0 }
    ]
  }
}
```

### 7. 停车场分页

- **方法/路径**：`GET /parking-lots`；登录：否；角色：公开。
- **Path/Body**：无。
- **Query/字段**：`page,pageSize,name?,status?,hasAvailable?`；status 为停车场枚举，hasAvailable 为 boolean。
- **成功**：`PageResult<ParkingLot>`。
- **失败**：400 非法分页/状态；500。
- **规则/枚举**：name 匹配名称或地址；有空位即 `availableSpaces>0`。
- **前端/页面**：`src/api/public.ts#getParkingLots`；停车场列表、月租筛选、工作台、入场。

示例：`GET /parking-lots?page=1&pageSize=10&name=中心&status=1&hasAvailable=true`。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      { "id":1, "lotName":"Long 中心停车场", "lotCode":"LONG-CENTER", "address":"北京市朝阳区长安路 88 号", "contactPhone":"010-80001111", "businessStartTime":"00:00", "businessEndTime":"23:59", "description":"城市中心 24 小时轻量停车场", "totalSpaces":8, "availableSpaces":6, "status":1, "temporaryPrice":5.00 }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

### 8. 停车场详情

- **方法/路径**：`GET /parking-lots/{id}`；登录：否；角色：公开。
- **Path**：`id bigint` 停车场ID；Query/Body：无。
- **成功**：`ParkingLotDetail { lot,spaces,spaceStats,billingRule,monthlyPlanIds }`。
- **失败**：404 停车场或计费规则不存在；500。
- **规则/枚举**：一次返回详情、车位类型统计、唯一规则和可用套餐ID；无停车区域和地图。
- **前端/页面**：`src/api/public.ts#getParkingLotDetail`；`/parking-lot/:id`, `/operator/entry`。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "lot": { "id":1, "lotName":"Long 中心停车场", "lotCode":"LONG-CENTER", "address":"北京市朝阳区长安路 88 号", "contactPhone":"010-80001111", "businessStartTime":"00:00", "businessEndTime":"23:59", "description":"城市中心 24 小时轻量停车场", "totalSpaces":8, "availableSpaces":6, "status":1, "temporaryPrice":5.00 },
    "spaces": [
      { "id":1, "parkingLotId":1, "spaceCode":"A001", "spaceType":"NORMAL", "status":2, "currentPlateNumber":"京A12345" },
      { "id":2, "parkingLotId":1, "spaceCode":"A002", "spaceType":"NORMAL", "status":1, "currentPlateNumber":"" }
    ],
    "spaceStats": { "NORMAL":5, "NEW_ENERGY":2, "DISABLED":1 },
    "billingRule": { "id":1, "parkingLotId":1, "freeMinutes":30, "firstHourPrice":5.00, "additionalHourPrice":3.00, "dailyCapAmount":30.00, "status":1 },
    "monthlyPlanIds": [1, 2]
  }
}
```

### 9. 月租套餐

- **方法/路径**：`GET /monthly-plans`；登录：否；角色：公开。
- **Path/Body**：无。
- **Query/字段**：`parkingLotId?`, `vehicleType?`, `status?`。
- **成功**：`MonthlyPlan[]`。
- **失败**：400 查询枚举错误；500。
- **规则/枚举**：车辆类型 SMALL/NEW_ENERGY；公共页通常只取 status=1。
- **前端/页面**：`src/api/public.ts#getMonthlyPlans`；停车场详情、月租套餐、新建申请。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    { "id":1, "parkingLotId":1, "parkingLotName":"Long 中心停车场", "planName":"小型车月享套餐", "vehicleType":"SMALL", "monthCount":1, "price":399.00, "description":"一个月不限次进出", "status":1 }
  ]
}
```

## 用户端（10～15）

### 10. 我的车辆

- **方法/路径**：`GET /user/vehicles`；登录：是；角色：USER。
- **Path/Query/Body**：无。
- **成功**：`Vehicle[]`，`inYard` 表示是否存在未结束记录。
- **失败**：401；403；500。
- **规则/枚举**：只返回当前用户车辆；车辆类型、状态见公共枚举。
- **前端/页面**：`src/api/user.ts#getVehicles`；用户概览、我的车辆、新建月租。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    { "id":1, "userId":1, "plateNumber":"京A12345", "brand":"大众", "model":"朗逸", "color":"白色", "vehicleType":"SMALL", "isDefault":true, "status":1, "inYard":true },
    { "id":2, "userId":1, "plateNumber":"京AD6688", "brand":"比亚迪", "model":"海豚", "color":"蓝色", "vehicleType":"NEW_ENERGY", "isDefault":false, "status":1, "inYard":false }
  ]
}
```

### 11. 综合保存车辆

- **方法/路径**：`POST /user/vehicles/save`；登录：是；角色：USER。
- **Path/Query**：无。
- **Body/字段**：`VehicleSaveRequest`；`action=CREATE|UPDATE|SET_DEFAULT`；UPDATE/SET_DEFAULT 必须 `id`；CREATE/UPDATE 使用车牌、品牌、型号、颜色、vehicleType、status。
- **成功**：保存后的 `Vehicle`。
- **失败**：400 缺字段；401/403；404 车辆不存在；409 车牌重复或超过 3 辆；500。
- **规则/枚举**：车牌全局唯一；仅一辆默认；SET_DEFAULT 忽略其他编辑字段。
- **前端/页面**：`src/api/user.ts#saveVehicle`；`/user/vehicles`。

请求体示例（新建）：

```json
{ "action":"CREATE", "plateNumber":"京A88888", "brand":"大众", "model":"高尔夫", "color":"白色", "vehicleType":"SMALL", "status":1 }
```

请求体示例（更新）：

```json
{ "action":"UPDATE", "id":3, "plateNumber":"京A88888", "brand":"大众", "model":"高尔夫GTI", "color":"红色", "vehicleType":"SMALL", "status":1 }
```

请求体示例（设为默认）：

```json
{ "action":"SET_DEFAULT", "id":3 }
```

响应体示例（新建）：

```json
{ "code":200, "msg":"车辆已添加", "data":{ "id":3, "userId":1, "plateNumber":"京A88888", "brand":"大众", "model":"高尔夫", "color":"白色", "vehicleType":"SMALL", "isDefault":false, "status":1 } }
```

### 12. 删除车辆

- **方法/路径**：`DELETE /user/vehicles/{id}`；登录：是；角色：USER。
- **Path**：`id bigint` 当前用户车辆ID；Query/Body：无。
- **成功**：`ActionResult`。
- **失败**：401/403；404；409 当前在场不能删；500。
- **规则/枚举**：删除默认车后，若仍有车辆则后端指定一辆默认；历史停车记录不删除。
- **前端/页面**：`src/api/user.ts#deleteVehicle`；`/user/vehicles`，二次确认。

响应体示例：

```json
{ "code":200, "msg":"成功", "data":{ "success":true, "message":"车辆已删除", "id":2 } }
```

### 13. 用户停车记录

- **方法/路径**：`GET /user/parking-records`；登录：是；角色：USER。
- **Path/Body**：无。
- **Query/字段**：`page,pageSize,plateNumber?,status?`。
- **成功**：`PageResult<ParkingRecord>`。
- **失败**：400；401/403；500。
- **规则/枚举**：只返回当前用户；按入场时间倒序；状态 0～4。
- **前端/页面**：`src/api/user.ts#getUserParkingRecords`；用户概览、停车记录。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      { "id":1, "recordNo":"PR202607180001", "userId":1, "vehicleId":1, "plateNumber":"京A12345", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "spaceId":1, "spaceCode":"A001", "entryTime":"2026-07-18T08:28:00+08:00", "parkingMinutes":92, "payableAmount":8.00, "paymentStatus":0, "recordStatus":1, "monthlyVehicle":false, "operatorId":2 }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

### 14. 停车详情与支付动作

- **方法/路径**：`GET /user/parking-records/{id}`；登录：是；角色：USER。
- **Path**：`id bigint`；**Query**：可选 `action=PAY`；Body：无。
- **成功**：`ParkingRecordDetail { record,fee,canPay }`；fee 为 `ParkingFeeResult`。
- **失败**：401/403；404 非本人/不存在；409 重复支付或已出场；500。
- **规则/枚举**：无 action 时只计算/读取；PAY 时仅未支付、未出场、非有效月租可支付，写流水号/时间/金额。
- **前端/页面**：`src/api/user.ts#getUserParkingRecordDetail`；`/user/parking-record/:id`。

`ParkingFeeResult` 字段：`parkingRecordId,entryTime,calculateTime,parkingMinutes,freeMinutes,payableAmount,monthlyVehicle,feeDescription`。

响应体示例（查询详情）：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "record": { "id":1, "recordNo":"PR202607180001", "userId":1, "vehicleId":1, "plateNumber":"京A12345", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "spaceId":1, "spaceCode":"A001", "entryTime":"2026-07-18T08:28:00+08:00", "parkingMinutes":92, "payableAmount":8.00, "paymentStatus":0, "recordStatus":1, "monthlyVehicle":false, "operatorId":2 },
    "fee": { "parkingRecordId":1, "entryTime":"2026-07-18T08:28:00+08:00", "calculateTime":"2026-07-18T10:00:00+08:00", "parkingMinutes":92, "freeMinutes":30, "payableAmount":8.00, "monthlyVehicle":false, "feeDescription":"30分钟免费，首小时5元，后续每小时3元，不足1小时按1小时，单日封顶30元" },
    "canPay": true
  }
}
```

使用 `action=PAY` 支付成功时，响应结构不变，`msg` 为“模拟支付成功”，且 `record.paymentStatus=1`、`record.recordStatus=2`，同时返回 `paymentNo` 和 `payTime`。

> 固定清单把详情定义为 GET，同时要求支付复用该接口。为保持严格 24 个接口并避免创建第 25 个 method/path，前端采用同一 GET 的 `action=PAY` Query。真实后端应按此契约实现；若团队坚持 Request Body，需要先书面变更固定清单和客户端适配，不能私自新增接口。

### 15. 综合保存月租申请

- **方法/路径**：`POST /user/monthly-applications/save`；登录：是；角色：USER。
- **Path/Query**：无。
- **Body/字段**：CREATE `{ action,vehicleId,planId,startDate }`；CANCEL `{ action,id }`。
- **成功**：`MonthlyApplicationSaveResult { application?,applications }`，响应携带当前用户列表。
- **失败**：400；401/403；404；409 车辆停用、类型不符、重叠、状态不可取消；500。
- **规则/枚举**：仅待审核可取消；通过后不可取消；结束日期由套餐月数计算；无续费动作。
- **前端/页面**：`src/api/user.ts#saveMonthlyApplication`；申请列表、新建申请。

请求体示例（新建）：

```json
{ "action":"CREATE", "vehicleId":2, "planId":2, "startDate":"2026-08-01" }
```

请求体示例（取消）：

```json
{ "action":"CANCEL", "id":2 }
```

响应体示例（新建）：

```json
{
  "code": 200,
  "msg": "月租申请已提交",
  "data": {
    "application": { "id":3, "applicationNo":"MA202607220003", "userId":1, "userName":"张车主", "vehicleId":2, "plateNumber":"京AD6688", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "planId":2, "planName":"新能源季享套餐", "applicationAmount":999.00, "startDate":"2026-08-01", "endDate":"2026-11-01", "status":0 },
    "applications": [
      { "id":3, "applicationNo":"MA202607220003", "userId":1, "userName":"张车主", "vehicleId":2, "plateNumber":"京AD6688", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "planId":2, "planName":"新能源季享套餐", "applicationAmount":999.00, "startDate":"2026-08-01", "endDate":"2026-11-01", "status":0 }
    ]
  }
}
```

## 工作人员端（16～19）

### 16. 车辆入场

- **方法/路径**：`POST /operator/vehicles/entry`；登录：是；角色：OPERATOR。
- **Path/Query**：无。
- **Body/字段**：`VehicleEntryRequest { plateNumber,parkingLotId,spaceId }`。
- **成功**：`VehicleEntryResult { parkingRecordId,recordNo,plateNumber,parkingLotName,spaceCode,entryTime,monthlyVehicle }`。
- **失败**：400；401/403；404；409 重复在场、停车场未营业、车位不空闲、车辆停用；500。
- **规则/枚举**：同车牌防重复；入场事务创建记录、占用车位、更新空闲数；按车辆+停车场+有效期识别月租；提交按钮需立即禁用。
- **前端/页面**：`src/api/operator.ts#enterVehicle`；`/operator/entry`。

请求体示例：

```json
{ "plateNumber":"京AD6688", "parkingLotId":1, "spaceId":4 }
```

响应体示例：

```json
{ "code":200, "msg":"车辆入场成功", "data":{ "parkingRecordId":10, "recordNo":"PR202607180010", "plateNumber":"京AD6688", "parkingLotName":"Long 中心停车场", "spaceCode":"E001", "entryTime":"2026-07-18T10:00:00+08:00", "monthlyVehicle":true } }
```

### 17. 工作人员停车记录

- **方法/路径**：`GET /operator/parking-records`；登录：是；角色：OPERATOR。
- **Path/Body**：无。
- **Query/字段**：`page,pageSize,plateNumber?,status?,currentOnly?`。
- **成功**：`PageResult<ParkingRecord>`。
- **失败**：400；401/403；500。
- **规则/枚举**：`currentOnly=true` 仅状态 0/1/2；按入场时间倒序。
- **前端/页面**：`src/api/operator.ts#getOperatorParkingRecords`；工作概览、场内车辆、停车记录。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      { "id":3, "recordNo":"PR202607180003", "plateNumber":"沪B88888", "parkingLotId":2, "parkingLotName":"Long 科技园停车场", "spaceId":9, "spaceCode":"B001", "entryTime":"2026-07-18T09:42:00+08:00", "parkingMinutes":18, "payableAmount":0.00, "paymentStatus":0, "recordStatus":0, "monthlyVehicle":false, "operatorId":2 }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

### 18. 按车牌查询场内记录

- **方法/路径**：`GET /operator/parking-records/current/{plateNumber}`；登录：是；角色：OPERATOR。
- **Path/字段**：`plateNumber` URL 编码后的车牌；Query/Body：无。
- **成功**：最新计算后的 `ParkingRecord`。
- **失败**：401/403；404 没有场内记录；500。
- **规则/枚举**：只查状态 0/1/2；查询时后端计算当前分钟和费用，并返回支付/月租状态。
- **前端/页面**：`src/api/operator.ts#getCurrentRecord`；`/operator/exit`。

响应体示例：

```json
{ "code":200, "msg":"成功", "data":{ "id":1, "recordNo":"PR202607180001", "userId":1, "vehicleId":1, "plateNumber":"京A12345", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "spaceId":1, "spaceCode":"A001", "entryTime":"2026-07-18T08:28:00+08:00", "parkingMinutes":92, "payableAmount":8.00, "paymentStatus":1, "paymentNo":"PAY202607180001", "payTime":"2026-07-18T09:58:00+08:00", "recordStatus":2, "monthlyVehicle":false, "operatorId":2 } }
```

### 19. 车辆出场/人工放行

- **方法/路径**：`POST /operator/vehicles/exit`；登录：是；角色：OPERATOR。
- **Path/Query**：无。
- **Body/字段**：`VehicleExitRequest { parkingRecordId,action,releaseReason? }`；action=`NORMAL_EXIT|MANUAL_RELEASE`。
- **成功**：`VehicleExitResult { record,releasedSpaceCode }`。
- **失败**：400 人工原因空；401/403；404；409 未支付或重复出场；500。
- **规则/枚举**：正常出场要求临时车已支付或有效月租；人工放行必须原因；事务更新记录、释放车位、更新空闲数；按钮立即禁用并二次确认。
- **前端/页面**：`src/api/operator.ts#exitVehicle`；`/operator/exit`。

请求体示例（正常出场）：

```json
{ "parkingRecordId":10, "action":"NORMAL_EXIT" }
```

请求体示例（人工放行）：

```json
{ "parkingRecordId":10, "action":"MANUAL_RELEASE", "releaseReason":"现场支付设备异常，经值班主管确认放行" }
```

响应体示例（正常出场）：

```json
{
  "code": 200,
  "msg": "车辆出场成功",
  "data": {
    "record": { "id":10, "recordNo":"PR202607180010", "userId":1, "vehicleId":2, "plateNumber":"京AD6688", "parkingLotId":1, "parkingLotName":"Long 中心停车场", "spaceId":4, "spaceCode":"E001", "entryTime":"2026-07-18T08:00:00+08:00", "exitTime":"2026-07-18T10:00:00+08:00", "parkingMinutes":120, "payableAmount":0.00, "paymentStatus":2, "recordStatus":3, "monthlyVehicle":true, "operatorId":2 },
    "releasedSpaceCode": "E001"
  }
}
```

## 管理员端（20～24）

### 20. 运营看板

- **方法/路径**：`GET /admin/dashboard`；登录：是；角色：ADMIN。
- **Path/Query/Body**：无。
- **成功**：`AdminDashboard { metrics,dateLabels,entryTrend,exitTrend,revenueTrend,spaceStatus,recentRecords }`。
- **失败**：401/403；500。
- **规则/枚举**：指标包含用户、停车场、总/空闲位、场内、今日/月收入、待审月租；趋势固定最近七天。
- **前端/页面**：`src/api/admin.ts#getAdminDashboard`；`/admin/dashboard`。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "metrics": [
      { "label":"用户数", "value":3 },
      { "label":"停车场数", "value":2 },
      { "label":"总车位数", "value":14 },
      { "label":"空闲车位数", "value":11 },
      { "label":"当前场内车辆", "value":2 },
      { "label":"今日收入", "value":8, "suffix":"元" },
      { "label":"本月收入", "value":164, "suffix":"元" },
      { "label":"待审核月租申请", "value":1 }
    ],
    "dateLabels": ["周六", "周日", "周一", "周二", "周三", "周四", "今天"],
    "entryTrend": [12, 9, 15, 18, 14, 21, 11],
    "exitTrend": [10, 11, 13, 16, 15, 18, 8],
    "revenueTrend": [86, 65, 110, 135, 94, 168, 8],
    "spaceStatus": [
      { "name":"空闲", "value":11 },
      { "name":"占用", "value":2 },
      { "name":"停用/维护", "value":1 }
    ],
    "recentRecords": [
      { "id":3, "recordNo":"PR202607180003", "plateNumber":"沪B88888", "parkingLotId":2, "parkingLotName":"Long 科技园停车场", "spaceId":9, "spaceCode":"B001", "entryTime":"2026-07-18T09:42:00+08:00", "parkingMinutes":18, "payableAmount":0.00, "paymentStatus":0, "recordStatus":0, "monthlyVehicle":false, "operatorId":2 }
    ]
  }
}
```

### 21. 管理员用户分页

- **方法/路径**：`GET /admin/users`；登录：是；角色：ADMIN。
- **Path/Body**：无。
- **Query/字段**：`page,pageSize,keyword?,roleCode?,status?`。
- **成功**：`PageResult<UserInfo>`。
- **失败**：400；401/403；500。
- **规则/枚举**：keyword 匹配用户名、昵称、手机；角色为固定三值；不返回密码。
- **前端/页面**：`src/api/admin.ts#getAdminUsers`；`/admin/users`。

响应体示例：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      { "id":1, "username":"user", "nickname":"张车主", "avatar":"", "phone":"13800000001", "email":"user@long.test", "roleCode":"USER", "status":1 }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

### 22. 管理员用户动作

- **方法/路径**：`POST /admin/users/action`；登录：是；角色：ADMIN。
- **Path/Query**：无。
- **Body/字段**：CHANGE_STATUS `{ action,userId,status }`；CHANGE_ROLE `{ action,userId,roleCode }`。
- **成功**：更新后的 `UserInfo`。
- **失败**：400；401/403；404；409 修改当前管理员等冲突；500。
- **规则/枚举**：action 仅两值；状态 0/1；角色三值；操作需前端二次确认。
- **前端/页面**：`src/api/admin.ts#actOnAdminUser`；`/admin/users`。

请求体示例（修改状态）：

```json
{ "action":"CHANGE_STATUS", "userId":4, "status":0 }
```

请求体示例（修改角色）：

```json
{ "action":"CHANGE_ROLE", "userId":4, "roleCode":"OPERATOR" }
```

响应体示例（修改角色）：

```json
{ "code":200, "msg":"用户已更新", "data":{ "id":4, "username":"longuser", "nickname":"Long用户", "avatar":"", "phone":"13800009999", "email":"long@example.com", "roleCode":"OPERATOR", "status":1 } }
```

### 23. 管理员综合资源查询

- **方法/路径**：`GET /admin/resources`；登录：是；角色：ADMIN。
- **Path/Body**：无。
- **Query/字段**：必填 `resourceType`；可选 `page,pageSize,keyword,status,parkingLotId`。
- **成功**：`PageResult<T>`，T 由 resourceType 决定。
- **失败**：400 类型/分页错误；401/403；500。
- **规则/枚举**：resourceType 仅 `PARKING_LOT|PARKING_SPACE|BILLING_RULE|MONTHLY_PLAN|MONTHLY_APPLICATION`。
- **前端/页面**：`src/api/admin.ts#getAdminResources<T>`；停车综合管理、月租综合管理。

五种查询示例：

```http
GET /admin/resources?resourceType=PARKING_LOT&page=1&pageSize=10&status=1
GET /admin/resources?resourceType=PARKING_SPACE&parkingLotId=1&status=1
GET /admin/resources?resourceType=BILLING_RULE&parkingLotId=1
GET /admin/resources?resourceType=MONTHLY_PLAN&parkingLotId=1&status=1
GET /admin/resources?resourceType=MONTHLY_APPLICATION&page=1&pageSize=10&status=0
```

响应 T 对应：`ParkingLot`、`ParkingSpace`、`BillingRule`、`MonthlyPlan`、`MonthlyApplication`。

响应体示例（`resourceType=PARKING_LOT`）：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      { "id":1, "lotName":"Long 中心停车场", "lotCode":"LONG-CENTER", "address":"北京市朝阳区长安路 88 号", "contactPhone":"010-80001111", "businessStartTime":"00:00", "businessEndTime":"23:59", "description":"城市中心 24 小时轻量停车场", "totalSpaces":8, "availableSpaces":6, "status":1, "temporaryPrice":5.00 }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

其他 `resourceType` 使用相同分页包装，`list` 元素分别替换为对应的 `ParkingSpace`、`BillingRule`、`MonthlyPlan` 或 `MonthlyApplication` 对象。

### 24. 管理员综合资源动作

- **方法/路径**：`POST /admin/resources/action`；登录：是；角色：ADMIN。
- **Path/Query**：无。
- **Body/字段**：`{ resourceType,action,id?,payload? }`；action 仅 `CREATE|UPDATE|DELETE|CHANGE_STATUS|AUDIT`。
- **成功**：`ActionResult { success,message,id? }`。
- **失败**：400 类型/动作/字段不匹配；401/403；404；409 占用、唯一规则、重叠或状态冲突；500。
- **规则/枚举**：不同资源只允许下表动作；所有写操作独立校验；删除/状态/审核前端二次确认。
- **前端/页面**：`src/api/admin.ts#actOnAdminResource`；停车综合管理、月租综合管理。

响应体示例（创建资源）：

```json
{ "code":200, "msg":"成功", "data":{ "success":true, "message":"资源已创建", "id":3 } }
```

更新、删除、修改状态和审核成功时响应结构相同，`data.message` 分别返回对应的操作结果说明。

#### 动作允许矩阵

| resourceType | CREATE | UPDATE | DELETE | CHANGE_STATUS | AUDIT |
|---|---:|---:|---:|---:|---:|
| PARKING_LOT | 是 | 是 | 是（无引用） | 是 | 否 |
| PARKING_SPACE | 是 | 是 | 是（非占用） | 是 | 否 |
| BILLING_RULE | 是（每场唯一） | 是 | 是（无历史依赖） | 是 | 否 |
| MONTHLY_PLAN | 是 | 是 | 是（无申请引用） | 是 | 否 |
| MONTHLY_APPLICATION | 否（用户创建） | 否 | 否 | 否 | 是 |

#### PARKING_LOT 示例

```json
{ "resourceType":"PARKING_LOT", "action":"CREATE", "payload":{ "lotName":"Long 西站停车场", "lotCode":"LONG-WEST", "address":"北京市丰台区站前路1号", "contactPhone":"010-80003333", "businessStartTime":"06:00", "businessEndTime":"23:00", "description":"西站配套停车场", "totalSpaces":0, "availableSpaces":0, "status":1, "temporaryPrice":5 } }
```

```json
{ "resourceType":"PARKING_LOT", "action":"UPDATE", "id":2, "payload":{ "lotName":"Long 科技园停车场", "address":"北京市海淀区科创路18号", "businessStartTime":"07:00", "businessEndTime":"23:30" } }
```

```json
{ "resourceType":"PARKING_LOT", "action":"CHANGE_STATUS", "id":2, "payload":{ "status":2 } }
```

```json
{ "resourceType":"PARKING_LOT", "action":"DELETE", "id":2 }
```

#### PARKING_SPACE 示例

```json
{ "resourceType":"PARKING_SPACE", "action":"CREATE", "payload":{ "parkingLotId":1, "spaceCode":"A006", "spaceType":"NORMAL", "status":1, "currentPlateNumber":"" } }
```

```json
{ "resourceType":"PARKING_SPACE", "action":"UPDATE", "id":6, "payload":{ "spaceCode":"D001", "spaceType":"DISABLED", "status":3 } }
```

```json
{ "resourceType":"PARKING_SPACE", "action":"CHANGE_STATUS", "id":6, "payload":{ "status":1 } }
```

```json
{ "resourceType":"PARKING_SPACE", "action":"DELETE", "id":6 }
```

占用状态 2 的车位不得删除；创建/删除/状态变化后必须重算停车场总数与空闲数。

#### BILLING_RULE 示例

```json
{ "resourceType":"BILLING_RULE", "action":"CREATE", "payload":{ "parkingLotId":3, "freeMinutes":30, "firstHourPrice":5.00, "additionalHourPrice":3.00, "dailyCapAmount":30.00, "status":1 } }
```

```json
{ "resourceType":"BILLING_RULE", "action":"UPDATE", "id":1, "payload":{ "freeMinutes":30, "firstHourPrice":5.00, "additionalHourPrice":3.00, "dailyCapAmount":30.00 } }
```

```json
{ "resourceType":"BILLING_RULE", "action":"CHANGE_STATUS", "id":1, "payload":{ "status":0 } }
```

```json
{ "resourceType":"BILLING_RULE", "action":"DELETE", "id":3 }
```

`parkingLotId` 唯一，第二条规则返回 409。

#### MONTHLY_PLAN 示例

```json
{ "resourceType":"MONTHLY_PLAN", "action":"CREATE", "payload":{ "parkingLotId":1, "parkingLotName":"Long 中心停车场", "planName":"小型车半年卡", "vehicleType":"SMALL", "monthCount":6, "price":1999.00, "description":"半年不限次通行", "status":1 } }
```

```json
{ "resourceType":"MONTHLY_PLAN", "action":"UPDATE", "id":1, "payload":{ "planName":"小型车月享套餐", "monthCount":1, "price":399.00, "description":"一个月不限次进出" } }
```

```json
{ "resourceType":"MONTHLY_PLAN", "action":"CHANGE_STATUS", "id":1, "payload":{ "status":0 } }
```

```json
{ "resourceType":"MONTHLY_PLAN", "action":"DELETE", "id":4 }
```

#### MONTHLY_APPLICATION 审核示例

```json
{ "resourceType":"MONTHLY_APPLICATION", "action":"AUDIT", "id":2, "payload":{ "status":1, "auditRemark":"资料完整，审核通过" } }
```

```json
{ "resourceType":"MONTHLY_APPLICATION", "action":"AUDIT", "id":2, "payload":{ "status":2, "auditRemark":"车辆资料与申请类型不符" } }
```

只允许待审核记录；拒绝原因必填；通过前再次执行日期重叠校验。月租申请不允许管理员 CREATE/UPDATE/DELETE/CHANGE_STATUS。

## 关键状态机与并发要求

```text
停车中(0) -> 待缴费(1) -> 已缴费(2) -> 已出场(3)
停车中/待缴费/已缴费 -> 人工放行(4)
月租车辆：停车中(0) -> 已缴费语义(2，paymentStatus=2) -> 已出场(3)
```

- 入场：按车牌锁 + 事务内未结束记录复查 + 车位条件更新。
- 支付：按记录锁；只有 `payment_status=0` 可更新，`payment_no` 唯一。
- 出场：只有 recordStatus 0/1/2 可转移；释放车位与空闲计数同事务。
- 月租审核：锁定同车相关通过记录，区间相交公式为 `newStart <= oldEnd && newEnd >= oldStart`。
