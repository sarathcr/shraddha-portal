<script setup lang="ts">
import { Card, Skeleton } from 'primevue'
</script>

<template>
  <Card class="w-full">
    <template #title>
      <Skeleton width="70%" height="1.2rem" borderRadius="6px" />
    </template>
    <template #content>
      <Skeleton width="90%" height="0.9rem" class="mb-2" borderRadius="6px" />
      <Skeleton width="60%" height="0.9rem" borderRadius="6px" />
    </template>
  </Card>
</template>

<style scoped>
.p-card {
  min-height: 120px;
}
</style>
