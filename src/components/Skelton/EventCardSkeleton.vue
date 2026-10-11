<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import { Card } from 'primevue'
</script>

<template>
  <Card class="cursor-pointer">
    <template #header>
      <Skeleton height="180px" class="rounded-t-lg w-full" />
    </template>

    <template #title>
      <Skeleton width="60%" height="18px" />
    </template>

    <template #content>
      <div class="flex flex-col gap-2">
        <Skeleton width="90%" height="14px" />
        <Skeleton width="80%" height="14px" />
        <Skeleton width="70%" height="14px" />
      </div>
    </template>

    <template #footer>
      <Skeleton width="40%" height="14px" class="ml-auto" />
    </template>
  </Card>
</template>
