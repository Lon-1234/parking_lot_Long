import type { MonthlyApplication, MonthlyPlan } from './monthly'
import type { ParkingLot, ParkingRecord } from './parking'

export interface HomeData { totalAvailableSpaces: number; totalSpaces: number; recommendedLots: ParkingLot[]; recommendedPlans: MonthlyPlan[]; monthlyApplications: MonthlyApplication[] }
export interface DashboardMetric { label: string; value: number; suffix?: string }
export interface AdminDashboard { metrics: DashboardMetric[]; entryTrend: number[]; exitTrend: number[]; revenueTrend: number[]; dateLabels: string[]; spaceStatus: { name: string; value: number }[]; recentRecords: ParkingRecord[] }
