<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { use } from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import { init } from 'echarts/core'

use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
const props = withDefaults(defineProps<{ option: EChartsCoreOption; height?: string }>(), { height: '320px' })
const root = ref<HTMLDivElement>()
let chart: EChartsType | undefined
let observer: ResizeObserver | undefined

function render() { if (chart) chart.setOption(props.option, { notMerge: true }) }
onMounted(async () => {
  await nextTick()
  if (!root.value) return
  chart = init(root.value)
  render()
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(root.value)
})
watch(() => props.option, render, { deep: true })
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose(); chart = undefined })
</script>
<template><div ref="root" class="chart" :style="{ height }" /></template>
<style scoped>.chart { width: 100%; min-height: 240px; }</style>
