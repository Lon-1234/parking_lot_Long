import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/constants/routes'
import type { UserRole } from '@/types/user'

export interface AppRouteMeta {
  title: string
  requiresAuth?: boolean
  roles?: UserRole[]
  layout?: 'public' | 'user' | 'operator' | 'admin'
}

declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {}
}

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/public/HomeView.vue'), meta: { title: '首页', layout: 'public' } },
  { path: '/login', component: () => import('@/views/public/LoginView.vue'), meta: { title: '登录', layout: 'public' } },
  { path: '/register', component: () => import('@/views/public/RegisterView.vue'), meta: { title: '注册', layout: 'public' } },
  { path: '/parking-lots', component: () => import('@/views/public/ParkingLotsView.vue'), meta: { title: '停车场列表', layout: 'public' } },
  { path: '/parking-lot/:id', component: () => import('@/views/public/ParkingLotDetailView.vue'), meta: { title: '停车场详情', layout: 'public' } },
  { path: '/monthly-plans', component: () => import('@/views/public/MonthlyPlansView.vue'), meta: { title: '月租套餐', layout: 'public' } },
  { path: '/user/dashboard', component: () => import('@/views/user/UserDashboardView.vue'), meta: { title: '用户中心', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/vehicles', component: () => import('@/views/user/VehiclesView.vue'), meta: { title: '我的车辆', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/parking-records', component: () => import('@/views/user/UserParkingRecordsView.vue'), meta: { title: '停车记录', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/parking-record/:id', component: () => import('@/views/user/UserParkingDetailView.vue'), meta: { title: '停车详情', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/monthly-applications', component: () => import('@/views/user/MonthlyApplicationsView.vue'), meta: { title: '月租申请', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/monthly-application/create', component: () => import('@/views/user/CreateMonthlyApplicationView.vue'), meta: { title: '创建月租申请', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/user/profile', component: () => import('@/views/user/ProfileView.vue'), meta: { title: '个人资料', requiresAuth: true, roles: ['USER'], layout: 'user' } },
  { path: '/operator/dashboard', component: () => import('@/views/operator/OperatorDashboardView.vue'), meta: { title: '工作人员工作台', requiresAuth: true, roles: ['OPERATOR'], layout: 'operator' } },
  { path: '/operator/entry', component: () => import('@/views/operator/EntryView.vue'), meta: { title: '车辆入场', requiresAuth: true, roles: ['OPERATOR'], layout: 'operator' } },
  { path: '/operator/exit', component: () => import('@/views/operator/ExitView.vue'), meta: { title: '车辆出场', requiresAuth: true, roles: ['OPERATOR'], layout: 'operator' } },
  { path: '/operator/in-yard', component: () => import('@/views/operator/InYardView.vue'), meta: { title: '当前场内车辆', requiresAuth: true, roles: ['OPERATOR'], layout: 'operator' } },
  { path: '/operator/parking-records', component: () => import('@/views/operator/OperatorParkingRecordsView.vue'), meta: { title: '停车记录查询', requiresAuth: true, roles: ['OPERATOR'], layout: 'operator' } },
  { path: '/admin/login', component: () => import('@/views/admin/AdminLoginView.vue'), meta: { title: '管理员登录', layout: 'public' } },
  { path: '/admin/dashboard', component: () => import('@/views/admin/AdminDashboardView.vue'), meta: { title: '运营看板', requiresAuth: true, roles: ['ADMIN'], layout: 'admin' } },
  { path: '/admin/users', component: () => import('@/views/admin/UsersManagementView.vue'), meta: { title: '用户管理', requiresAuth: true, roles: ['ADMIN'], layout: 'admin' } },
  { path: '/admin/parking-management', component: () => import('@/views/admin/ParkingManagementView.vue'), meta: { title: '停车资源管理', requiresAuth: true, roles: ['ADMIN'], layout: 'admin' } },
  { path: '/admin/monthly-management', component: () => import('@/views/admin/MonthlyManagementView.vue'), meta: { title: '月租综合管理', requiresAuth: true, roles: ['ADMIN'], layout: 'admin' } },
  { path: '/403', component: () => import('@/views/error/ForbiddenView.vue'), meta: { title: '无权限', layout: 'public' } },
  { path: '/404', component: () => import('@/views/error/NotFoundView.vue'), meta: { title: '页面不存在', layout: 'public' } },
  { path: '/:pathMatch(.*)*', redirect: '/404', meta: { title: '页面不存在', layout: 'public' } },
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes, scrollBehavior: () => ({ top: 0 }) })

router.beforeEach((to) => {
  document.title = `${to.meta.title} - Long 轻量智慧停车`
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { path: to.meta.layout === 'admin' ? '/admin/login' : '/login', query: { redirect: to.fullPath } }
  if (to.meta.roles && !auth.hasRole(to.meta.roles)) return '/403'
  if ((to.path === '/login' || to.path === '/admin/login') && auth.userInfo) return ROLE_HOME[auth.userInfo.roleCode]
  return true
})

export default router
