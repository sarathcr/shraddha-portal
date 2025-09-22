<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { ref, onMounted, computed, watch } from 'vue'
import { useUsers } from '@/views/admin/roles/composables/useUser'
import UserForm from './UserForm.vue'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import type { User } from '@/types/user'
import type { RowData, ColumnDef } from '@/types/baseTable.model'
import ToggleSwitch from 'primevue/toggleswitch'

// Users composable
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

// Validation composable
const { resetValidation, isSaveDisabled } = useValidation()

// Dialog and editable user states
const userFormDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const userToDelete = ref<User | null>(null)
const editableUser = ref<User | null>(null)
const originalUser = ref<User | null>(null)

// Prevent scroll when modal is open
watch(userFormDialogVisible, (isVisible) => {
  if (isVisible) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
})

const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)

// Open create user modal
const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
  userFormRef.value?.resetForm()
}

// Handle new user submit
const handleUserFormSubmit = async (payload: User): Promise<void> => {
  const success = await createUser(payload)
  if (success) userFormDialogVisible.value = false
}

// Cancel new user
const handleUserFormCancel = (): void => {
  userFormDialogVisible.value = false
}

// Edit a user
const onEdit = (row: User): void => {
  originalUser.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row] as User[]
  editableUser.value = { ...row }
}

// Save edited user
const onSave = async (): Promise<void> => {
  const userToSave = editableUser.value
  if (!userToSave) return
  await editUser(userToSave)

  const index = users.value.findIndex((u) => u.id === userToSave.id)
  if (index !== -1) users.value[index] = { ...userToSave }

  editingRows.value = []
  editableUser.value = null
  originalUser.value = null
  resetValidation()
}

// Cancel edit
const onCancel = (): void => {
  if (originalUser.value) {
    const index = users.value.findIndex((u) => u.id === originalUser.value!.id)
    if (index !== -1) users.value[index] = originalUser.value
  }
  editingRows.value = []
  originalUser.value = null
  resetValidation()
}

// Delete user
const handleDeleteConfirmation = (row: User): void => {
  userToDelete.value = row
  deleteDialogVisible.value = true
}

const onPerformDelete = async (): Promise<void> => {
  if (userToDelete.value) {
    await deleteUser(userToDelete.value)
    deleteDialogVisible.value = false
    userToDelete.value = null
  }
}

// Columns definition
const columns = computed((): ColumnDef[] => [
  { label: 'Name', key: 'name', filterable: true, required: true },
  { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
  { label: 'Date of Birth', key: 'dob', filterable: false, required: false, useDateFilter: true },
  { label: 'Email', key: 'email', filterable: true, required: true },
  {
    label: 'Team',
    key: 'teamId',
    filterable: true,
    useTag: true,
    filterOption: true,
    options: teams.value,
    required: true,
  },
  {
    label: 'Role',
    key: 'roleId',
    filterable: true,
    useTag: true,
    filterOption: true,
    options: roles.value,
    required: true,
  },
  { label: 'Status', key: 'isActive', filterable: true, useToggle: true },
])

// Fetch initial users
onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <!-- Create/Edit User Dialog -->
    <Dialog
      v-model:visible="userFormDialogVisible"
      header="Create User"
      :style="{ width: '50rem' }"
      modal
      @hide="handleUserFormCancel"
      class="mx-4"
    >
      <UserForm
        ref="userFormRef"
        :roles="roles"
        :teams="teams"
        :is-loading="isLoading"
        @submit="handleUserFormSubmit"
        @cancel="handleUserFormCancel"
      />
    </Dialog>

    <!-- Delete Confirmation Dialog -->
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

    <!-- Users Table -->
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

      <!-- Status toggle inline edit -->
      <template #body-isActive="{ row }">
        <ToggleSwitch
          v-if="editingRows.includes(row)"
          :modelValue="editableUser?.isActive"
          @update:modelValue="
            (newValue: boolean) => {
              if (editableUser) editableUser.isActive = newValue
            }
          "
        />
        <ToggleSwitch
          v-else
          :modelValue="row.isActive"
          @update:modelValue="(newValue: boolean) => onStatusToggle(row, newValue)"
        />
      </template>

      <!-- Row actions -->
      <template #actions="{ row }">
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
  </div>
</template>
