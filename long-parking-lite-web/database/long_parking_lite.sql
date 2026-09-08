-- Long 轻量智慧停车管理平台 MySQL 8 初始化脚本
-- 仅包含固定 8 张业务表，不创建物理外键。

create database if not exists long_parking_lite
  default character set utf8mb4
  default collate utf8mb4_0900_ai_ci;

use long_parking_lite;

create table if not exists sys_user (
  id bigint unsigned not null auto_increment comment '用户主键',
  username varchar(50) not null comment '登录用户名',
  password varchar(100) not null comment 'BCrypt 密码哈希，禁止保存明文',
  nickname varchar(50) not null comment '用户昵称',
  avatar varchar(255) null comment '头像地址',
  phone varchar(20) not null comment '手机号',
  email varchar(100) not null comment '邮箱',
  role_code varchar(20) not null default 'USER' comment '角色：USER/OPERATOR/ADMIN',
  status tinyint not null default 1 comment '状态：0禁用，1正常',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_sys_user_username (username),
  unique key uk_sys_user_phone (phone),
  unique key uk_sys_user_email (email),
  key idx_sys_user_role_status (role_code, status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='系统用户表';

create table if not exists user_vehicle (
  id bigint unsigned not null auto_increment comment '车辆主键',
  user_id bigint unsigned not null comment '所属用户ID，逻辑关联sys_user.id',
  plate_number varchar(20) not null comment '车牌号码',
  brand varchar(50) null comment '品牌',
  model varchar(50) null comment '型号',
  color varchar(30) null comment '颜色',
  vehicle_type varchar(20) not null comment '车辆类型：SMALL/NEW_ENERGY',
  is_default tinyint not null default 0 comment '是否默认：0否，1是',
  status tinyint not null default 1 comment '状态：0停用，1正常',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_user_vehicle_plate_number (plate_number),
  key idx_user_vehicle_user_id (user_id),
  key idx_user_vehicle_user_status (user_id, status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='用户车辆表';

create table if not exists parking_lot (
  id bigint unsigned not null auto_increment comment '停车场主键',
  lot_name varchar(100) not null comment '停车场名称',
  lot_code varchar(50) not null comment '停车场编码',
  address varchar(255) not null comment '地址',
  contact_phone varchar(20) null comment '联系电话',
  business_start_time time not null comment '营业开始时间',
  business_end_time time not null comment '营业结束时间',
  description varchar(500) null comment '说明',
  total_spaces int unsigned not null default 0 comment '总车位数',
  available_spaces int unsigned not null default 0 comment '空闲车位数',
  status tinyint not null default 1 comment '状态：0停用，1营业中，2维护中',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_parking_lot_code (lot_code),
  key idx_parking_lot_status (status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='停车场表';

create table if not exists parking_space (
  id bigint unsigned not null auto_increment comment '车位主键',
  parking_lot_id bigint unsigned not null comment '停车场ID，逻辑关联parking_lot.id',
  space_code varchar(50) not null comment '场内车位编号',
  space_type varchar(20) not null comment '类型：NORMAL/NEW_ENERGY/DISABLED',
  status tinyint not null default 1 comment '状态：0停用，1空闲，2已占用，3维护中',
  current_plate_number varchar(20) null comment '当前占用车牌，空闲时为null',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_parking_space_lot_code (parking_lot_id, space_code),
  key idx_parking_space_lot_status (parking_lot_id, status),
  key idx_parking_space_current_plate (current_plate_number)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='停车位表';

create table if not exists billing_rule (
  id bigint unsigned not null auto_increment comment '计费规则主键',
  parking_lot_id bigint unsigned not null comment '停车场ID，逻辑关联parking_lot.id',
  free_minutes int unsigned not null default 30 comment '免费分钟数',
  first_hour_price decimal(10,2) not null default 5.00 comment '首小时价格',
  additional_hour_price decimal(10,2) not null default 3.00 comment '超出首小时后每小时价格',
  daily_cap_amount decimal(10,2) not null default 30.00 comment '单日封顶金额',
  status tinyint not null default 1 comment '状态：0停用，1生效',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_billing_rule_parking_lot (parking_lot_id),
  key idx_billing_rule_status (status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='基础计费规则表';

create table if not exists parking_record (
  id bigint unsigned not null auto_increment comment '停车记录主键',
  record_no varchar(50) not null comment '停车记录编号',
  user_id bigint unsigned null comment '用户ID，临时未绑定车辆可为空',
  vehicle_id bigint unsigned null comment '用户车辆ID，未绑定车辆可为空',
  plate_number varchar(20) not null comment '入场车牌快照',
  parking_lot_id bigint unsigned not null comment '停车场ID',
  space_id bigint unsigned not null comment '车位ID',
  entry_time datetime not null comment '入场时间',
  exit_time datetime null comment '出场时间',
  parking_minutes int unsigned not null default 0 comment '停车分钟数',
  payable_amount decimal(10,2) not null default 0.00 comment '应付金额',
  payment_status tinyint not null default 0 comment '支付状态：0未支付，1已支付，2无需支付',
  payment_no varchar(64) null comment '模拟支付流水号',
  pay_time datetime null comment '模拟支付时间',
  record_status tinyint not null default 0 comment '记录状态：0停车中，1待缴费，2已缴费，3已出场，4人工放行',
  monthly_vehicle tinyint not null default 0 comment '入场时是否有效月租：0否，1是',
  release_reason varchar(500) null comment '人工放行原因',
  operator_id bigint unsigned null comment '最后操作工作人员ID',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_parking_record_no (record_no),
  unique key uk_parking_record_payment_no (payment_no),
  key idx_parking_record_plate (plate_number),
  key idx_parking_record_lot (parking_lot_id),
  key idx_parking_record_status (record_status),
  key idx_parking_record_entry_time (entry_time),
  key idx_parking_record_user_time (user_id, entry_time)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='停车记录表（含支付与人工放行信息）';

create table if not exists monthly_plan (
  id bigint unsigned not null auto_increment comment '月租套餐主键',
  parking_lot_id bigint unsigned not null comment '停车场ID',
  plan_name varchar(100) not null comment '套餐名称',
  vehicle_type varchar(20) not null comment '适用车辆类型：SMALL/NEW_ENERGY',
  month_count int unsigned not null comment '套餐月数',
  price decimal(10,2) not null comment '套餐价格',
  description varchar(500) null comment '套餐说明',
  status tinyint not null default 1 comment '状态：0停用，1启用',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  key idx_monthly_plan_lot_status (parking_lot_id, status),
  key idx_monthly_plan_vehicle_type (vehicle_type)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='月租套餐表';

create table if not exists monthly_application (
  id bigint unsigned not null auto_increment comment '月租申请主键',
  application_no varchar(50) not null comment '月租申请编号',
  user_id bigint unsigned not null comment '申请用户ID',
  vehicle_id bigint unsigned not null comment '申请车辆ID',
  parking_lot_id bigint unsigned not null comment '停车场ID',
  plan_id bigint unsigned not null comment '月租套餐ID',
  application_amount decimal(10,2) not null comment '申请金额快照',
  start_date date not null comment '有效开始日期',
  end_date date not null comment '有效结束日期',
  status tinyint not null default 0 comment '状态：0待审核，1通过，2拒绝，3取消，4过期',
  audit_user_id bigint unsigned null comment '审核管理员ID',
  audit_remark varchar(500) null comment '审核意见',
  audit_time datetime null comment '审核时间',
  create_time datetime not null default current_timestamp comment '创建时间',
  update_time datetime not null default current_timestamp on update current_timestamp comment '更新时间',
  primary key (id),
  unique key uk_monthly_application_no (application_no),
  key idx_monthly_application_vehicle (vehicle_id),
  key idx_monthly_application_lot (parking_lot_id),
  key idx_monthly_application_status (status),
  key idx_monthly_application_end_date (end_date),
  key idx_monthly_application_vehicle_range (vehicle_id, status, start_date, end_date)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_0900_ai_ci comment='月租申请及有效月租表';

insert into parking_lot
  (id, lot_name, lot_code, address, contact_phone, business_start_time, business_end_time, description, total_spaces, available_spaces, status)
values
  (1, 'Long 中心停车场', 'LONG-CENTER', '北京市朝阳区长安路88号', '010-80001111', '00:00:00', '23:59:00', '城市中心24小时轻量停车场', 6, 5, 1)
on duplicate key update lot_name = values(lot_name), update_time = current_timestamp;

insert into parking_space (parking_lot_id, space_code, space_type, status, current_plate_number) values
  (1, 'A001', 'NORMAL', 1, null),
  (1, 'A002', 'NORMAL', 1, null),
  (1, 'A003', 'NORMAL', 1, null),
  (1, 'E001', 'NEW_ENERGY', 1, null),
  (1, 'E002', 'NEW_ENERGY', 1, null),
  (1, 'D001', 'DISABLED', 3, null)
on duplicate key update space_type = values(space_type), status = values(status), update_time = current_timestamp;

insert into billing_rule
  (parking_lot_id, free_minutes, first_hour_price, additional_hour_price, daily_cap_amount, status)
values
  (1, 30, 5.00, 3.00, 30.00, 1)
on duplicate key update free_minutes = values(free_minutes), first_hour_price = values(first_hour_price), additional_hour_price = values(additional_hour_price), daily_cap_amount = values(daily_cap_amount), status = values(status), update_time = current_timestamp;

insert into monthly_plan
  (parking_lot_id, plan_name, vehicle_type, month_count, price, description, status)
values
  (1, '小型车月享套餐', 'SMALL', 1, 399.00, '一个月不限次进出', 1),
  (1, '新能源季享套餐', 'NEW_ENERGY', 3, 999.00, '三个月新能源车位通行', 1);
