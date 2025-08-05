<script setup lang="ts">
import type { Tournament } from '@/types/commitee'
import ProgressBar from 'primevue/progressbar'

defineProps<{
  tournaments: Tournament[]
}>()

const calculateProgress = (start: string, end: string): number => {
  const now = new Date()
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (now >= endDate) return 100
  if (now <= startDate) return 0

  const total = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()

  return Math.min(100, Math.floor((elapsed / total) * 100))
}
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <h2 class="text-xl font-semibold">Tournaments</h2>
    <ul class="flex flex-col gap-4">
      <li
        v-for="(tournament, index) in tournaments"
        :key="index"
        class="flex flex-col lg:flex-row items-start justify-between lg:items-center gap-2"
      >
        <div class="lg:basis-2/3">
          <h3 class="text-black font-bold mb-1">{{ tournament.name }}</h3>
          <p>{{ tournament.startDate }} - {{ tournament.endDate }}</p>
        </div>
        <div class="w-full lg:basis-1/3">
          <template v-if="new Date(tournament.endDate) < new Date()">
            <span class="font-bold text-green-600">Completed</span>
          </template>
          <template v-else>
            <ProgressBar :value="calculateProgress(tournament.startDate, tournament.endDate)" />
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>
