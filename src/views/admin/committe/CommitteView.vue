<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import { onMounted } from 'vue'
import { useCommittee } from './composable/useCommitte'

const {
  columns,
  allRows,
  editableRow,
  statusOptions,
  isLoading,
  fetchInitialData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
} = useCommittee()

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <div v-if="isLoading" class="flex justify-center items-center h-full">
      <p>Loading committee data...</p>
    </div>

    <div class="h-full bg-white" v-else>
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
          <button
            @click="onEdit(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
            title="Edit"
          >
            <i class="pi pi-pencil text-slate-700 text-base"></i>
          </button>
          <button
            @click="onDelete(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
            title="Delete"
          >
            <i class="pi pi-trash text-red-600 text-base"></i>
          </button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
