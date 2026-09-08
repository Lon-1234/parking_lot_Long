<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Place, Van, Wallet, CircleCheck } from '@element-plus/icons-vue'
import { getHome } from '@/api/public'
import type { HomeData } from '@/types/stats'
import ParkingLotCard from '@/components/parking/ParkingLotCard.vue'
import MonthlyPlanCard from '@/components/monthly/MonthlyPlanCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const router = useRouter(); const keyword = ref(''); const data = ref<HomeData>(); const loading = ref(true); const error = ref('')
async function load() { loading.value = true; error.value = ''; try { data.value = await getHome() } catch (e) { error.value = e instanceof Error ? e.message : '首页数据加载失败' } finally { loading.value = false } }
function search() { void router.push({ path: '/parking-lots', query: keyword.value ? { name: keyword.value } : {} }) }
onMounted(load)
</script>

<template>
  <div>
    <section class="hero"><div class="hero__content"><span class="eyebrow">LIGHTWEIGHT PARKING</span><h1>让每一次停车，<br><em>轻一点、快一点</em></h1><p>聚合空闲车位、停车缴费与月租申请，为车主和停车场提供清晰简单的数字化体验。</p><div class="hero__search"><el-input v-model="keyword" size="large" placeholder="搜索停车场名称或地址" :prefix-icon="Search" @keyup.enter="search" /><el-button size="large" type="primary" @click="search">查找车位</el-button></div></div><div class="hero__visual"><div class="visual-card"><el-icon :size="42"><Place /></el-icon><span>全平台空闲车位</span><strong>{{ data?.totalAvailableSpaces ?? '--' }}</strong><small>共 {{ data?.totalSpaces ?? '--' }} 个车位</small></div></div></section>
    <AppLoading v-if="loading" /><AppError v-else-if="error" :message="error" @retry="load" />
    <template v-else-if="data">
      <section class="page-shell"><div class="section-head"><div><span class="eyebrow">PARKING LOTS</span><h2>推荐停车场</h2></div><RouterLink to="/parking-lots">查看全部 →</RouterLink></div><div class="card-grid"><ParkingLotCard v-for="lot in data.recommendedLots" :key="lot.id" :lot="lot" /></div></section>
      <section class="feature-strip"><div class="page-shell feature-grid"><div><el-icon><Van /></el-icon><strong>便捷入场</strong><span>工作人员快速分配空闲车位</span></div><div><el-icon><Wallet /></el-icon><strong>透明计费</strong><span>费用明细清楚，支付状态可追踪</span></div><div><el-icon><CircleCheck /></el-icon><strong>月租通行</strong><span>审核通过后即刻成为有效月租</span></div></div></section>
      <section class="page-shell"><div class="section-head"><div><span class="eyebrow">MONTHLY PLANS</span><h2>月租套餐推荐</h2></div><RouterLink to="/monthly-plans">更多套餐 →</RouterLink></div><div class="card-grid"><MonthlyPlanCard v-for="plan in data.recommendedPlans" :key="plan.id" :plan="plan" /></div></section>
      <section class="page-shell flow"><div><span class="eyebrow">HOW IT WORKS</span><h2>三步完成一次停车</h2><p>流程经过简化，界面只呈现你真正需要处理的内容。</p></div><ol><li><b>01</b><span>工作人员登记车牌并分配空闲车位</span></li><li><b>02</b><span>离场前查看费用，临时车辆完成模拟支付</span></li><li><b>03</b><span>工作人员确认出场，系统自动释放车位</span></li></ol></section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.hero{min-height:520px;padding:70px max(32px,calc((100vw - 1180px)/2));display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:50px;background:radial-gradient(circle at 80% 20%,#c7ebe1,transparent 28%),linear-gradient(135deg,#edf8f5,#f8fafc)}h1{margin:12px 0 20px;font-size:52px;line-height:1.12;color:#142c38}h1 em{font-style:normal;color:var(--brand)}.hero p{max-width:650px;color:#637287;line-height:1.8}.eyebrow{font-size:12px;letter-spacing:2px;color:var(--brand);font-weight:700}.hero__search{display:flex;gap:10px;max-width:600px;margin-top:30px}.visual-card{width:270px;margin:auto;padding:34px;display:flex;flex-direction:column;align-items:center;border:1px solid rgba(255,255,255,.8);border-radius:28px;background:rgba(255,255,255,.74);box-shadow:0 25px 70px rgba(24,85,73,.15);backdrop-filter:blur(16px)}.visual-card .el-icon{color:var(--brand)}.visual-card span{margin-top:15px;color:var(--muted)}.visual-card strong{font-size:64px;color:#163e43}.visual-card small{color:#78908b}.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.section-head h2,.flow h2{margin:6px 0 0;font-size:30px}.section-head a{color:var(--brand);font-weight:600}.feature-strip{background:#173e43;color:white}.feature-strip .page-shell{padding-top:34px;padding-bottom:34px}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}.feature-grid div{display:grid;grid-template-columns:auto 1fr;column-gap:13px}.feature-grid .el-icon{grid-row:1/3;padding:12px;box-sizing:content-box;border-radius:12px;background:#286159}.feature-grid span{color:#abc8c3;font-size:13px}.flow{display:grid;grid-template-columns:.8fr 1.2fr;gap:50px}.flow ol{list-style:none;margin:0;padding:0;display:grid;gap:12px}.flow li{display:flex;align-items:center;gap:18px;padding:17px;background:white;border:1px solid var(--border);border-radius:12px}.flow li b{color:var(--accent)}@media(max-width:760px){.hero{min-height:auto;padding:45px 20px;display:block}h1{font-size:36px}.hero__visual{display:none}.feature-grid,.flow{grid-template-columns:1fr}.hero__search{flex-direction:column}}
</style>
