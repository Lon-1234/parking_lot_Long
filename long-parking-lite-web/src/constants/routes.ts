import type { UserRole } from '@/types/user'

export const ROLE_HOME: Record<UserRole, string> = { USER: '/user/dashboard', OPERATOR: '/operator/dashboard', ADMIN: '/admin/dashboard' }
