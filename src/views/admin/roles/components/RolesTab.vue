<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import BaseTable from '@/components/baseTable.vue'
import RoleForm from './RoleForm.vue'
import { useRoles } from '@/views/admin/roles/composables/useRole'
import type { PermissionOptions, Role } from '@/types/role'
import type { RowData } from '@/types/baseTable.model'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import ToggleSwitch from 'primevue/toggleswitch'

const {
  roles,
  editingRows,
  fetchInitialData,
  statusOptions,
  isLoading,
  createRole,
  editRole,
  deleteRole,
  onStatusToggle,
  totalRecords,
  pageSize,
  onLazyLoad,
} = useRoles()

const { validationErrors, validateField, resetValidation, isSaveDisabled } = useValidation()

const roleFormDialogVisible = ref(false)
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null)
const originalRole = ref<Role | null>(null)
const editableRole = ref<Role | null>(null)
const deleteDialogVisible = ref(false)
const roleToDelete = ref<Role | null>(null)

const permissions: PermissionOptions[] = [
  { label: 'Read', value: 'READ' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
]

watch(
  [roleFormDialogVisible, deleteDialogVisible],
  ([isRoleFormVisible, isDeleteDialogVisible]) => {
    if (isRoleFormVisible || isDeleteDialogVisible) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  },
)

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
  editableRole.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row as Role]
}

const onSaveRole = async (newData: RowData): Promise<void> => {
  columns.forEach((col) => {
    if (col.required) {
      validateField(col.key, newData[col.key], col.label)
    }
  })

  if (Object.keys(validationErrors.value).length > 0) return

  if (editableRole.value) {
    newData.isActive = editableRole.value.isActive
    // The permissions are already updated in newData.
  }

  await editRole(newData as Role)
  editingRows.value = []
  resetValidation()
  editableRole.value = null
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
  editableRole.value = null
}

const handleDeleteConfirmation = (row: RowData): void => {
  roleToDelete.value = row as Role
  deleteDialogVisible.value = true
}

const onDeleteRole = async (): Promise<void> => {
  if (roleToDelete.value) {
    const success = await deleteRole(roleToDelete.value)
    if (success) {
      deleteDialogVisible.value = false
      roleToDelete.value = null
    }
  }
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
    options: permissions,
    showFilterMatchModes: false,
    showFilterOperator: false,
  },
  {
    label: 'Status',
    key: 'isActive',
    filterable: true,
    useToggle: true,
  },
]

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <Dialog
      v-model:visible="roleFormDialogVisible"
      header="Create Role"
      :style="{ width: '50rem' }"
      modal
      @hide="handleRoleFormCancel"
      class="mx-4"
    >
      <RoleForm ref="roleFormRef" @submit="handleRoleFormSubmit" @cancel="handleRoleFormCancel" />
    </Dialog>

    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Deletion"
      :style="{ width: '30rem' }"
      modal
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-red-600 text-3xl" />
        <span>Are you sure you want to delete this role?</span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="onDeleteRole" />
      </template>
    </Dialog>

    <BaseTable
      :columns="columns"
      :rows="roles"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
      :statusOptions="statusOptions"
      :loading="isLoading"
      @save="onSaveRole"
      @cancel="onCancelEdit"
      @lazy:load="onLazyLoad"
      :paginator="true"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <Button label="Add New Role" icon="pi pi-plus" severity="help" @click="onAddNewRole" />
      </template>

      <template #body-isActive="{ row }">
        <ToggleSwitch
          v-if="editingRows.includes(row)"
          :modelValue="editableRole?.isActive"
          @update:modelValue="
            (newValue: boolean) => {
              if (editableRole) editableRole.isActive = newValue
            }
          "
        />
        <ToggleSwitch
          v-else
          :modelValue="row.isActive"
          @update:modelValue="(newValue: boolean) => onStatusToggle(row, newValue)"
        />
      </template>

      <template #actions="{ row }">
        <button
          @click="onEditRole(row)"
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
<style>
.p-tag {
  margin-bottom: 5px;
}
</style>
