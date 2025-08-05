<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import Dialog from 'primevue/dialog'
import ConfirmPopup from 'primevue/confirmpopup'
import Button from 'primevue/button'
import { ref, onMounted } from 'vue'
import { useUsers } from '@/views/admin/roles/composables/useUser'
import UserForm from './UserForm.vue'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import type { User } from '@/types/user'
import type { RowData } from '@/types/baseTable.model'

const {
  users,
  roles,
  teams,
  editingRows,
  isLoading,
  fetchInitialData,
  createUser,
  editUser,
  deleteUser,
} = useUsers()

const { validationErrors, validateField, resetValidation, isSaveDisabled } = useValidation()

const userFormDialogVisible = ref(false)
const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)
const originalUser = ref<User | null>(null)
const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
  userFormRef.value?.resetForm()
}

const handleUserFormSubmit = async (payload: User): Promise<void> => {
  const success = await createUser(payload)
  if (success) {
    userFormDialogVisible.value = false
  }
}

const handleUserFormCancel = (): void => {
  userFormDialogVisible.value = false
}

const onEdit = (row: RowData): void => {
  originalUser.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row]
}

const onSave = async (newData: RowData): Promise<void> => {
  columns.forEach((col) => {
    if (col.required) {
      validateField(col.key, newData[col.key], col.label)
    }
  })

  if (Object.keys(validationErrors.value).length > 0) return

  if (originalUser.value) {
    await editUser(newData as User, originalUser.value)
  }
  editingRows.value = []
  originalUser.value = null
  resetValidation()
}

const onCancel = (): void => {
  if (originalUser.value) {
    const index = users.value.findIndex((u) => u.id === originalUser.value!.id)
    if (index !== -1) {
      users.value[index] = originalUser.value
    }
  }
  editingRows.value = []
  originalUser.value = null
  resetValidation()
}

const handleDeleteConfirmation = (row: RowData, event?: Event): void => {
  deleteUser(row as User, event)
}

const columns = [
  { label: 'Name', key: 'name', filterable: true, required: true },
  { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
  { label: 'Email', key: 'email', filterable: true, required: true }, // Email now validated
  {
    label: 'Team',
    key: 'team',
    filterable: true,
    useTag: true,
    useMultiSelect: true,
    required: true,
  },
  {
    label: 'Role',
    key: 'role',
    filterable: true,
    useTag: true,
    filterOption: true,
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
        @submit="handleUserFormSubmit"
        @cancel="handleUserFormCancel"
      />
    </Dialog>

    <BaseTable
      :columns="columns"
      :rows="users"
      :pageSize="10"
      :editableRow="editingRows[0] as RowData"
      :statusOptions="roles"
      :multiSelectOption="teams"
      :loading="isLoading"
      @save="onSave"
      @cancel="onCancel"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="New User" icon="pi pi-plus" severity="help" @click="openCreateUserDialog" />
      </template>

      <template #actions="{ row }">
        <button
          @click="onEdit(row)"
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
