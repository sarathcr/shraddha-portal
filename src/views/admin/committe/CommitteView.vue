<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseTable from '@/components/baseTable.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useCommittee } from './composable/useCommitte'
import CommitteeForm from './components/CommitteeForm.vue'

const {
  columns,
  allRows,
  editableRow,
  statusOptions,
  onEdit,
  isLoading,
  onSave,
  onCancel,
  onDelete,
  fetchInitialData,
} = useCommittee()

const userFormDialogVisible = ref(false)
const coreMemberOptions = ref<{ label: string; value: string }[]>([])
const executiveMemberOptions = ref<{ label: string; value: string }[]>([])

const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
}

const handleCommitteeFormCancel = (): void => {
  userFormDialogVisible.value = false
}
const handleUserFormSubmit = async (): Promise<void> => {}

const handleUserFormCancel = (): void => {
  userFormDialogVisible.value = false
}
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
      <Dialog
        v-model:visible="userFormDialogVisible"
        header="Create Committee"
        :style="{ width: '50rem' }"
        modal
        @hide="handleCommitteeFormCancel"
      >
        <CommitteeForm
          ref="userFormRef"
          :coremembers="coreMemberOptions"
          :executivemembers="executiveMemberOptions"
          @submit="handleUserFormSubmit"
          @cancel="handleUserFormCancel"
        />
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
          <button
            @click="onEdit(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-pencil text-slate-700 text-base"></i>
          </button>
          <button
            @click="onDelete(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-trash text-red-600 text-base"></i>
          </button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
