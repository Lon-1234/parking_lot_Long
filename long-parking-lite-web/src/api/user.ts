import { request, unwrap } from './request'
import type { ActionResult, PageResult } from '@/types/api'
import type { MonthlyApplicationSaveRequest, MonthlyApplicationSaveResult } from '@/types/monthly'
import type { ParkingRecord, ParkingRecordDetail, ParkingRecordQuery, Vehicle, VehicleSaveRequest } from '@/types/parking'

export const getVehicles = () => request.get('/user/vehicles').then(unwrap<Vehicle[]>)
export const saveVehicle = (data: VehicleSaveRequest) => request.post('/user/vehicles/save', data).then(unwrap<Vehicle>)
export const deleteVehicle = (id: number) => request.delete(`/user/vehicles/${id}`).then(unwrap<ActionResult>)
export const getUserParkingRecords = (params: ParkingRecordQuery = {}) => request.get('/user/parking-records', { params }).then(unwrap<PageResult<ParkingRecord>>)
export const getUserParkingRecordDetail = (id: number, action?: 'PAY') => request.get(`/user/parking-records/${id}`, { params: action ? { action } : undefined }).then(unwrap<ParkingRecordDetail>)
export const saveMonthlyApplication = (data: MonthlyApplicationSaveRequest) => request.post('/user/monthly-applications/save', data).then(unwrap<MonthlyApplicationSaveResult>)
