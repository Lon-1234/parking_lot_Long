<script setup lang="ts">
const homePath = '/'
</script>
<template><div class="page-shell"><el-result icon="info" title="404" sub-title="你访问的页面不存在或已移动"><template #extra><RouterLink :to="homePath"><el-button type="primary">返回首页</el-button></RouterLink></template></el-result></div></template>
