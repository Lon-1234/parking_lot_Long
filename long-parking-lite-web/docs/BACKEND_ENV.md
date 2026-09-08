# 后端环境与对接说明

本文只说明未来 Spring Boot 后端的环境和契约，不包含任何 Java 类或可运行后端代码。

## 推荐环境

- JDK 21 LTS。
- Spring Boot 3.5.x（具体补丁版本由后端创建时锁定）。
- Maven 3.9+。
- MySQL 8.0，数据库 `long_parking_lite`，InnoDB，`utf8mb4`。
- Redis 7.x。
- MyBatis-Plus 3.5.x。
- Sa-Token 1.44.x 或团队统一的稳定版本。
- BCrypt 保存密码，禁止明文和可逆加密。
- 服务端口 `9001`，API 前缀 `/api`。

后端版本应在开发启动前以 Maven 依赖树和官方兼容矩阵复核；不要使用浮动版本。

## HTTP 契约

- 统一响应：`{ "code": 200, "msg": "成功", "data": ... }`。
- 分页：`page=1`、`pageSize=10`；返回 `list,total,page,pageSize,pages`。
- 日期 `yyyy-MM-dd`，时间使用 ISO 8601 或 `yyyy-MM-dd HH:mm:ss`，全系统统一时区。
- Java 金额必须使用 `BigDecimal`，数据库为 `decimal(10,2)`。
- Header：`Authorization: Bearer <token>`。
- 错误码：200、400、401、403、404、409、500。
- CORS：生产按前端域名白名单；本地 Vite 通过代理通常无需宽泛 CORS。

## 并发与幂等

- 防重复入场：先查车牌未结束记录；数据库事务内再次校验，Redis 车牌键或唯一性方案防并发。
- 防重复出场：只允许状态 0/1/2 转为 3/4；按记录ID做乐观锁或条件更新。
- 支付幂等：只允许 `payment_status=0` 更新，支付流水号唯一；重复请求返回同一结果或 409。
- 月租重叠：审核通过和创建时检查同车 `status=1` 且日期区间相交；审核事务内锁定相关记录。
- 一个停车场仅一条计费规则，由唯一索引和业务校验共同保证。

Redis 键建议：

```text
parking:space-lock:{spaceId}
parking:plate-in-yard:{plateNumber}
parking:payment-lock:{parkingRecordId}
```

锁必须设置短 TTL、唯一 value 并安全释放；Redis 只做并发协调，MySQL 状态仍是最终依据。

## 事务边界

- 入场：创建停车记录 + 占用车位 + 更新停车场空闲数量。
- 出场：更新停车记录 + 释放车位 + 更新停车场空闲数量。
- 支付：条件更新停车记录金额、支付状态、流水号和时间。
- 月租审核：重叠校验 + 更新申请状态、意见、审核人与时间。

异常必须整体回滚。车位状态和停车场冗余数量应提供定时对账任务；另建议每日任务把已通过且 `end_date < current_date` 的月租申请改为已过期。

## 计费与状态

基础规则：30 分钟免费；首小时 5 元；超过首小时每小时 3 元；不足一小时按一小时；单日封顶 30 元。前端只展示后端返回结果，不作为结算权威。

停车记录：0停车中、1待缴费、2已缴费、3已出场、4人工放行。支付：0未支付、1已支付、2无需支付。月租：0待审核、1通过、2拒绝、3取消、4过期。

## 综合管理接口

管理员使用 `/admin/resources` 和 `/admin/resources/action` 管理 `PARKING_LOT`、`PARKING_SPACE`、`BILLING_RULE`、`MONTHLY_PLAN`、`MONTHLY_APPLICATION`。后端需要按 resourceType 分派并做每种 payload 的独立校验，禁止把任意字段直接拼接进 SQL。月租申请仅支持 `AUDIT` 管理动作；用户创建走用户接口。

## 对接步骤

1. 执行 `database/long_parking_lite.sql`。
2. 实现 `docs/API.md` 中固定 24 个接口，保持字段名和枚举一致。
3. 创建 BCrypt 测试账号和 Sa-Token 登录态。
4. 使用 Postman/接口测试先通过登录、入场、支付、出场、月租审核。
5. 前端设置 `VITE_USE_MOCK=false`，启动 9001。
6. 检查代理、Bearer Token、分页和所有 409 业务冲突展示。
