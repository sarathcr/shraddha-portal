<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div
    class="bg-white w-full p-4 min-h-[120px] rounded-md shadow-md hover:bg-gray-50 transition relative"
  >
    <div class="absolute top-4 right-4 p-3 rounded-md">
      <Skeleton shape="circle" size="2rem" />
    </div>

    <div class="flex flex-col justify-between h-full pr-16">
      <Skeleton height="1.25rem" width="40%" class="mb-2" />
      <Skeleton height="2rem" width="60%" class="mb-2" />
      <Skeleton height="1rem" width="50%" />
    </div>
  </div>
</template>
