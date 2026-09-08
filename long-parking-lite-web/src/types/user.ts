export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN'
export interface UserInfo {
  id: number; username: string; nickname: string; avatar: string; phone: string; email: string; roleCode: UserRole; status: 0 | 1
}
export interface LoginRequest { username: string; password: string }
export interface LoginResult { token: string; userInfo: UserInfo }
export interface RegisterRequest { username: string; password: string; confirmPassword: string; nickname: string; phone: string; email: string }
export interface ProfileRequest { nickname: string; avatar?: string; phone: string; email: string }
export interface AdminUserQuery { page?: number; pageSize?: number; keyword?: string; roleCode?: UserRole; status?: number }
export interface AdminUserActionRequest { action: 'CHANGE_STATUS' | 'CHANGE_ROLE'; userId: number; status?: 0 | 1; roleCode?: UserRole }
