<script setup lang="ts">
import { ProgressBar } from 'primevue'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <h2>Tournaments</h2>
    <ul class="flex flex-col gap-4">
      <li class="flex flex-col lg:flex-row items-start justify-between lg:items-center gap-2">
        <div class="lg:basis-2/3">
          <h3 class="text-black font-bold mb-1">Badminton Tournament 2025</h3>
          <p>27/06/2025 - 30/08/2025</p>
        </div>
        <div class="w-full basis-1/3">
          <ProgressBar :value="50"></ProgressBar>
        </div>
      </li>
      <li class="flex flex-col lg:flex-row items-start justify-between lg:items-center gap-2">
        <div class="basis-2/3">
          <h3 class="text-black font-bold mb-1">Badminton Tournament 2024</h3>
          <p>27/06/2024 - 30/08/2024</p>
        </div>
        <span class="font-bold text-green-600">Completed</span>
      </li>
    </ul>
  </div>
</template>
