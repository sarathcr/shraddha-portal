<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <Skeleton height="1.25rem" width="30%" class="mb-4" />

    <div class="overflow-x-auto">
      <table class="min-w-[30rem] w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th class="text-left text-gray-500">
              <Skeleton width="4rem" height="1rem" />
            </th>
            <th class="text-left text-gray-500">
              <Skeleton width="3rem" height="1rem" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="bg-gray-50">
            <td class="py-2">
              <Skeleton width="6rem" height="1rem" />
            </td>
            <td class="py-2">
              <Skeleton width="5rem" height="1rem" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
