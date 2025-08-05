<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <Skeleton height="1.25rem" width="30%" />

    <div class="h-[250px] w-full">
      <Skeleton height="100%" width="100%" />
    </div>
  </div>
</template>
