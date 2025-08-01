<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import BaseTable from '@/components/baseTable.vue'
import { useRoles } from '@/views/admin/roles/composables/useRole'
import RoleForm from './RoleForm.vue'
import type { Role } from '@/types/role'
import type { RowData } from '@/types/baseTable.model'
import { useValidation } from '@/views/admin/roles/composables/useValidation'

const {
  roles,
  permissions,
  editingRows,
  fetchInitialData,
  isLoading,
  createRole,
  editRole,
  deleteRole,
} = useRoles()

const { validationErrors, validateField, resetValidation, isSaveDisabled } = useValidation()

const roleFormDialogVisible = ref(false)
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null)
const originalRole = ref<Role | null>(null)

const onAddNewRole = (): void => {
  roleFormDialogVisible.value = true
  roleFormRef.value?.resetForm()
}

const handleRoleFormSubmit = async (payload: Role): Promise<void> => {
  const success = await createRole(payload)
  if (success) {
    roleFormDialogVisible.value = false
  }
}

const handleRoleFormCancel = (): void => {
  roleFormDialogVisible.value = false
}

const onEditRole = (row: RowData): void => {
  originalRole.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row]
}

const onSaveRole = async (newData: RowData): Promise<void> => {
  columns.forEach((col) => {
    if (col.required) {
      validateField(col.key, newData[col.key], col.label)
    }
  })

  if (Object.keys(validationErrors.value).length > 0) return

  await editRole(newData as Role)
  editingRows.value = []
  resetValidation()
}

const onCancelEdit = (): void => {
  if (originalRole.value) {
    const index = roles.value.findIndex((r) => r.id === originalRole.value!.id)
    if (index !== -1) {
      roles.value[index] = originalRole.value
    }
  }
  editingRows.value = []
  originalRole.value = null
  resetValidation()
}

const handleDeleteConfirmation = (row: RowData, event?: Event): void => {
  deleteRole(row as Role, event)
}

const columns = [
  {
    label: 'Role Name',
    key: 'roleName',
    filterable: true,
    required: true,
  },
  {
    label: 'Description',
    key: 'description',
    filterable: true,
    required: true,
  },
  {
    label: 'Permissions',
    key: 'permissions',
    filterable: true,
    useTag: true,
    useMultiSelect: true,
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
      v-model:visible="roleFormDialogVisible"
      header="Create Role"
      :style="{ width: '50rem' }"
      modal
      @hide="handleRoleFormCancel"
      class="mx-4"
    >
      <RoleForm
        ref="roleFormRef"
        :roles="roles"
        @submit="handleRoleFormSubmit"
        @cancel="handleRoleFormCancel"
      />
    </Dialog>

    <BaseTable
      :columns="columns"
      :rows="roles"
      :pageSize="10"
      :editableRow="editingRows[0] as RowData"
      :multiSelectOption="permissions"
      :loading="isLoading"
      @save="onSaveRole"
      @cancel="onCancelEdit"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="Add New Role" icon="pi pi-plus" severity="help" @click="onAddNewRole" />
      </template>

      <template #actions="{ row }">
        <button
          @click="onEditRole(row)"
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
<style>
.p-tag {
  margin-bottom: 5px;
}
</style>
