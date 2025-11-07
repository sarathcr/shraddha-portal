<script setup lang="ts">
import { Card, Skeleton } from 'primevue'
</script>

<template>
  <Card class="w-full">
    <template #title>
      <Skeleton width="100%" height="2rem" borderRadius="6px" />
    </template>
    <template #content>
      <Skeleton width="90%" height="1rem" borderRadius="6px" />
    </template>
  </Card>
</template>
