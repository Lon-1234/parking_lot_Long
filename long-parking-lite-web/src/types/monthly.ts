import type { VehicleType } from './parking'

export interface MonthlyPlan { id: number; parkingLotId: number; parkingLotName: string; planName: string; vehicleType: VehicleType; monthCount: number; price: number; description: string; status: 0 | 1 }
export interface MonthlyApplication { id: number; applicationNo: string; userId: number; userName: string; vehicleId: number; plateNumber: string; parkingLotId: number; parkingLotName: string; planId: number; planName: string; applicationAmount: number; startDate: string; endDate: string; status: 0 | 1 | 2 | 3 | 4; auditUserId?: number; auditRemark?: string; auditTime?: string }
export interface MonthlyApplicationSaveRequest { action: 'CREATE' | 'CANCEL'; id?: number; vehicleId?: number; planId?: number; startDate?: string }
export interface MonthlyApplicationSaveResult { application?: MonthlyApplication; applications: MonthlyApplication[] }
