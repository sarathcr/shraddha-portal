<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import { ref, computed, watch, onMounted } from 'vue'
import { useUsers } from '@/views/admin/roles/composables/useUser'
import UserForm from './UserForm.vue'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import { useHistory } from '@/composables/useHistory'
import type { User } from '@/types/user'
import type { RowData, ColumnDef } from '@/types/baseTable.model'
import { userSchema } from '@/views/admin/schemas/userSchema'
import * as yup from 'yup'
import { useToast } from 'primevue'
import { isEqual } from 'lodash'
import { CommitteeRoles } from '@/constants/committeeRoles.enum'

const {
  users,
  roles,
  teams,
  editingRows,
  isLoading,
  totalRecords,
  pageSize,
  fetchInitialData,
  statusOptions,
  createUser,
  editUser,
  deleteUser,
  onLazyLoad,
  onStatusToggle,
} = useUsers()

const { resetValidation, isSaveDisabled } = useValidation()

const userFormDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const userToDelete = ref<User | null>(null)
const editableUser = ref<User | null>(null)
const originalUser = ref<User | null>(null)
const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)
const { historyDrawerVisible, historyData, loadHistory } = useHistory()

const toast = useToast()

const createRoles = ref([] as typeof roles.value)

watch(userFormDialogVisible, (isVisible) => {
  if (isVisible) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
    setTimeout(() => {
      const tabHeader = document.querySelector('.p-tablist') as HTMLElement | null
      if (tabHeader) {
        tabHeader.style.display = 'none'
        void tabHeader.offsetHeight
        tabHeader.style.display = ''
      }
    }, 50)
  }
})

const openCreateUserDialog = (): void => {
  createRoles.value = roles.value.filter((r) => !r.isCommitteeRole)

  userFormDialogVisible.value = true
  userFormRef.value?.resetForm()
}

const handleUserFormSubmit = async (payload: User): Promise<void> => {
  const success = await createUser(payload)
  if (success) userFormDialogVisible.value = false
}

const handleUserFormCancel = (): void => {
  userFormDialogVisible.value = false
}

const onEdit = (row: User): void => {
  originalUser.value = JSON.parse(JSON.stringify(row))
  editableUser.value = {
    ...row,
    teamId: row.teamId ?? null,
    roleId: row.roleId ?? null,
    isActive: row.isActive ?? null,
  }
  editingRows.value = [row]
}

