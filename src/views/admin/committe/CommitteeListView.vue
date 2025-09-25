<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import type { RowData } from '@/types/baseTable.model'
import type { Committee } from '@/types/commitee'
import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToggleSwitch from 'primevue/toggleswitch'
import { ref, onMounted } from 'vue'
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
} = useCommittee()

const { isSaveDisabled } = useValidation()
const router = useRouter()

const userFormDialogVisible = ref(false)
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
            @update:modelValue="(newValue: boolean) => onStatusToggle(row, newValue)"
          />
        </template>
        <template #actions="{ row }">
          <button
            @click="handleEditCommittee(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-pencil text-slate-700 text-base"></i>
          </button>

          <button class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
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
