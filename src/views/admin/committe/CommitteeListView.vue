<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import type { RowData } from '@/types/baseTable.model'
import type { Committee } from '@/types/commitee'
import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToggleSwitch from 'primevue/toggleswitch'
import { ref } from 'vue'
import CommitteeForm from './components/CommitteeForm.vue'
import { useCommittee } from './composable/useCommitte'
import { useRouter } from 'vue-router'
import { useValidation } from '../roles/composables/useValidation'

const {
  isLoading,
  columns,
  allRows,
  editingRows,
  statusOptions,
  fetchInitialData,
  totalRecords,
  pageSize,
  onLazyLoad,
  onStatusToggle,
  handleDelete,
} = useCommittee()

const { isSaveDisabled } = useValidation()
const router = useRouter()

const userFormDialogVisible = ref(false)
const committeeToDelete = ref<Committee | null>(null)
const deleteDialogVisible = ref(false)
const confirmDisableDialog = ref(false)
const committeeToDisable = ref<Committee | null>(null)

const formMode = ref<'create' | 'edit'>('create')
const coreMemberOptions = ref<{ label: string; value: string }[]>([])
const executiveMemberOptions = ref<{ label: string; value: string }[]>([])
const selectedCommittee = ref<Committee | null>(null)

const openCreateUserDialog = (): void => {
  formMode.value = 'create'
  selectedCommittee.value = null
  userFormDialogVisible.value = true
}

const handleEditCommittee = (row: Committee): void => {
  formMode.value = 'edit'
  selectedCommittee.value = JSON.parse(JSON.stringify(row))
  userFormDialogVisible.value = true
}

const handleCommitteeFormSubmit = async (): Promise<void> => {
  userFormDialogVisible.value = false
  await fetchInitialData()
}

const handleCommitteeFormCancel = (): void => {
  userFormDialogVisible.value = false
}

const handleViewCommittee = async (row: { id: string }): Promise<void> => {
  await router.push(`/admin/committe/${row.id}`)
}

const handleDeleteConfirmation = (row: Committee): void => {
  committeeToDelete.value = row
  deleteDialogVisible.value = true
}

const onPerformDelete = async (): Promise<void> => {
  if (committeeToDelete.value) {
    await handleDelete(committeeToDelete.value.id)
    deleteDialogVisible.value = false
    committeeToDelete.value = null
  }
}

const handleStatusClick = async (
  committee: Committee | null,
  newValue: boolean,
  event: Event,
): Promise<void> => {
  if (!committee) return
  event.preventDefault()
  if (committee.isActive && !newValue) {
    committeeToDisable.value = committee
    confirmDisableDialog.value = true
    return
  }
  try {
    const success = await onStatusToggle(committee, newValue)
    if (success) {
      committee.isActive = newValue
    }
  } catch (error) {
    console.error('Status toggle failed:', error)
  }
}

const confirmDisable = async (): Promise<void> => {
  if (committeeToDisable.value) {
    const success = await onStatusToggle(committeeToDisable.value, false)
    if (success) {
      await fetchInitialData()
    }
  }
  confirmDisableDialog.value = false
  committeeToDisable.value = null
}
</script>

<template>
  <div class="space-y-4 h-full">
    <div class="h-full bg-white">
      <ConfirmPopup class="mx-4" />
      <Toast />
      <Dialog
        class="m-4"
        v-model:visible="userFormDialogVisible"
        :header="formMode === 'create' ? 'Create Committee' : 'Edit Committee'"
        :style="{ width: '50rem' }"
        modal
        @hide="handleCommitteeFormCancel"
      >
        <CommitteeForm
          :coremembers="coreMemberOptions"
          :executivemembers="executiveMemberOptions"
          @cancel="handleCommitteeFormCancel"
          @submit="handleCommitteeFormSubmit"
          :committee="selectedCommittee"
        />
      </Dialog>
      <Dialog
        v-model:visible="deleteDialogVisible"
        header="Confirm Deletion"
        :style="{ width: '30rem' }"
        modal
      >
        <div class="flex items-center gap-4">
          <i class="pi pi-exclamation-triangle text-red-600 text-3xl" />
          <span>Are you sure you want to delete this committee?</span>
        </div>
        <template #footer>
          <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
          <Button label="Delete" severity="danger" @click="onPerformDelete" />
        </template>
      </Dialog>
      <Dialog
        v-model:visible="confirmDisableDialog"
        header="Disable Active Committee"
        :style="{ width: '25rem' }"
        modal
      >
        <div class="space-y-3 flex gap-6 items-center">
          <i class="pi pi-exclamation-triangle text-yellow-500"></i>
          <p>Are you sure you want to disable the currently active committee?</p>
        </div>
        <template #footer>
          <Button label="Cancel" severity="secondary" @click="confirmDisableDialog = false" />
          <Button label="OK" severity="danger" @click="confirmDisable" />
        </template>
      </Dialog>
      <BaseTable
        :columns="columns"
        :rows="allRows"
        :totalRecords="totalRecords"
        :rowsPerPage="pageSize"
        :editableRow="editingRows[0] as RowData"
        :statusOptions="statusOptions"
        :loading="isLoading"
        @lazy:load="onLazyLoad"
        :paginator="true"
        :saveDisabled="isSaveDisabled"
      >
        <template #table-header>
          <Button
            label="New Committee"
            icon="pi pi-plus"
            severity="help"
            @click="openCreateUserDialog"
          />
        </template>

        <template #body-isActive="{ row }">
          <ToggleSwitch
            :modelValue="row.isActive"
            @click.stop="(e: Event) => handleStatusClick(row, !row.isActive, e)"
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
            @click="handleDeleteConfirmation(row as Committee)"
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
