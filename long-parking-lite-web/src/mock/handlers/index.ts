import type { AxiosRequestConfig } from 'axios'
import type MockAdapter from 'axios-mock-adapter'
import { addMonths } from '@/utils/format'
import { getDb, nextId, saveDb, type MockDatabase, type MockUser } from '../database'
import type { ApiResponse, PageResult } from '@/types/api'
import type { LoginRequest, ProfileRequest, RegisterRequest, UserInfo } from '@/types/user'
import type { MonthlyApplicationSaveRequest } from '@/types/monthly'
import type { ParkingRecord, VehicleEntryRequest, VehicleExitRequest, VehicleSaveRequest } from '@/types/parking'

type MockReply = [number, ApiResponse<unknown>]
const ok = <T>(data: T, msg = '成功'): [number, ApiResponse<T>] => [200, { code: 200, msg, data }]
const fail = (status: number, msg: string): MockReply => [status, { code: status, msg, data: null }]
const body = <T>(config: AxiosRequestConfig): T => JSON.parse(config.data as string) as T
const params = (config: AxiosRequestConfig): Record<string, string | number | boolean | undefined> => config.params as Record<string, string | number | boolean | undefined> ?? {}
const publicUser = ({ password: _password, createTime: _create, updateTime: _update, ...user }: MockUser): UserInfo => user
const paginate = <T>(list: T[], query: Record<string, string | number | boolean | undefined>): PageResult<T> => {
  const page = Number(query.page ?? 1); const pageSize = Number(query.pageSize ?? 10)
  return { list: list.slice((page - 1) * pageSize, page * pageSize), total: list.length, page, pageSize, pages: Math.ceil(list.length / pageSize) }
}
const now = () => new Date().toISOString()
const authUser = (config: AxiosRequestConfig, db: MockDatabase): MockUser | undefined => {
  const header = config.headers?.Authorization?.toString() ?? config.headers?.authorization?.toString() ?? ''
  const id = Number(header.replace('Bearer mock-token-', '').split('-').at(-1))
  return db.sysUser.find((user) => user.id === id && user.status === 1)
}
const requireUser = (config: AxiosRequestConfig, db: MockDatabase, roles?: string[]): MockUser | MockReply => {
  const user = authUser(config, db)
  if (!user) return fail(401, '未登录或 token 已失效')
  if (roles && !roles.includes(user.roleCode)) return fail(403, '无权执行此操作')
  return user
}
const isReply = (value: MockUser | MockReply): value is MockReply => Array.isArray(value)

function calculateFee(record: ParkingRecord, db: MockDatabase) {
  const rule = db.billingRule.find((item) => item.parkingLotId === record.parkingLotId && item.status === 1)
  const minutes = Math.max(1, Math.ceil((Date.now() - new Date(record.entryTime).getTime()) / 60_000))
  let amount = 0
  if (!record.monthlyVehicle && rule && minutes > rule.freeMinutes) {
    amount = rule.firstHourPrice
    if (minutes > 60) amount += Math.ceil((minutes - 60) / 60) * rule.additionalHourPrice
    const days = Math.max(1, Math.ceil(minutes / 1440))
    amount = Math.min(amount, rule.dailyCapAmount * days)
  }
  record.parkingMinutes = minutes
  record.payableAmount = amount
  if (record.recordStatus === 0 && (amount > 0 || record.monthlyVehicle)) record.recordStatus = amount > 0 ? 1 : 2
  return { parkingRecordId: record.id, entryTime: record.entryTime, calculateTime: now(), parkingMinutes: minutes, freeMinutes: rule?.freeMinutes ?? 30, payableAmount: amount, monthlyVehicle: record.monthlyVehicle, feeDescription: record.monthlyVehicle ? '有效月租车辆，本次无需支付' : '30分钟免费，首小时5元，后续每小时3元，不足1小时按1小时，单日封顶30元' }
}

function updateLotCount(db: MockDatabase, lotId: number) {
  const lot = db.parkingLot.find((item) => item.id === lotId)
  if (lot) {
    const spaces = db.parkingSpace.filter((item) => item.parkingLotId === lotId)
    lot.totalSpaces = spaces.length
    lot.availableSpaces = spaces.filter((item) => item.status === 1).length
  }
}

