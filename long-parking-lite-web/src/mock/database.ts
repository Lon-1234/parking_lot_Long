import { MOCK_DB_KEY } from '@/constants/storage'
import type { UserInfo } from '@/types/user'
import type { BillingRule, ParkingLot, ParkingRecord, ParkingSpace, Vehicle } from '@/types/parking'
import type { MonthlyApplication, MonthlyPlan } from '@/types/monthly'

export interface MockUser extends UserInfo { password: string; createTime: string; updateTime: string }
export interface MockDatabase {
  sysUser: MockUser[]
  userVehicle: Vehicle[]
  parkingLot: ParkingLot[]
  parkingSpace: ParkingSpace[]
  billingRule: BillingRule[]
  parkingRecord: ParkingRecord[]
  monthlyPlan: MonthlyPlan[]
  monthlyApplication: MonthlyApplication[]
}

const iso = (offsetMinutes = 0) => new Date(Date.now() + offsetMinutes * 60_000).toISOString()
const date = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)

function createInitialDatabase(): MockDatabase {
  return {
    sysUser: [
      { id: 1, username: 'user', password: '123456', nickname: '张车主', avatar: '', phone: '13800000001', email: 'user@long.test', roleCode: 'USER', status: 1, createTime: iso(-50000), updateTime: iso(-50000) },
      { id: 2, username: 'operator', password: '123456', nickname: '王工作人员', avatar: '', phone: '13800000002', email: 'operator@long.test', roleCode: 'OPERATOR', status: 1, createTime: iso(-50000), updateTime: iso(-50000) },
      { id: 3, username: 'admin', password: '123456', nickname: '李管理员', avatar: '', phone: '13800000003', email: 'admin@long.test', roleCode: 'ADMIN', status: 1, createTime: iso(-50000), updateTime: iso(-50000) },
    ],
    userVehicle: [
      { id: 1, userId: 1, plateNumber: '京A12345', brand: '大众', model: '朗逸', color: '白色', vehicleType: 'SMALL', isDefault: true, status: 1, inYard: true },
      { id: 2, userId: 1, plateNumber: '京AD6688', brand: '比亚迪', model: '海豚', color: '蓝色', vehicleType: 'NEW_ENERGY', isDefault: false, status: 1, inYard: false },
    ],
    parkingLot: [
      { id: 1, lotName: 'Long 中心停车场', lotCode: 'LONG-CENTER', address: '北京市朝阳区长安路 88 号', contactPhone: '010-80001111', businessStartTime: '00:00', businessEndTime: '23:59', description: '城市中心 24 小时轻量停车场', totalSpaces: 8, availableSpaces: 6, status: 1, temporaryPrice: 5 },
      { id: 2, lotName: 'Long 科技园停车场', lotCode: 'LONG-TECH', address: '北京市海淀区科创路 16 号', contactPhone: '010-80002222', businessStartTime: '07:00', businessEndTime: '23:00', description: '新能源车位充足，服务科技园通勤用户', totalSpaces: 6, availableSpaces: 5, status: 1, temporaryPrice: 5 },
    ],
    parkingSpace: [
      { id: 1, parkingLotId: 1, spaceCode: 'A001', spaceType: 'NORMAL', status: 2, currentPlateNumber: '京A12345' },
      { id: 2, parkingLotId: 1, spaceCode: 'A002', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 3, parkingLotId: 1, spaceCode: 'A003', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 4, parkingLotId: 1, spaceCode: 'E001', spaceType: 'NEW_ENERGY', status: 1, currentPlateNumber: '' },
      { id: 5, parkingLotId: 1, spaceCode: 'E002', spaceType: 'NEW_ENERGY', status: 1, currentPlateNumber: '' },
      { id: 6, parkingLotId: 1, spaceCode: 'D001', spaceType: 'DISABLED', status: 3, currentPlateNumber: '' },
      { id: 7, parkingLotId: 1, spaceCode: 'A004', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 8, parkingLotId: 1, spaceCode: 'A005', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 9, parkingLotId: 2, spaceCode: 'B001', spaceType: 'NORMAL', status: 2, currentPlateNumber: '沪B88888' },
      { id: 10, parkingLotId: 2, spaceCode: 'B002', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 11, parkingLotId: 2, spaceCode: 'B003', spaceType: 'NORMAL', status: 1, currentPlateNumber: '' },
      { id: 12, parkingLotId: 2, spaceCode: 'N001', spaceType: 'NEW_ENERGY', status: 1, currentPlateNumber: '' },
      { id: 13, parkingLotId: 2, spaceCode: 'N002', spaceType: 'NEW_ENERGY', status: 1, currentPlateNumber: '' },
      { id: 14, parkingLotId: 2, spaceCode: 'N003', spaceType: 'NEW_ENERGY', status: 1, currentPlateNumber: '' },
    ],
    billingRule: [
      { id: 1, parkingLotId: 1, freeMinutes: 30, firstHourPrice: 5, additionalHourPrice: 3, dailyCapAmount: 30, status: 1 },
      { id: 2, parkingLotId: 2, freeMinutes: 30, firstHourPrice: 5, additionalHourPrice: 3, dailyCapAmount: 30, status: 1 },
    ],
    parkingRecord: [
      { id: 1, recordNo: 'PR202607180001', userId: 1, vehicleId: 1, plateNumber: '京A12345', parkingLotId: 1, parkingLotName: 'Long 中心停车场', spaceId: 1, spaceCode: 'A001', entryTime: iso(-92), parkingMinutes: 92, payableAmount: 8, paymentStatus: 0, recordStatus: 1, monthlyVehicle: false, operatorId: 2 },
      { id: 2, recordNo: 'PR202607160002', userId: 1, vehicleId: 2, plateNumber: '京AD6688', parkingLotId: 1, parkingLotName: 'Long 中心停车场', spaceId: 4, spaceCode: 'E001', entryTime: iso(-3200), exitTime: iso(-3100), parkingMinutes: 100, payableAmount: 0, paymentStatus: 2, recordStatus: 3, monthlyVehicle: true, operatorId: 2 },
      { id: 3, recordNo: 'PR202607180003', plateNumber: '沪B88888', parkingLotId: 2, parkingLotName: 'Long 科技园停车场', spaceId: 9, spaceCode: 'B001', entryTime: iso(-18), parkingMinutes: 18, payableAmount: 0, paymentStatus: 0, recordStatus: 0, monthlyVehicle: false, operatorId: 2 },
    ],
    monthlyPlan: [
      { id: 1, parkingLotId: 1, parkingLotName: 'Long 中心停车场', planName: '小型车月享套餐', vehicleType: 'SMALL', monthCount: 1, price: 399, description: '一个月不限次进出', status: 1 },
      { id: 2, parkingLotId: 1, parkingLotName: 'Long 中心停车场', planName: '新能源季享套餐', vehicleType: 'NEW_ENERGY', monthCount: 3, price: 999, description: '三个月新能源车位通行', status: 1 },
      { id: 3, parkingLotId: 2, parkingLotName: 'Long 科技园停车场', planName: '园区通勤月卡', vehicleType: 'SMALL', monthCount: 1, price: 299, description: '适合园区工作日通勤', status: 1 },
    ],
    monthlyApplication: [
      { id: 1, applicationNo: 'MA202607010001', userId: 1, userName: '张车主', vehicleId: 2, plateNumber: '京AD6688', parkingLotId: 1, parkingLotName: 'Long 中心停车场', planId: 2, planName: '新能源季享套餐', applicationAmount: 999, startDate: date(-15), endDate: date(75), status: 1, auditUserId: 3, auditRemark: '资料完整，审核通过', auditTime: iso(-21000) },
      { id: 2, applicationNo: 'MA202607180002', userId: 1, userName: '张车主', vehicleId: 1, plateNumber: '京A12345', parkingLotId: 2, parkingLotName: 'Long 科技园停车场', planId: 3, planName: '园区通勤月卡', applicationAmount: 299, startDate: date(5), endDate: date(35), status: 0 },
    ],
  }
}

function isDatabase(value: unknown): value is MockDatabase {
  if (!value || typeof value !== 'object') return false
  const db = value as Partial<MockDatabase>
  return [db.sysUser, db.userVehicle, db.parkingLot, db.parkingSpace, db.billingRule, db.parkingRecord, db.monthlyPlan, db.monthlyApplication].every(Array.isArray)
}

export function getDb(): MockDatabase {
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isDatabase(parsed)) return parsed
    }
  } catch { /* fallback below */ }
  const db = createInitialDatabase()
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db))
  return db
}

export function saveDb(db: MockDatabase) { localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db)) }
export function resetMockDatabase() { localStorage.setItem(MOCK_DB_KEY, JSON.stringify(createInitialDatabase())) }
export function nextId(items: { id: number }[]) { return Math.max(0, ...items.map((item) => item.id)) + 1 }
