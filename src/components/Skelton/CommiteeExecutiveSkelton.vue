<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col md:flex-row gap-3 mb-2">
      <div class="w-full md:w-1/2">
        <Skeleton height="2.5rem" class="w-full rounded-md" />
      </div>
      <div class="w-full md:w-1/2">
        <Skeleton height="2.5rem" class="w-full rounded-md" />
      </div>
    </div>
  </div>
</template>