export function registerHandlers(mock: MockAdapter) {
  // 1 POST /auth/register
  mock.onPost('/auth/register').reply((config) => {
    const db = getDb(); const data = body<RegisterRequest>(config)
    if (data.password !== data.confirmPassword || data.password.length < 6) return fail(400, '两次密码不一致或密码少于 6 位')
    if (db.sysUser.some((u) => u.username === data.username || u.phone === data.phone || u.email === data.email)) return fail(409, '用户名、手机号或邮箱已存在')
    const id = nextId(db.sysUser); db.sysUser.push({ id, username: data.username, password: data.password, nickname: data.nickname, avatar: '', phone: data.phone, email: data.email, roleCode: 'USER', status: 1, createTime: now(), updateTime: now() }); saveDb(db)
    return ok({ success: true, message: '注册成功', id }, '注册成功')
  })

  // 2 POST /auth/login
  mock.onPost('/auth/login').reply((config) => {
    const db = getDb(); const data = body<LoginRequest>(config); const user = db.sysUser.find((item) => item.username === data.username && item.password === data.password)
    if (!user) return fail(400, '用户名或密码错误')
    if (user.status === 0) return fail(403, '账号已被禁用')
    return ok({ token: `mock-token-${user.roleCode.toLowerCase()}-${user.id}`, userInfo: publicUser(user) }, '登录成功')
  })

  // 3 POST /auth/logout
  mock.onPost('/auth/logout').reply(() => ok({ success: true, message: '已退出登录' }))

  // 4 GET /auth/me
  mock.onGet('/auth/me').reply((config) => {
    const db = getDb(); const user = requireUser(config, db); return isReply(user) ? user : ok(publicUser(user))
  })

  // 5 PUT /users/profile
  mock.onPut('/users/profile').reply((config) => {
    const db = getDb(); const user = requireUser(config, db); if (isReply(user)) return user
    const data = body<ProfileRequest>(config)
    if (db.sysUser.some((item) => item.id !== user.id && (item.phone === data.phone || item.email === data.email))) return fail(409, '手机号或邮箱已被使用')
    Object.assign(user, data, { updateTime: now() }); saveDb(db); return ok(publicUser(user), '资料已更新')
  })

  // 6 GET /home
  mock.onGet('/home').reply((config) => {
    const db = getDb(); const user = authUser(config, db)
    return ok({ totalAvailableSpaces: db.parkingLot.filter((lot) => lot.status === 1).reduce((sum, lot) => sum + lot.availableSpaces, 0), totalSpaces: db.parkingLot.reduce((sum, lot) => sum + lot.totalSpaces, 0), recommendedLots: db.parkingLot.filter((lot) => lot.status === 1).slice(0, 3), recommendedPlans: db.monthlyPlan.filter((plan) => plan.status === 1).slice(0, 3), monthlyApplications: user?.roleCode === 'USER' ? db.monthlyApplication.filter((item) => item.userId === user.id) : [] })
  })

  // 7 GET /parking-lots
  mock.onGet('/parking-lots').reply((config) => {
    const db = getDb(); const query = params(config); let list = [...db.parkingLot]
    const name = String(query.name ?? '').trim().toLowerCase(); if (name) list = list.filter((lot) => `${lot.lotName}${lot.address}`.toLowerCase().includes(name))
    if (query.status !== undefined && query.status !== '') list = list.filter((lot) => lot.status === Number(query.status))
    if (query.hasAvailable === true || query.hasAvailable === 'true') list = list.filter((lot) => lot.availableSpaces > 0)
    return ok(paginate(list, query))
  })

  // 8 GET /parking-lots/{id}
  mock.onGet(/^\/parking-lots\/\d+$/).reply((config) => {
    const db = getDb(); const id = Number(config.url?.split('/').at(-1)); const lot = db.parkingLot.find((item) => item.id === id); if (!lot) return fail(404, '停车场不存在')
    const spaces = db.parkingSpace.filter((item) => item.parkingLotId === id); const billingRule = db.billingRule.find((item) => item.parkingLotId === id)
    if (!billingRule) return fail(404, '计费规则不存在')
    return ok({ lot, spaces, spaceStats: { NORMAL: spaces.filter((s) => s.spaceType === 'NORMAL').length, NEW_ENERGY: spaces.filter((s) => s.spaceType === 'NEW_ENERGY').length, DISABLED: spaces.filter((s) => s.spaceType === 'DISABLED').length }, billingRule, monthlyPlanIds: db.monthlyPlan.filter((p) => p.parkingLotId === id && p.status === 1).map((p) => p.id) })
  })

  // 9 GET /monthly-plans
  mock.onGet('/monthly-plans').reply((config) => {
    const query = params(config); let list = [...getDb().monthlyPlan]
    if (query.parkingLotId) list = list.filter((item) => item.parkingLotId === Number(query.parkingLotId))
    if (query.vehicleType) list = list.filter((item) => item.vehicleType === query.vehicleType)
    if (query.status !== undefined && query.status !== '') list = list.filter((item) => item.status === Number(query.status))
    return ok(list)
  })

  // 10 GET /user/vehicles
  mock.onGet('/user/vehicles').reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user
    const activePlates = new Set(db.parkingRecord.filter((item) => item.recordStatus <= 2).map((item) => item.plateNumber))
    return ok(db.userVehicle.filter((item) => item.userId === user.id).map((item) => ({ ...item, inYard: activePlates.has(item.plateNumber) })))
  })

  // 11 POST /user/vehicles/save
  mock.onPost('/user/vehicles/save').reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user; const data = body<VehicleSaveRequest>(config)
    const owned = db.userVehicle.filter((item) => item.userId === user.id)
    if (data.action === 'CREATE') {
      if (owned.length >= 3) return fail(409, '每位用户最多绑定 3 辆车')
      if (!data.plateNumber || db.userVehicle.some((item) => item.plateNumber.toUpperCase() === data.plateNumber?.toUpperCase())) return fail(409, '车牌已绑定或不能为空')
      const vehicle = { id: nextId(db.userVehicle), userId: user.id, plateNumber: data.plateNumber.toUpperCase(), brand: data.brand ?? '', model: data.model ?? '', color: data.color ?? '', vehicleType: data.vehicleType ?? 'SMALL', isDefault: owned.length === 0, status: data.status ?? 1 } as const
      db.userVehicle.push(vehicle); saveDb(db); return ok(vehicle, '车辆已添加')
    }
    const vehicle = db.userVehicle.find((item) => item.id === data.id && item.userId === user.id); if (!vehicle) return fail(404, '车辆不存在')
    if (data.action === 'SET_DEFAULT') { owned.forEach((item) => { item.isDefault = item.id === vehicle.id }); saveDb(db); return ok(vehicle, '默认车辆已更新') }
    if (data.plateNumber && db.userVehicle.some((item) => item.id !== vehicle.id && item.plateNumber.toUpperCase() === data.plateNumber?.toUpperCase())) return fail(409, '车牌已绑定')
    Object.assign(vehicle, { plateNumber: data.plateNumber?.toUpperCase() ?? vehicle.plateNumber, brand: data.brand ?? vehicle.brand, model: data.model ?? vehicle.model, color: data.color ?? vehicle.color, vehicleType: data.vehicleType ?? vehicle.vehicleType, status: data.status ?? vehicle.status }); saveDb(db); return ok(vehicle, '车辆已更新')
  })

  // 12 DELETE /user/vehicles/{id}
  mock.onDelete(/^\/user\/vehicles\/\d+$/).reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user; const id = Number(config.url?.split('/').at(-1)); const vehicle = db.userVehicle.find((item) => item.id === id && item.userId === user.id); if (!vehicle) return fail(404, '车辆不存在')
    if (db.parkingRecord.some((item) => item.vehicleId === id && item.recordStatus <= 2)) return fail(409, '当前在场车辆不能删除')
    db.userVehicle = db.userVehicle.filter((item) => item.id !== id); const remain = db.userVehicle.filter((item) => item.userId === user.id); if (vehicle.isDefault && remain[0]) remain[0].isDefault = true; saveDb(db); return ok({ success: true, message: '车辆已删除', id })
  })

  // 13 GET /user/parking-records
  mock.onGet('/user/parking-records').reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user; const query = params(config); let list = db.parkingRecord.filter((item) => item.userId === user.id)
    if (query.status !== undefined && query.status !== '') list = list.filter((item) => item.recordStatus === Number(query.status)); if (query.plateNumber) list = list.filter((item) => item.plateNumber.includes(String(query.plateNumber)))
    return ok(paginate(list.sort((a, b) => b.entryTime.localeCompare(a.entryTime)), query))
  })

  // 14 GET /user/parking-records/{id}; action=PAY reuses this fixed endpoint
  mock.onGet(/^\/user\/parking-records\/\d+$/).reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user; const id = Number(config.url?.split('/').at(-1)); const record = db.parkingRecord.find((item) => item.id === id && item.userId === user.id); if (!record) return fail(404, '停车记录不存在')
    const fee = calculateFee(record, db); const action = params(config).action
    if (action === 'PAY') {
      if (record.recordStatus >= 3) return fail(409, '已出场记录不能支付')
      if (record.paymentStatus === 1) return fail(409, '该记录已经支付，请勿重复操作')
      record.paymentStatus = record.monthlyVehicle ? 2 : 1; record.recordStatus = 2; record.paymentNo = record.monthlyVehicle ? undefined : `PAY${Date.now()}`; record.payTime = now(); saveDb(db)
    } else { saveDb(db) }
    return ok({ record, fee, canPay: record.paymentStatus === 0 && record.recordStatus < 3 && !record.monthlyVehicle }, action === 'PAY' ? '模拟支付成功' : '成功')
  })

  // 15 POST /user/monthly-applications/save
  mock.onPost('/user/monthly-applications/save').reply((config) => {
    const db = getDb(); const user = requireUser(config, db, ['USER']); if (isReply(user)) return user; const data = body<MonthlyApplicationSaveRequest>(config)
    if (data.action === 'CANCEL') {
      const app = db.monthlyApplication.find((item) => item.id === data.id && item.userId === user.id); if (!app) return fail(404, '月租申请不存在'); if (app.status !== 0) return fail(409, '仅待审核申请可以取消'); app.status = 3; saveDb(db); return ok({ application: app, applications: db.monthlyApplication.filter((item) => item.userId === user.id) }, '申请已取消')
    }
    const vehicle = db.userVehicle.find((item) => item.id === data.vehicleId && item.userId === user.id); const plan = db.monthlyPlan.find((item) => item.id === data.planId && item.status === 1)
    if (!vehicle || vehicle.status !== 1) return fail(409, '车辆不存在或已停用'); if (!plan || !data.startDate) return fail(400, '套餐或开始日期无效'); if (vehicle.vehicleType !== plan.vehicleType) return fail(409, '车辆类型不适用于该套餐')
    const endDate = addMonths(data.startDate, plan.monthCount); const overlap = db.monthlyApplication.some((item) => item.vehicleId === vehicle.id && item.status === 1 && data.startDate! <= item.endDate && endDate >= item.startDate); if (overlap) return fail(409, '该车辆存在时间重叠的有效月租')
    const app = { id: nextId(db.monthlyApplication), applicationNo: `MA${Date.now()}`, userId: user.id, userName: user.nickname, vehicleId: vehicle.id, plateNumber: vehicle.plateNumber, parkingLotId: plan.parkingLotId, parkingLotName: plan.parkingLotName, planId: plan.id, planName: plan.planName, applicationAmount: plan.price, startDate: data.startDate, endDate, status: 0 as const }
    db.monthlyApplication.push(app); saveDb(db); return ok({ application: app, applications: db.monthlyApplication.filter((item) => item.userId === user.id) }, '月租申请已提交')
  })

  // 16 POST /operator/vehicles/entry
  mock.onPost('/operator/vehicles/entry').reply((config) => {
    const db = getDb(); const operator = requireUser(config, db, ['OPERATOR']); if (isReply(operator)) return operator; const data = body<VehicleEntryRequest>(config); const plate = data.plateNumber.trim().toUpperCase()
    if (db.parkingRecord.some((item) => item.plateNumber === plate && item.recordStatus <= 2)) return fail(409, '该车牌已在场内，禁止重复入场')
    const lot = db.parkingLot.find((item) => item.id === data.parkingLotId); if (!lot || lot.status !== 1) return fail(409, '停车场未营业')
    const space = db.parkingSpace.find((item) => item.id === data.spaceId && item.parkingLotId === lot.id); if (!space || space.status !== 1) return fail(409, '车位不是空闲状态')
    const vehicle = db.userVehicle.find((item) => item.plateNumber === plate); if (vehicle?.status === 0) return fail(409, '停用车辆不能入场')
    const today = new Date().toISOString().slice(0, 10); const monthlyVehicle = Boolean(vehicle && db.monthlyApplication.some((item) => item.vehicleId === vehicle.id && item.parkingLotId === lot.id && item.status === 1 && item.startDate <= today && item.endDate >= today))
    const id = nextId(db.parkingRecord); const entryTime = now(); const record: ParkingRecord = { id, recordNo: `PR${Date.now()}`, userId: vehicle?.userId, vehicleId: vehicle?.id, plateNumber: plate, parkingLotId: lot.id, parkingLotName: lot.lotName, spaceId: space.id, spaceCode: space.spaceCode, entryTime, parkingMinutes: 0, payableAmount: 0, paymentStatus: monthlyVehicle ? 2 : 0, recordStatus: 0, monthlyVehicle, operatorId: operator.id }
    db.parkingRecord.push(record); space.status = 2; space.currentPlateNumber = plate; updateLotCount(db, lot.id); saveDb(db)
    return ok({ parkingRecordId: id, recordNo: record.recordNo, plateNumber: plate, parkingLotName: lot.lotName, spaceCode: space.spaceCode, entryTime, monthlyVehicle }, '车辆入场成功')
  })

  // 17 GET /operator/parking-records
  mock.onGet('/operator/parking-records').reply((config) => {
    const db = getDb(); const operator = requireUser(config, db, ['OPERATOR']); if (isReply(operator)) return operator; const query = params(config); let list = [...db.parkingRecord]
    if (query.plateNumber) list = list.filter((item) => item.plateNumber.includes(String(query.plateNumber).toUpperCase())); if (query.status !== undefined && query.status !== '') list = list.filter((item) => item.recordStatus === Number(query.status)); if (query.currentOnly === true || query.currentOnly === 'true') list = list.filter((item) => item.recordStatus <= 2)
    return ok(paginate(list.sort((a, b) => b.entryTime.localeCompare(a.entryTime)), query))
  })

  // 18 GET /operator/parking-records/current/{plateNumber}
  mock.onGet(/^\/operator\/parking-records\/current\/.+$/).reply((config) => {
    const db = getDb(); const operator = requireUser(config, db, ['OPERATOR']); if (isReply(operator)) return operator; const plate = decodeURIComponent(config.url?.split('/').at(-1) ?? '').toUpperCase(); const record = db.parkingRecord.find((item) => item.plateNumber === plate && item.recordStatus <= 2); if (!record) return fail(404, '未找到该车牌的场内记录'); calculateFee(record, db); saveDb(db); return ok(record)
  })

  // 19 POST /operator/vehicles/exit
  mock.onPost('/operator/vehicles/exit').reply((config) => {
    const db = getDb(); const operator = requireUser(config, db, ['OPERATOR']); if (isReply(operator)) return operator; const data = body<VehicleExitRequest>(config); const record = db.parkingRecord.find((item) => item.id === data.parkingRecordId); if (!record) return fail(404, '停车记录不存在'); if (record.recordStatus >= 3) return fail(409, '车辆已经出场，禁止重复操作')
    calculateFee(record, db)
    if (data.action === 'NORMAL_EXIT' && !record.monthlyVehicle && record.paymentStatus !== 1) return fail(409, '临时车辆尚未支付，不能正常出场')
    if (data.action === 'MANUAL_RELEASE' && !data.releaseReason?.trim()) return fail(400, '人工放行必须填写原因')
    record.exitTime = now(); record.operatorId = operator.id; record.recordStatus = data.action === 'NORMAL_EXIT' ? 3 : 4; record.releaseReason = data.action === 'MANUAL_RELEASE' ? data.releaseReason?.trim() : undefined; if (record.monthlyVehicle) record.paymentStatus = 2
    const space = db.parkingSpace.find((item) => item.id === record.spaceId); if (space) { space.status = 1; space.currentPlateNumber = '' }; updateLotCount(db, record.parkingLotId); saveDb(db); return ok({ record, releasedSpaceCode: record.spaceCode }, data.action === 'NORMAL_EXIT' ? '车辆出场成功' : '人工放行成功')
  })

  // 20 GET /admin/dashboard
  mock.onGet('/admin/dashboard').reply((config) => {
    const db = getDb(); const admin = requireUser(config, db, ['ADMIN']); if (isReply(admin)) return admin
    const inYard = db.parkingRecord.filter((r) => r.recordStatus <= 2).length; const revenue = db.parkingRecord.filter((r) => r.paymentStatus === 1).reduce((sum, r) => sum + r.payableAmount, 0)
    return ok({ metrics: [{ label: '用户数', value: db.sysUser.length }, { label: '停车场数', value: db.parkingLot.length }, { label: '总车位数', value: db.parkingSpace.length }, { label: '空闲车位数', value: db.parkingSpace.filter((s) => s.status === 1).length }, { label: '当前场内车辆', value: inYard }, { label: '今日收入', value: revenue, suffix: '元' }, { label: '本月收入', value: revenue + 156, suffix: '元' }, { label: '待审核月租申请', value: db.monthlyApplication.filter((a) => a.status === 0).length }], dateLabels: ['周六','周日','周一','周二','周三','周四','今天'], entryTrend: [12,9,15,18,14,21,db.parkingRecord.length + 8], exitTrend: [10,11,13,16,15,18,Math.max(6, db.parkingRecord.filter((r) => r.recordStatus >= 3).length + 7)], revenueTrend: [86,65,110,135,94,168,revenue], spaceStatus: [{ name: '空闲', value: db.parkingSpace.filter((s) => s.status === 1).length }, { name: '占用', value: db.parkingSpace.filter((s) => s.status === 2).length }, { name: '停用/维护', value: db.parkingSpace.filter((s) => s.status === 0 || s.status === 3).length }], recentRecords: db.parkingRecord.slice(-5).reverse() })
  })

  // 21 GET /admin/users
  mock.onGet('/admin/users').reply((config) => {
    const db = getDb(); const admin = requireUser(config, db, ['ADMIN']); if (isReply(admin)) return admin; const query = params(config); let list = db.sysUser.map(publicUser); const keyword = String(query.keyword ?? '').toLowerCase(); if (keyword) list = list.filter((u) => `${u.username}${u.nickname}${u.phone}`.toLowerCase().includes(keyword)); if (query.roleCode) list = list.filter((u) => u.roleCode === query.roleCode); if (query.status !== undefined && query.status !== '') list = list.filter((u) => u.status === Number(query.status)); return ok(paginate(list, query))
  })

  // 22 POST /admin/users/action
  mock.onPost('/admin/users/action').reply((config) => {
    const db = getDb(); const admin = requireUser(config, db, ['ADMIN']); if (isReply(admin)) return admin; const data = body<{ action: 'CHANGE_STATUS' | 'CHANGE_ROLE'; userId: number; status?: 0 | 1; roleCode?: UserInfo['roleCode'] }>(config); const user = db.sysUser.find((u) => u.id === data.userId); if (!user) return fail(404, '用户不存在'); if (user.id === admin.id) return fail(409, '不能修改当前管理员账号')
    if (data.action === 'CHANGE_STATUS' && data.status !== undefined) user.status = data.status; else if (data.action === 'CHANGE_ROLE' && data.roleCode) user.roleCode = data.roleCode; else return fail(400, '操作参数不完整'); user.updateTime = now(); saveDb(db); return ok(publicUser(user), '用户已更新')
  })

  // 23 GET /admin/resources
  mock.onGet('/admin/resources').reply((config) => {
    const db = getDb(); const admin = requireUser(config, db, ['ADMIN']); if (isReply(admin)) return admin; const query = params(config); const type = query.resourceType; let list: unknown[]
    if (type === 'PARKING_LOT') list = db.parkingLot
    else if (type === 'PARKING_SPACE') list = db.parkingSpace
    else if (type === 'BILLING_RULE') list = db.billingRule
    else if (type === 'MONTHLY_PLAN') list = db.monthlyPlan
    else if (type === 'MONTHLY_APPLICATION') list = db.monthlyApplication
    else return fail(400, 'resourceType 无效')
    if (query.parkingLotId) list = list.filter((item) => (item as { parkingLotId?: number }).parkingLotId === Number(query.parkingLotId)); if (query.status !== undefined && query.status !== '') list = list.filter((item) => (item as { status?: number }).status === Number(query.status)); const keyword = String(query.keyword ?? '').toLowerCase(); if (keyword) list = list.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword)); return ok(paginate(list, query))
  })

  // 24 POST /admin/resources/action
  mock.onPost('/admin/resources/action').reply((config) => {
    const db = getDb(); const admin = requireUser(config, db, ['ADMIN']); if (isReply(admin)) return admin; const data = body<{ resourceType: string; action: string; id?: number; payload?: Record<string, unknown> }>(config); const payload = data.payload ?? {}; let collection: { id: number; status?: number }[]
    if (data.resourceType === 'PARKING_LOT') collection = db.parkingLot
    else if (data.resourceType === 'PARKING_SPACE') collection = db.parkingSpace
    else if (data.resourceType === 'BILLING_RULE') collection = db.billingRule
    else if (data.resourceType === 'MONTHLY_PLAN') collection = db.monthlyPlan
    else if (data.resourceType === 'MONTHLY_APPLICATION') collection = db.monthlyApplication
    else return fail(400, 'resourceType 无效')
    const target = collection.find((item) => item.id === data.id)
    if (data.action === 'CREATE') {
      if (data.resourceType === 'MONTHLY_APPLICATION') return fail(400, '月租申请只能由用户创建')
      if (data.resourceType === 'BILLING_RULE' && db.billingRule.some((r) => r.parkingLotId === Number(payload.parkingLotId))) return fail(409, '一个停车场只允许一条计费规则')
      const id = nextId(collection); collection.push({ id, ...payload } as { id: number; status?: number }); if (data.resourceType === 'PARKING_SPACE') updateLotCount(db, Number(payload.parkingLotId)); saveDb(db); return ok({ success: true, message: '资源已创建', id })
    }
    if (!target) return fail(404, '资源不存在')
    if (data.action === 'UPDATE') { Object.assign(target, payload); if (data.resourceType === 'PARKING_SPACE') updateLotCount(db, Number((target as { parkingLotId: number }).parkingLotId)); saveDb(db); return ok({ success: true, message: '资源已更新', id: target.id }) }
    if (data.action === 'CHANGE_STATUS') { target.status = Number(payload.status); saveDb(db); return ok({ success: true, message: '状态已更新', id: target.id }) }
    if (data.action === 'DELETE') {
      if (data.resourceType === 'PARKING_SPACE' && (target as { status: number }).status === 2) return fail(409, '占用中的车位不能删除')
      const index = collection.indexOf(target); collection.splice(index, 1); if (data.resourceType === 'PARKING_SPACE') updateLotCount(db, Number((target as { parkingLotId: number }).parkingLotId)); saveDb(db); return ok({ success: true, message: '资源已删除', id: target.id })
    }
    if (data.action === 'AUDIT' && data.resourceType === 'MONTHLY_APPLICATION') {
      const application = target as typeof db.monthlyApplication[number]; if (application.status !== 0) return fail(409, '仅待审核申请可审核'); const approved = Number(payload.status) === 1; if (!approved && !String(payload.auditRemark ?? '').trim()) return fail(400, '审核拒绝必须填写原因')
      if (approved && db.monthlyApplication.some((item) => item.id !== application.id && item.vehicleId === application.vehicleId && item.status === 1 && application.startDate <= item.endDate && application.endDate >= item.startDate)) return fail(409, '该车辆存在时间重叠的有效月租')
      application.status = approved ? 1 : 2; application.auditUserId = admin.id; application.auditRemark = String(payload.auditRemark ?? (approved ? '审核通过' : '')); application.auditTime = now(); saveDb(db); return ok({ success: true, message: approved ? '审核通过' : '审核拒绝', id: application.id })
    }
    return fail(400, 'action 与 resourceType 不匹配')
  })
}
