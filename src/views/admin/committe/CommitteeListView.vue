<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import type { RowData } from '@/types/baseTable.model'
import type { Committee } from '@/types/commitee'
import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { createCommittee } from '../services/committee.services'
import CommitteeForm from './components/CommitteeForm.vue'
import { useCommittee } from './composable/useCommitte'
import { useRouter } from 'vue-router'

const {
  committee,
  isLoading,
  columns,
  allRows,
  editingRows,
  statusOptions,
  fetchInitialData,
  handleEdit,
  deleteUser,
} = useCommittee()

const toast = useToast()
const router = useRouter()
const userFormDialogVisible = ref(false)
const coreMemberOptions = ref<{ label: string; value: string }[]>([])
const executiveMemberOptions = ref<{ label: string; value: string }[]>([])
const selectedCommittee = ref<Committee | null>(null)

const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
}

const handleCommitteeFormCancel = (): void => {
  userFormDialogVisible.value = false
}

const handleEditCommittee = (row: Committee): void => {
  selectedCommittee.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row]
}
const onSave = async (newData: RowData): Promise<void> => {
  if (selectedCommittee.value) {
    const result = await handleEdit(newData as Committee, selectedCommittee.value)
    if (result && result.success) {
      editingRows.value = []
      selectedCommittee.value = null
    }
  }
}
const onCancel = (): void => {
  if (selectedCommittee.value) {
    const index = committee.value.findIndex((u) => u.id === selectedCommittee.value!.id)
    if (index !== -1) {
      committee.value[index] = selectedCommittee.value
    }
  }
  editingRows.value = []
  selectedCommittee.value = null
}
const handleDeleteConfirmation = (row: RowData, event?: Event): void => {
  deleteUser(row as Committee, event)
}
const handleUserFormSubmit = async (payload: Committee): Promise<void> => {
  try {
    const result = await createCommittee(payload)
    userFormDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Committee for year ${result.year} created successfully`,
      life: 3000,
    })
  } catch (error: unknown) {
    let errorMessage = 'An error occurred while creating the committee.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: errorMessage,
      life: 4000,
    })
  } finally {
    await fetchInitialData()
  }
}
const handleViewCommittee = async (row: { id: string }): Promise<void> => {
  await router.push(`/admin/committe/${row.id}`)
}

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <div class="h-full bg-white">
      <ConfirmPopup class="mx-4" />
      <Toast />

      <Dialog
        class="m-4"
        v-model:visible="userFormDialogVisible"
        header="Create Committee"
        :style="{ width: '50rem' }"
        modal
        @hide="handleCommitteeFormCancel"
      >
        <CommitteeForm
          :coremembers="coreMemberOptions"
          :executivemembers="executiveMemberOptions"
          @submit="handleUserFormSubmit"
          @cancel="handleCommitteeFormCancel"
        />
      </Dialog>
      <BaseTable
        :columns="columns"
        :rows="allRows"
        :pageSize="20"
        :editableRow="editingRows[0] as RowData"
        :statusOptions="statusOptions"
        :loading="isLoading"
        @save="onSave"
        @cancel="onCancel"
      >
        <template #table-header>
          <Button
            label="New Committee"
            icon="pi pi-plus"
            severity="help"
            @click="openCreateUserDialog"
          />
        </template>

        <template #actions="{ row }">
          <button
            @click="handleEditCommittee(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-pencil text-slate-700 text-base"></i>
          </button>

          <button
            @click="handleDeleteConfirmation(row, $event)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-trash text-red-600 text-base"></i>
          </button>
          <button
            @click="handleViewCommittee(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-eye text-blue-600 text-base"></i>
          </button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
