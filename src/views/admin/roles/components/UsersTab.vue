<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import { ref, computed, watch, onMounted } from 'vue'
import { useUsers } from '@/views/admin/roles/composables/useUser'
import UserForm from './UserForm.vue'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import type { User } from '@/types/user'
import type { RowData, ColumnDef } from '@/types/baseTable.model'

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

watch(userFormDialogVisible, (isVisible) => {
  if (isVisible) document.body.classList.add('no-scroll')
  else document.body.classList.remove('no-scroll')
})

const openCreateUserDialog = (): void => {
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
    teamId: row.teamId != null ? String(row.teamId) : null,
    roleId: row.roleId != null ? String(row.roleId) : null,
  }
  editingRows.value = [row]
}

const onSave = async (newData: RowData): Promise<void> => {
  if (editableUser.value) {
    newData.isActive = editableUser.value.isActive
  }
  const userToSave = newData as User
  await editUser(userToSave)
  const index = users.value.findIndex((u) => u.id === userToSave.id)
  if (index !== -1) users.value[index] = { ...userToSave }
  editingRows.value = []
  editableUser.value = null
  originalUser.value = null
  resetValidation()
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
    await deleteUser(userToDelete.value)
    deleteDialogVisible.value = false
    userToDelete.value = null
  }
}

const columns = computed((): ColumnDef[] => [
  { label: 'Name', key: 'name', filterable: true, required: true },
  { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
  { label: 'Date of Birth', key: 'dob', filterable: false, required: true, useDateFilter: true },
  { label: 'Email', key: 'email', filterable: true, required: true },
  {
    label: 'Team',
    key: 'teamId',
    filterable: true,
    useTag: true,
    filterOption: true,
    options: teams.value.map((t) => ({ label: t.label, value: String(t.value) })),
    required: true,
  },
  {
    label: 'Role',
    key: 'roleId',
    filterable: true,
    useTag: true,
    filterOption: true,
    options: roles.value.map((r) => ({ label: r.label, value: String(r.value) })),
    required: true,
  },
  { label: 'Status', key: 'isActive', filterable: true, useToggle: true },
])

onMounted(() => {
  void fetchInitialData()
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
        <div v-if="editingRows.includes(row)" class="flex items-center gap-2">
          <ToggleSwitch
            :modelValue="editableUser?.isActive"
            @update:modelValue="
              (newValue: boolean) => {
                if (editableUser) editableUser.isActive = newValue
              }
            "
          />
        </div>

        <ToggleSwitch
          v-else
          :modelValue="row.isActive"
          @update:modelValue="(newValue: boolean) => onStatusToggle(row, newValue)"
        />
      </template>

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
