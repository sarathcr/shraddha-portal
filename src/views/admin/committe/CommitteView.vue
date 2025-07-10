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
    year: '2021-2022',
    coreMembers: 'Ananya, Yash',
    executiveMembers: 'Tara, Arjun',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2020-2021',
    coreMembers: 'Ishaan, Kavya',
    executiveMembers: 'Dev, Rhea',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2019-2020',
    coreMembers: 'Reyansh, Myra',
    executiveMembers: 'Ayaan, Kiara',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2018-2019',
    coreMembers: 'Aditi, Rohan',
    executiveMembers: 'Sahil, Nisha',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2017-2018',
    coreMembers: 'Manav, Shruti',
    executiveMembers: 'Kunal, Neha',
    status: 'Active',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2016-2017',
    coreMembers: 'Vivaan, Anaya',
    executiveMembers: 'Rudra, Simran',
    status: 'Inactive',
    createdAt: new Date('2025/07/08'),
  },
  {
    year: '2015-2016',
    coreMembers: 'Arnav, Diya',
    executiveMembers: 'Aryan, Meher',
    status: 'Active',
    createdAt: '2015-06-05',
  },
  {
    year: '2014-2015',
    coreMembers: 'Krishna, Avni',
    executiveMembers: 'Devansh, Ishita',
    status: 'Inactive',
    createdAt: '2014-08-22',
  },
  {
    year: '2013-2014',
    coreMembers: 'Yuvraj, Charvi',
    executiveMembers: 'Atharv, Manya',
    status: 'Active',
    createdAt: '2013-05-14',
  },
  {
    year: '2012-2013',
    coreMembers: 'Dhruv, Aadhya',
    executiveMembers: 'Shaurya, Aarohi',
    status: 'Inactive',
    createdAt: '2012-07-27',
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
  >
    <template #actions="{ row }">
      <button @click="onEdit(row)" class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
        <i class="pi pi-pencil text-slate-700 text-base"></i>
      </button>
      <button class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
        <i class="pi pi-trash text-red-600 text-base"></i>
      </button>
    </template>
  </BaseTable>
</template>
