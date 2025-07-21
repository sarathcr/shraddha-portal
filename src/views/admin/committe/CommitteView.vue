<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseTable from '@/components/baseTable.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useCommittee } from './composable/useCommitte'

const {
  columns,
  allRows,
  editableRow,
  statusOptions,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  fetchInitialData,
} = useCommittee()

const userFormDialogVisible = ref(false)

const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
}

const handleCommitteeFormCancel = (): void => {
  userFormDialogVisible.value = false
}

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <Dialog
    v-model:visible="userFormDialogVisible"
    header="Create Committee"
    :style="{ width: '50rem' }"
    modal
    @hide="handleCommitteeFormCancel"
  >
  </Dialog>

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
    <template #table-header>
      <Button
        label="New Committee"
        icon="pi pi-plus"
        severity="help"
        @click="openCreateUserDialog"
      />
    </template>

    <template #actions="{ row, onDelete }">
      <button @click="onEdit(row)" class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
        <i class="pi pi-pencil text-slate-700 text-base"></i>
      </button>
      <button
        @click="onDelete(row)"
        class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
      >
        >
        <i class="pi pi-trash text-red-600 text-base"></i>
      </button>
    </template>
  </BaseTable>
</template>
