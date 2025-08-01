<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps<{
  birthdayGift: { month: string; totalCelebrated: number }[]
}>()
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2>Birthday</h2>

    <div class="overflow-x-auto max-h-64 overflow-y-auto">
      <DataTable :value="birthdayGift" :rows="5" tableStyle="min-width: 30rem">
        <Column field="month" header="Month" />
        <Column field="totalCelebrated" header="Number of Birthdays celebrated" />
      </DataTable>
    </div>
  </div>
</template>
