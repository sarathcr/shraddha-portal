<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import { ref } from 'vue'

const columns = [
  { label: 'Committee Year', key: 'year', filterable: true },
  { label: 'Core Members', key: 'coreMembers', filterable: true },
  { label: 'Executive Members', key: 'executiveMembers', filterable: true },
  { label: 'Status', key: 'status', filterable: true },
  { label: 'Created At', key: 'createdAt', filterable: true },
]
interface RowData {
  [key: string]: unknown
}
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
  {
    year: '2023-2024',
    coreMembers: 'Aarav, Diya',
    executiveMembers: 'Kabir, Meera',
    status: 'Active',
    createdAt: '2023-06-01',
  },
  {
    year: '2022-2023',
    coreMembers: 'Rohan, Sanya',
    executiveMembers: 'Nikhil, Priya',
    status: 'Inactive',
    createdAt: '2022-05-20',
  },
  {
    year: '2021-2022',
    coreMembers: 'Ananya, Yash',
    executiveMembers: 'Tara, Arjun',
    status: 'Active',
    createdAt: '2021-07-15',
  },
  {
    year: '2020-2021',
    coreMembers: 'Ishaan, Kavya',
    executiveMembers: 'Dev, Rhea',
    status: 'Inactive',
    createdAt: '2020-04-10',
  },
  {
    year: '2019-2020',
    coreMembers: 'Reyansh, Myra',
    executiveMembers: 'Ayaan, Kiara',
    status: 'Active',
    createdAt: '2019-03-25',
  },
  {
    year: '2023-2024',
    coreMembers: 'Aarav, Diya',
    executiveMembers: 'Kabir, Meera',
    status: 'Active',
    createdAt: '2023-06-01',
  },
  {
    year: '2022-2023',
    coreMembers: 'Rohan, Sanya',
    executiveMembers: 'Nikhil, Priya',
    status: 'Inactive',
    createdAt: '2022-05-20',
  },
  {
    year: '2021-2022',
    coreMembers: 'Ananya, Yash',
    executiveMembers: 'Tara, Arjun',
    status: 'Active',
    createdAt: '2021-07-15',
  },
  {
    year: '2020-2021',
    coreMembers: 'Ishaan, Kavya',
    executiveMembers: 'Dev, Rhea',
    status: 'Inactive',
    createdAt: '2020-04-10',
  },
  {
    year: '2019-2020',
    coreMembers: 'Reyansh, Myra',
    executiveMembers: 'Ayaan, Kiara',
    status: 'Active',
    createdAt: '2019-03-25',
  },
])
const editableRow = ref<RowData | null>(null)

function onEdit(row: RowData): void {
  editableRow.value = row
}

function onSave(): void {
  editableRow.value = null
}

function onCancel(): void {
  editableRow.value = null
}
</script>

<template>
  <BaseTable
    :columns="columns"
    :rows="allRows"
    :pageSize="5"
    :editableRow="editableRow"
    @save="onSave"
    @cancel="onCancel"
  >
    <template #actions="{ row }">
      <button
        @click="onEdit(row)"
        class="p-2 rounded hover:bg-gray-200 transition"
        aria-label="Edit"
      >
        <i class="pi pi-pencil text-slate-700 text-base"></i>
      </button>
      <button class="p-2 rounded hover:bg-gray-200 transition" aria-label="Delete">
        <i class="pi pi-trash text-red-600 text-base"></i>
      </button>
    </template>
  </BaseTable>
</template>
