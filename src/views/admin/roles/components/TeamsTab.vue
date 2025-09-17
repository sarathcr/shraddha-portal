<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import BaseTable from '@/components/baseTable.vue'
import { useTeams } from '@/views/admin/roles/composables/useTeam'
import TeamForm from './TeamForm.vue'
import type { Team } from '@/types/team'
import type { RowData } from '@/types/baseTable.model'
import { useValidation } from '@/views/admin/roles/composables/useValidation'

const {
  teams,
  editingRows,
  fetchInitialData,
  isLoading,
  createTeam,
  editTeam,
  deleteTeam,
  totalRecords,
  pageSize,
  onLazyLoad,
} = useTeams()

const { validationErrors, validateField, resetValidation, isSaveDisabled } = useValidation()

const teamFormDialogVisible = ref(false)
watch(teamFormDialogVisible, (isVisible) => {
  if (isVisible) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
})
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
  editingRows.value = [row as Team]
}

const onSaveTeam = async (newData: RowData): Promise<void> => {
  columns.forEach((col) => {
    if (col.required) {
      validateField(col.key, newData[col.key], col.label)
    }
  })

  if (Object.keys(validationErrors.value).length > 0) return

  await editTeam(newData as Team)
  editingRows.value = []
  resetValidation()
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
}

const handleDeleteConfirmation = (row: RowData, event?: Event): void => {
  deleteTeam(row as Team, event)
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
]

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <ConfirmPopup class="mx-4" />

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

    <BaseTable
      :columns="columns"
      :rows="teams"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
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

      <template #actions="{ row }">
        <button
          @click="onEditTeam(row)"
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
      </template>
    </BaseTable>
  </div>
</template>

<style lang="scss">
.p-datatable-header {
  padding: 0 0 1rem 0 !important;
}
</style>
