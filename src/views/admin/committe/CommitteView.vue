<script setup lang="ts">
import HeaderView from '@/components/HeaderView.vue'
import BaseTable from '@/shared/components/baseTable.vue'
import { ref, computed } from 'vue'
const columns = [
  { label: 'Committee Year', key: 'year', filterable: true },
  { label: 'Core Members', key: 'coreMembers', filterable: true },
  { label: 'Executive Members', key: 'executiveMembers', filterable: true },
  { label: 'Status', key: 'status', filterable: true },
  { label: 'Created At', key: 'createdAt', filterable: true },
]
const allRows = ref([
  {
    year: '2024-2025',
    coreMembers: 'Sarath, Abhinaya, Chrsito',
    executiveMembers: 'Ratheesh, Refe',
    status: 'Active',
    createdAt: '2024-07-01',
  },
  {
    year: '2023-2024',
    coreMembers: 'Karthika, Rijo',
    executiveMembers: 'Abhilash, Kichu',
    status: 'Inactive',
    createdAt: '2023-07-01',
  },
  {
    year: '2022-2023',
    coreMembers: 'Lidia, Lal',
    executiveMembers: 'Sukanaya, Sreedevi',
    status: 'Inactive',
    createdAt: '2022-07-01',
  },
])
const filters = ref<Record<string, string>>({})
const onFilterChange = (updatedFilters: Record<string, string>): void => {
  filters.value = updatedFilters
}

const filteredData = computed(() => {
  return allRows.value.filter((row) =>
    Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      return String((row as Record<string, string>)[key] ?? '')
        .toLowerCase()
        .includes(value.toLowerCase())
    }),
  )
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100">
    <HeaderView />
    <div class="p-6">
      <BaseTable
        :columns="columns"
        :rows="filteredData"
        :pageSize="5"
        @update:filters="onFilterChange"
      >
        <template #actions>
          <div class="flex items-center gap-4">
            <button class="p-2 rounded hover:bg-gray-200 transition" aria-label="Edit">
              <i class="pi pi-pencil text-slate-700 text-base"></i>
            </button>
            <button class="p-2 rounded hover:bg-gray-200 transition" aria-label="Delete">
              <i class="pi pi-trash text-red-600 text-base"></i>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
