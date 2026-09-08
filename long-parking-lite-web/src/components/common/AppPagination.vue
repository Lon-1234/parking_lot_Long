<script setup lang="ts">
defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ change: [page: number, pageSize: number] }>()
</script>

<template>
  <div v-if="total > 0" class="pagination">
    <el-pagination background layout="total, sizes, prev, pager, next" :current-page="page" :page-size="pageSize" :page-sizes="[5,10,20]" :total="total" @current-change="emit('change', $event, pageSize)" @size-change="emit('change', 1, $event)" />
  </div>
</template>

<style scoped>.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }</style>
