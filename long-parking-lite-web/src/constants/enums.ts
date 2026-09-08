import type { UserRole } from '@/types/user'

export const ROLE_LABEL: Record<UserRole, string> = { USER: '普通车主', OPERATOR: '工作人员', ADMIN: '管理员' }
export const LOT_STATUS = { 0: '停用', 1: '营业中', 2: '维护中' } as const
export const SPACE_STATUS = { 0: '停用', 1: '空闲', 2: '已占用', 3: '维护中' } as const
export const RECORD_STATUS = { 0: '停车中', 1: '待缴费', 2: '已缴费', 3: '已出场', 4: '人工放行' } as const
export const PAYMENT_STATUS = { 0: '未支付', 1: '已支付', 2: '无需支付' } as const
export const MONTHLY_STATUS = { 0: '待审核', 1: '审核通过', 2: '审核拒绝', 3: '已取消', 4: '已过期' } as const
export const VEHICLE_TYPE = { SMALL: '小型车', NEW_ENERGY: '新能源车' } as const
export const SPACE_TYPE = { NORMAL: '普通车位', NEW_ENERGY: '新能源车位', DISABLED: '无障碍车位' } as const
