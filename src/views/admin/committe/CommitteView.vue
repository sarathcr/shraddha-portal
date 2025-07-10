<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import { ref } from 'vue'

interface RowData {
  [key: string]: unknown
}

const columns = [
  { label: 'Committee Year', key: 'year', filterable: true },
  { label: 'Core Members', key: 'coreMembers', filterable: true },
  { label: 'Executive Members', key: 'executiveMembers', filterable: true },
  {
    label: 'Status',
    key: 'status',
    filterable: true,
    filterOption: true,
    useTag: true,
  },
  { label: 'Created At', key: 'createdAt', filterable: true, useDateFilter: true },
]

const allRows = ref<RowData[]>([
  {
    year: '2024-2025',
    coreMembers: 'Sarath, Abhinaya, Chrsito',
    executiveMembers: 'Ratheesh, Refe',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2023-2024',
    coreMembers: 'Aarav, Diya',
    executiveMembers: 'Kabir, Meera',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2022-2023',
    coreMembers: 'Rohan, Sanya',
    executiveMembers: 'Nikhil, Priya',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2024-2025',
    coreMembers: 'Sarath, Abhinaya, Chrsito',
    executiveMembers: 'Ratheesh, Refe',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2023-2024',
    coreMembers: 'Aarav, Diya',
    executiveMembers: 'Kabir, Meera',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2022-2023',
    coreMembers: 'Rohan, Sanya',
    executiveMembers: 'Nikhil, Priya',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2024-2025',
    coreMembers: 'Sarath, Abhinaya, Chrsito',
    executiveMembers: 'Ratheesh, Refe',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2023-2024',
    coreMembers: 'Aarav, Diya',
    executiveMembers: 'Kabir, Meera',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2022-2023',
    coreMembers: 'Rohan, Sanya',
    executiveMembers: 'Nikhil, Priya',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
])

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

const editableRow = ref<RowData | null>(null)

const onEdit = (row: RowData): void => {
  editableRow.value = row
}

const onSave = (): void => {
  editableRow.value = null
}

const onCancel = (): void => {
  editableRow.value = null
}

const onDelete = (): void => {}
</script>

<template>
  <BaseTable
    :columns="columns"
    :rows="allRows"
    :pageSize="5"
    :editableRow="editableRow"
    :statusOptions="statusOptions"
    @save="onSave"
    @cancel="onCancel"
    @delete="onDelete"
  >
    <template #actions="{ row, onDelete }">
      <button @click="onEdit(row)" class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
        <i class="pi pi-pencil text-slate-700 text-base"></i>
      </button>
      <button @click="onDelete()" class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
        <i class="pi pi-trash text-red-600 text-base"></i>
      </button>
    </template>
  </BaseTable>
</template>
