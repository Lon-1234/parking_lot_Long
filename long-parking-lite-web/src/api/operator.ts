import { request, unwrap } from './request'
import type { PageResult } from '@/types/api'
import type { ParkingRecord, ParkingRecordQuery, VehicleEntryRequest, VehicleEntryResult, VehicleExitRequest, VehicleExitResult } from '@/types/parking'

export const enterVehicle = (data: VehicleEntryRequest) => request.post('/operator/vehicles/entry', data).then(unwrap<VehicleEntryResult>)
export const getOperatorParkingRecords = (params: ParkingRecordQuery = {}) => request.get('/operator/parking-records', { params }).then(unwrap<PageResult<ParkingRecord>>)
export const getCurrentRecord = (plateNumber: string) => request.get(`/operator/parking-records/current/${encodeURIComponent(plateNumber)}`).then(unwrap<ParkingRecord>)
export const exitVehicle = (data: VehicleExitRequest) => request.post('/operator/vehicles/exit', data).then(unwrap<VehicleExitResult>)
