<script setup lang="ts">
import BaseTable from '@/shared/components/BaseTable.vue'
import type { RowData } from '@/shared/types/baseTable.model'
import type { Committee } from '@/modules/committee/types/committee.types'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToggleSwitch from 'primevue/toggleswitch'
import { ref } from 'vue'
import CommitteeForm from '../components/CommitteeForm.vue'
import { useCommittee } from '../composables/useCommitte'
import { useRouter } from 'vue-router'
import { useValidation } from '@/shared/composables/useValidation'
import { useHistory } from '@/shared/composables/useHistory'
import HistoryDrawer from '@/shared/components/HistoryDrawer.vue'

import { useModulePermissions } from '@/shared/composables/useModulePermissions'
import DialogFooter from '@/shared/components/DialogFooter.vue'
import AppButton from '@/shared/components/AppButton.vue'
import ActionButton from '@/shared/components/ActionButton.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'

const MODULE_NAME: string = 'Committee'

const {
  canCreate,
  canUpdate,
  canDelete,
  canRead: canViewHistory,
} = useModulePermissions(MODULE_NAME)

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
const { historyDrawerVisible, historyData, loadHistory } = useHistory()
const CommitteeFormRef = ref<InstanceType<typeof CommitteeForm> | null>(null)

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

const showHistoryDrawer = async (row: Committee): Promise<void> => {
  await loadHistory('committee', row.id)
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
          ref="CommitteeFormRef"
          :coremembers="coreMemberOptions"
          :executivemembers="executiveMemberOptions"
          @cancel="handleCommitteeFormCancel"
          @submit="handleCommitteeFormSubmit"
          :committee="selectedCommittee"
        />
        <template #footer>
          <DialogFooter
            @cancel="handleCommitteeFormCancel"
            @submit="(CommitteeFormRef as any)?.onSubmit?.()"
        /></template>
      </Dialog>
      <ConfirmDialog
        v-model:visible="deleteDialogVisible"
        message="Are you sure you want to delete this committee?"
        @confirm="onPerformDelete"
      />
      <ConfirmDialog
        v-model:visible="confirmDisableDialog"
        title="Disable Active Committee"
        message="Are you sure you want to disable the currently active committee?"
        confirmLabel="OK"
        iconClass="text-yellow-500 text-3xl"
        width="25rem"
        @confirm="confirmDisable"
      />
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
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-800">Committee Directory</span>
              <span class="text-xs font-medium text-slate-400">({{ totalRecords }} total)</span>
            </div>
            <AppButton
              v-if="canCreate"
              label="New Committee"
              icon="pi pi-plus"
              @click="openCreateUserDialog"
            />
          </div>
        </template>

        <template #body-isActive="{ row }">
          <ToggleSwitch
            v-if="canUpdate"
            :modelValue="row.isActive"
            @click.stop="(e: Event) => handleStatusClick(row, !row.isActive, e)"
          />
          <span v-else><ToggleSwitch v-model="row.isActive" disabled /></span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-1">
            <ActionButton
              v-if="canViewHistory"
              icon="pi pi-history"
              title="View History"
              @click="showHistoryDrawer(row)"
            />
            <ActionButton
              v-if="canUpdate"
              icon="pi pi-pencil"
              title="Edit Committee"
              @click="handleEditCommittee(row)"
            />
            <ActionButton
              v-if="canDelete"
              icon="pi pi-trash"
              title="Delete Committee"
              variant="danger"
              @click="handleDeleteConfirmation(row as Committee)"
            />
            <ActionButton
              v-if="canViewHistory"
              icon="pi pi-eye"
              title="View Committee Details"
              @click="handleViewCommittee(row)"
            />
          </div>
        </template>
      </BaseTable>
      <HistoryDrawer v-model:visible="historyDrawerVisible" :historyData="historyData" />
    </div>
  </div>
</template>
