import { request, unwrap } from './request'
import type { ActionResult, PageResult } from '@/types/api'
import type { AdminDashboard } from '@/types/stats'
import type { AdminUserActionRequest, AdminUserQuery, UserInfo } from '@/types/user'

export type ResourceType = 'PARKING_LOT' | 'PARKING_SPACE' | 'BILLING_RULE' | 'MONTHLY_PLAN' | 'MONTHLY_APPLICATION'
export interface ResourceQuery { resourceType: ResourceType; page?: number; pageSize?: number; keyword?: string; status?: number; parkingLotId?: number }
export interface AdminResourceActionRequest { resourceType: ResourceType; action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CHANGE_STATUS' | 'AUDIT'; id?: number; payload?: Record<string, unknown> }

export const getAdminDashboard = () => request.get('/admin/dashboard').then(unwrap<AdminDashboard>)
export const getAdminUsers = (params: AdminUserQuery = {}) => request.get('/admin/users', { params }).then(unwrap<PageResult<UserInfo>>)
export const actOnAdminUser = (data: AdminUserActionRequest) => request.post('/admin/users/action', data).then(unwrap<UserInfo>)
export const getAdminResources = <T>(params: ResourceQuery) => request.get('/admin/resources', { params }).then(unwrap<PageResult<T>>)
export const actOnAdminResource = (data: AdminResourceActionRequest) => request.post('/admin/resources/action', data).then(unwrap<ActionResult>)
