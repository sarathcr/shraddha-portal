<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import { useCommitteeTable } from './composable/useCommitte'

const { columns, allRows, editableRow, statusOptions, onEdit, onSave, onCancel, onDelete } =
  useCommitteeTable()
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
