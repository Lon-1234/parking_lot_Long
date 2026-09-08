import { request, unwrap } from './request'
import type { PageResult } from '@/types/api'
import type { HomeData } from '@/types/stats'
import type { MonthlyPlan } from '@/types/monthly'
import type { ParkingLot, ParkingLotDetail, ParkingLotQuery } from '@/types/parking'

export const getHome = () => request.get('/home').then(unwrap<HomeData>)
export const getParkingLots = (params: ParkingLotQuery = {}) => request.get('/parking-lots', { params }).then(unwrap<PageResult<ParkingLot>>)
export const getParkingLotDetail = (id: number) => request.get(`/parking-lots/${id}`).then(unwrap<ParkingLotDetail>)
export const getMonthlyPlans = (params: { parkingLotId?: number; vehicleType?: string; status?: number } = {}) => request.get('/monthly-plans', { params }).then(unwrap<MonthlyPlan[]>)
