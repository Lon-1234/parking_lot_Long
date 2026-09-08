<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>.breadcrumb { margin-bottom: 18px; }</style>
