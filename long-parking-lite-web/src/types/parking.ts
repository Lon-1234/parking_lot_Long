import type { PageQuery } from './api'

export type VehicleType = 'SMALL' | 'NEW_ENERGY'
export type SpaceType = 'NORMAL' | 'NEW_ENERGY' | 'DISABLED'
export interface BillingRule { id: number; parkingLotId: number; freeMinutes: number; firstHourPrice: number; additionalHourPrice: number; dailyCapAmount: number; status: 0 | 1 }
export interface ParkingLot {
  id: number; lotName: string; lotCode: string; address: string; contactPhone: string; businessStartTime: string; businessEndTime: string; description: string; totalSpaces: number; availableSpaces: number; status: 0 | 1 | 2; temporaryPrice: number
}
export interface ParkingSpace { id: number; parkingLotId: number; spaceCode: string; spaceType: SpaceType; status: 0 | 1 | 2 | 3; currentPlateNumber: string }
export interface Vehicle { id: number; userId: number; plateNumber: string; brand: string; model: string; color: string; vehicleType: VehicleType; isDefault: boolean; status: 0 | 1; inYard?: boolean }
export interface VehicleSaveRequest { action: 'CREATE' | 'UPDATE' | 'SET_DEFAULT'; id?: number; plateNumber?: string; brand?: string; model?: string; color?: string; vehicleType?: VehicleType; status?: 0 | 1 }
export interface ParkingLotQuery extends PageQuery { name?: string; status?: number; hasAvailable?: boolean }
export interface ParkingLotDetail { lot: ParkingLot; spaces: ParkingSpace[]; spaceStats: Record<SpaceType, number>; billingRule: BillingRule; monthlyPlanIds: number[] }
export interface ParkingRecord {
  id: number; recordNo: string; userId?: number; vehicleId?: number; plateNumber: string; parkingLotId: number; parkingLotName: string; spaceId: number; spaceCode: string; entryTime: string; exitTime?: string; parkingMinutes: number; payableAmount: number; paymentStatus: 0 | 1 | 2; paymentNo?: string; payTime?: string; recordStatus: 0 | 1 | 2 | 3 | 4; monthlyVehicle: boolean; releaseReason?: string; operatorId?: number
}
export interface ParkingRecordQuery extends PageQuery { plateNumber?: string; status?: number; currentOnly?: boolean }
export interface ParkingFeeResult { parkingRecordId: number; entryTime: string; calculateTime: string; parkingMinutes: number; freeMinutes: number; payableAmount: number; monthlyVehicle: boolean; feeDescription: string }
export interface ParkingRecordDetail { record: ParkingRecord; fee: ParkingFeeResult; canPay: boolean }
export interface VehicleEntryRequest { plateNumber: string; parkingLotId: number; spaceId: number }
export interface VehicleEntryResult { parkingRecordId: number; recordNo: string; plateNumber: string; parkingLotName: string; spaceCode: string; entryTime: string; monthlyVehicle: boolean }
export interface VehicleExitRequest { parkingRecordId: number; action: 'NORMAL_EXIT' | 'MANUAL_RELEASE'; releaseReason?: string }
export interface VehicleExitResult { record: ParkingRecord; releasedSpaceCode: string }
