<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import Dialog from 'primevue/dialog'
import ConfirmPopup from 'primevue/confirmpopup'
import Button from 'primevue/button'
import { ref, onMounted, computed } from 'vue'
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
  createUser,
  editUser,
  deleteUser,
  onLazyLoad,
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

const onEdit = (row: User): void => {
  originalUser.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row] as User[]
}

const onSave = async (newData: RowData): Promise<void> => {
  const userToSave = newData as User

  columns.value.forEach((col) => {
    if (col.required) {
      validateField(col.key, userToSave[col.key as keyof User], col.label)
    }
  })

  if (Object.keys(validationErrors.value).length > 0) return
  await editUser(userToSave)

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

const handleDeleteConfirmation = (row: User, event?: Event): void => {
  deleteUser(row, event)
}

const columns = computed((): ColumnDef[] => [
  { label: 'Name', key: 'name', filterable: true, required: true },
  { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
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
])

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <ConfirmPopup class="mx-4" />

    <!-- Create User Dialog -->
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

    <BaseTable
      :columns="columns"
      :rows="users"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
      :loading="isLoading"
      @save="onSave"
      @cancel="onCancel"
      @lazy:load="onLazyLoad"
      :paginator="true"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="New User" icon="pi pi-plus" severity="help" @click="openCreateUserDialog" />
      </template>

      <template #actions="{ row }">
        <button
          @click="onEdit(row as User)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-pencil text-slate-700 text-base"></i>
        </button>
        <button
          @click="handleDeleteConfirmation(row as User, $event)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-trash text-red-600 text-base"></i>
        </button>
      </template>
    </BaseTable>
  </div>
</template>
