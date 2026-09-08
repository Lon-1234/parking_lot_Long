import { request, unwrap } from './request'
import type { ActionResult } from '@/types/api'
import type { LoginRequest, LoginResult, ProfileRequest, RegisterRequest, UserInfo } from '@/types/user'

export const register = (data: RegisterRequest) => request.post('/auth/register', data).then(unwrap<ActionResult>)
export const login = (data: LoginRequest) => request.post('/auth/login', data).then(unwrap<LoginResult>)
export const logout = () => request.post('/auth/logout').then(unwrap<ActionResult>)
export const getCurrentUser = () => request.get('/auth/me').then(unwrap<UserInfo>)
export const updateProfile = (data: ProfileRequest) => request.put('/users/profile', data).then(unwrap<UserInfo>)