const onSave = async (newData: RowData): Promise<void> => {
  if (!editableUser.value) return

  const originalDataToCompare = {
    name: originalUser.value?.name,
    employeeId: originalUser.value?.employeeId,
    dob: originalUser.value?.dob,
    email: originalUser.value?.email,
    team: teams.value.find((t) => t.value === originalUser.value?.teamId)?.label ?? null,
    role: roles.value.find((r) => r.value === originalUser.value?.roleId)?.label ?? null,
    status: originalUser.value?.isActive,
  }

  const newDataToCompare = {
    name: newData.name,
    employeeId: newData.employeeId,
    dob: newData.dob,
    email: newData.email,
    team: newData.team,
    role: newData.role,
    status: editableUser.value.isActive,
  }

  if (isEqual(originalDataToCompare, newDataToCompare)) {
    toast.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No modifications were made.',
      life: 3000,
    })
    editingRows.value = []
    editableUser.value = null
    originalUser.value = null
    resetValidation()
    return
  }

  const dataToValidate = {
    name: newData.name,
    employeeId: newData.employeeId,
    dob: newData.dob,
    email: newData.email,
    team: newData.team,
    role: newData.role,
    status: editableUser.value.isActive,
  }

  try {
    await userSchema.validate(dataToValidate, { abortEarly: false })

    const userToSave: User = {
      ...editableUser.value,
      ...newData,
      teamId: teams.value.find((t) => t.label === newData.team)?.value ?? editableUser.value.teamId,
      roleId: roles.value.find((r) => r.label === newData.role)?.value ?? editableUser.value.roleId,
      isActive: editableUser.value.isActive,
    }
    await editUser(userToSave)
  } catch (validationError) {
    if (validationError instanceof yup.ValidationError) {
      validationError.inner.forEach((err) => {
        console.error(`Validation error for ${err.path}: ${err.message}`)
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

const onCancel = (): void => {
  if (originalUser.value) {
    const index = users.value.findIndex((u) => u.id === originalUser.value!.id)
    if (index !== -1) users.value[index] = originalUser.value
  }
  editingRows.value = []
  editableUser.value = null
  originalUser.value = null
  resetValidation()
}

const handleDeleteConfirmation = (row: User): void => {
  userToDelete.value = row
  deleteDialogVisible.value = true
}

const onPerformDelete = async (): Promise<void> => {
  if (userToDelete.value) {
    const success = await deleteUser(userToDelete.value)
    if (success) {
      deleteDialogVisible.value = false
      userToDelete.value = null
    }
  }
}

const handleStatusClick = async (
  user: User | null,
  newValue: boolean,
  event: Event,
): Promise<void> => {
  if (!user) return
  event.preventDefault()

  try {
    const success = await onStatusToggle(user, newValue)
    if (success) {
      user.isActive = newValue
    }
  } catch (error) {
    console.error('Status toggle failed:', error)
  }
}

const columns = computed((): ColumnDef[] => [
  { label: 'Name', key: 'name', filterable: true, required: true },
  { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
  {
    label: 'Date of Birth',
    key: 'dob',
    filterable: true,
    required: true,
    useDateFilter: true,
    showAddButton: false,
  },
  { label: 'Email', key: 'email', filterable: true, required: true },
  {
    label: 'Team',
    key: 'team',
    filterable: true,
    filterOption: true,
    options: teams.value.map((t) => ({ label: t.label, value: t.label })),
    required: true,
    showFilterMatchModes: false,
    showFilterOperator: false,
    showAddButton: false,
  },
  {
    label: 'Role',
    key: 'role',
    filterable: true,
    filterOption: true,
    options: roles.value.map((r) => ({ label: r.label, value: r.label })),
    required: true,
    showFilterMatchModes: false,
    showFilterOperator: false,
    showAddButton: false,
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
])
const isStatusDisabled = (row: User): boolean => {
  if (!row) return false
  const roleLabel = roles.value.find((r) => r.label === row.role)?.label
  return roleLabel ? Object.values(CommitteeRoles).includes(roleLabel as CommitteeRoles) : false
}

const showHistoryDrawer = async (row: User): Promise<void> => {
  await loadHistory('user', row.id)
}

onMounted(async () => {
  await fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <Dialog
      v-model:visible="userFormDialogVisible"
      header="Create User"
      :style="{ width: '50rem' }"
      modal
      @hide="handleUserFormCancel"
    >
      <UserForm
        ref="userFormRef"
        :roles="createRoles"
        :teams="teams"
        :is-loading="isLoading"
        @submit="handleUserFormSubmit"
        @cancel="handleUserFormCancel"
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
        <span>Are you sure you want to delete this user?</span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="onPerformDelete" />
      </template>
    </Dialog>
    <BaseTable
      :columns="columns"
      :rows="users"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
      :loading="isLoading"
      :statusOptions="statusOptions"
      @save="onSave"
      @cancel="onCancel"
      @lazy:load="onLazyLoad"
      :paginator="true"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="New User" icon="pi pi-plus" severity="help" @click="openCreateUserDialog" />
      </template>

      <template #body-isActive="{ row }">
        <div
          tabindex="-1"
          v-tooltip.focus.left="
            isStatusDisabled(row) ? 'This user is under the current active committee' : ''
          "
        >
          <ToggleSwitch
            v-if="editingRows.includes(row)"
            :modelValue="editableUser?.isActive"
            @update:modelValue="
              (val: boolean) => {
                if (editableUser) editableUser.isActive = val
              }
            "
            :disabled="isStatusDisabled(row)"
          />
          <ToggleSwitch
            v-else
            :modelValue="row.isActive"
            @click.stop="(e: Event) => handleStatusClick(row, !row.isActive, e)"
            :disabled="isStatusDisabled(row)"
          />
        </div>
      </template>

      <template #actions="{ row }">
        <button
          @click="showHistoryDrawer(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-history"></i>
        </button>
        <button
          @click="onEdit(row as User)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-pencil text-slate-700 text-base"></i>
        </button>
        <button
          @click="handleDeleteConfirmation(row as User)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-trash text-red-600 text-base"></i>
        </button>
      </template>
    </BaseTable>
    <HistoryDrawer v-model:visible="historyDrawerVisible" :historyData="historyData" />
  </div>
</template>
