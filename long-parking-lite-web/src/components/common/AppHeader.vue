<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled, SwitchButton, Location, Tickets } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/constants/routes'

const auth = useAuthStore()
const router = useRouter()
const homePath = computed(() => auth.userInfo ? ROLE_HOME[auth.userInfo.roleCode] : '/')

async function handleLogout() {
  await auth.logout()
  await router.push('/')
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="brand" :to="homePath"><span class="brand-mark">L</span><span>Long 停车</span></RouterLink>
      <nav class="public-nav">
        <RouterLink to="/parking-lots"><el-icon><Location /></el-icon>停车场</RouterLink>
        <RouterLink to="/monthly-plans"><el-icon><Tickets /></el-icon>月租套餐</RouterLink>
      </nav>
      <div v-if="auth.userInfo" class="user-actions">
        <span><el-icon><UserFilled /></el-icon>{{ auth.userInfo.nickname }}</span>
        <el-button text :icon="SwitchButton" @click="handleLogout">退出</el-button>
      </div>
      <div v-else class="user-actions">
        <el-button text @click="router.push('/login')">登录</el-button>
        <el-button type="primary" @click="router.push('/register')">注册</el-button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,.94); border-bottom: 1px solid var(--border); backdrop-filter: blur(14px); }
.header-inner { height: 66px; width: min(1180px, calc(100% - 32px)); margin: auto; display: flex; align-items: center; gap: 32px; }
.brand { display: flex; align-items: center; gap: 9px; font-weight: 800; color: var(--brand-dark); font-size: 18px; }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: white; background: linear-gradient(135deg, var(--brand), #37a68e); }
.public-nav { display: flex; gap: 22px; flex: 1; }
.public-nav a, .user-actions span { display: flex; align-items: center; gap: 6px; color: #506076; }
.router-link-active { color: var(--brand) !important; }
.user-actions { display: flex; align-items: center; gap: 6px; }
@media (max-width: 680px) { .public-nav { display: none; } .header-inner { width: calc(100% - 20px); } .user-actions span { display: none; } }
</style>
