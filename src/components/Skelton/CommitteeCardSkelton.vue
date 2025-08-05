<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <Skeleton width="10rem" height="1.5rem" class="mb-2" />

    <ul class="flex flex-col gap-4">
      <li
        v-for="n in 3"
        :key="n"
        class="flex flex-col lg:flex-row items-start justify-between lg:items-center gap-2"
      >
        <div class="lg:basis-2/3 w-full">
          <Skeleton width="70%" height="1.25rem" class="mb-2" />
          <Skeleton width="50%" height="1rem" />
        </div>
        <div class="w-full lg:basis-1/3">
          <Skeleton height="1.5rem" class="w-full" />
        </div>
      </li>
    </ul>
  </div>
</template>
