<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import BaseTable from '@/components/baseTable.vue'
import { useTeams } from '@/views/admin/roles/composables/useTeam'
import TeamForm from './TeamForm.vue'
import type { Team } from '@/types/team'
import type { RowData } from '@/types/baseTable.model'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue'
import * as yup from 'yup'
import { teamSchema } from '@/views/admin/schemas/teamSchema'
const {
  teams,
  editingRows,
  isLoading,
  statusOptions,
  createTeam,
  editTeam,
  deleteTeam,
  totalRecords,
  pageSize,
  onLazyLoad,
  onStatusToggle,
} = useTeams()

const { resetValidation, isSaveDisabled } = useValidation()

const teamFormDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const teamToDelete = ref<Team | null>(null)
const editableTeam = ref<Team | null>(null)
const toast = useToast()
watch(
  [teamFormDialogVisible, deleteDialogVisible],
  ([isTeamFormVisible, isDeleteDialogVisible]) => {
    if (isTeamFormVisible || isDeleteDialogVisible) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  },
)

const teamFormRef = ref<InstanceType<typeof TeamForm> | null>(null)
const originalTeam = ref<Team | null>(null)

const onAddNewTeam = (): void => {
  teamFormDialogVisible.value = true
  teamFormRef.value?.resetForm()
}

const handleTeamFormSubmit = async (payload: Omit<Team, 'id'>): Promise<void> => {
  const success = await createTeam(payload)
  if (success) {
    teamFormDialogVisible.value = false
  }
}

const handleTeamFormCancel = (): void => {
  teamFormDialogVisible.value = false
}

const onEditTeam = (row: RowData): void => {
  originalTeam.value = JSON.parse(JSON.stringify(row))
  editableTeam.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row as Team]
}

const onSaveTeam = async (newData: RowData): Promise<void> => {
  try {
    await teamSchema.validate(newData, { abortEarly: false })

    if (editableTeam.value) {
      newData.status = editableTeam.value.status
    }

    await editTeam(newData as Team)
    editingRows.value = []
    resetValidation()
    editableTeam.value = null
  } catch (validationError) {
    if (validationError instanceof yup.ValidationError) {
      validationError.inner.forEach((err) => {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: `${err.message}`,
          life: 5000,
        })
      })
    }
  }
}

const onCancelEdit = (): void => {
  if (originalTeam.value) {
    const index = teams.value.findIndex((t) => t.id === originalTeam.value!.id)
    if (index !== -1) {
      teams.value[index] = originalTeam.value
    }
  }
  editingRows.value = []
  originalTeam.value = null
  resetValidation()
  editableTeam.value = null
}

const handleDeleteConfirmation = (row: RowData): void => {
  teamToDelete.value = row as Team
  deleteDialogVisible.value = true
}

const onDeleteTeam = async (): Promise<void> => {
  if (teamToDelete.value) {
    const success = await deleteTeam(teamToDelete.value)
    if (success) {
      deleteDialogVisible.value = false
      teamToDelete.value = null
    }
  }
}

const columns = [
  {
    label: 'Team Name',
    key: 'teamName',
    filterable: true,
    required: true,
    backendKey: 'Name',
  },
  {
    label: 'Description',
    key: 'description',
    filterable: true,
    required: true,
  },
  {
    label: 'Status',
    key: 'isActive',
    filterable: true,
    useToggle: true,
    showFilterMatchModes: false,
    showFilterOperator: false,
    showAddButton: false,
  },
]
</script>

<template>
  <div class="space-y-4 h-full">
    <Dialog
      v-model:visible="teamFormDialogVisible"
      header="Create Team"
      :style="{ width: '50rem' }"
      modal
      @hide="handleTeamFormCancel"
      class="mx-4"
    >
      <TeamForm
        ref="teamFormRef"
        :teams="teams"
        @submit="handleTeamFormSubmit"
        @cancel="handleTeamFormCancel"
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
        <span>Are you sure you want to delete this team?</span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="onDeleteTeam" />
      </template>
    </Dialog>

    <BaseTable
      :columns="columns"
      :rows="teams"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
      :statusOptions="statusOptions"
      :loading="isLoading"
      @save="onSaveTeam"
      @cancel="onCancelEdit"
      @lazy:load="onLazyLoad"
      :paginator="true"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="Add New Team" icon="pi pi-plus" severity="help" @click="onAddNewTeam" />
      </template>
      <template #body-status="{ row }">
        <ToggleSwitch
          v-if="editingRows.includes(row)"
          :modelValue="editableTeam?.status"
          @update:modelValue="
            (newValue: boolean) => {
              if (editableTeam) editableTeam.status = newValue
            }
          "
        />
        <ToggleSwitch
          v-else
          :modelValue="row.status"
          @update:modelValue="(newValue: boolean) => onStatusToggle(row, newValue)"
        />
      </template>

      <template #actions="{ row }">
        <button
          @click="onEditTeam(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-pencil text-slate-700 text-base"></i>
        </button>
        <button
          @click="handleDeleteConfirmation(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-trash text-red-600 text-base"></i>
        </button>
      </template>
    </BaseTable>
  </div>
</template>

<style lang="scss">
.p-datatable-header {
  padding: 0 0 1rem 0 !important;
}
</style>
