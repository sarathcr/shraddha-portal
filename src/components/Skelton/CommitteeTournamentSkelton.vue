<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <Skeleton height="1.5rem" width="30%" />

    <ul class="flex flex-col gap-4">
      <li v-for="i in 3" :key="i" class="flex flex-col lg:flex-row justify-between gap-2">
        <div class="lg:basis-2/3 w-full flex flex-col gap-2">
          <Skeleton height="1rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>

        <div class="lg:basis-1/3 w-full">
          <Skeleton height="1rem" width="100%" />
        </div>
      </li>
    </ul>
  </div>
</template>
