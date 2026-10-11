<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import BaseTable from '@/shared/components/BaseTable.vue'
import AppButton from '@/shared/components/AppButton.vue'
import ActionButton from '@/shared/components/ActionButton.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import RoleForm from './RoleForm.vue'
import { useRoles } from '@/modules/roles/composables/useRole'
import type { Role } from '@/modules/roles/types/role.types'
import type { RowData } from '@/shared/types/baseTable.model'
import { useValidation } from '@/shared/composables/useValidation'
import ToggleSwitch from 'primevue/toggleswitch'
import { roleSchema } from '@/modules/roles/schemas/roleSchema'
import * as yup from 'yup'
import { useToast } from 'primevue/usetoast'
import isEqual from 'lodash/isEqual'
import { useHistory } from '@/shared/composables/useHistory'
import HistoryDrawer from '@/shared/components/HistoryDrawer.vue'
import DialogFooter from '@/shared/components/DialogFooter.vue'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import { useModulePermissions } from '@/shared/composables/useModulePermissions'

const MODULE_NAME: string = 'RolesAndAccess'
const {
  canCreate,
  canUpdate,
  canDelete,
  canRead: canViewHistory,
} = useModulePermissions(MODULE_NAME)

const {
  roles,
  editingRows,
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

const { resetValidation, isSaveDisabled } = useValidation()

const roleFormDialogVisible = ref(false)
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null)
const originalRole = ref<Role | null>(null)
const editableRole = ref<Role | null>(null)
const deleteDialogVisible = ref(false)
const roleToDelete = ref<Role | null>(null)
const { historyDrawerVisible, historyData, loadHistory } = useHistory()
const toast = useToast()
const permissionStore = usePermissionStore()

const dialogHeader = ref('Create Role')

const formatModulePermissions = (modulePermissions: Role['modulePermissions']): string[] => {
  if (!modulePermissions || modulePermissions.length === 0) {
    return ['No Permissions']
  }

  const map = permissionStore.moduleIdToNameMap

  return modulePermissions
    .map((mp) => {
      const moduleIdKey = String(mp.moduleId)
      const moduleName = map[moduleIdKey] || (mp as any).moduleName || `Module ID ${mp.moduleId}`
      const permissionsList = (mp.permissions || []).join(', ')
      return `${moduleName}: ${permissionsList}`
    })
    .filter((item) => item !== null)
}

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
  dialogHeader.value = 'Create Role'
  editableRole.value = null
  roleFormDialogVisible.value = true
}

const handleRoleFormSubmit = async (payload: Role): Promise<void> => {
  let success = false
  if (payload.id) {
    await editRole(payload)
    success = true
  } else {
    success = await createRole(payload)
  }
  if (success) {
    roleFormDialogVisible.value = false
  }
}

const handleRoleFormCancel = (): void => {
  roleFormDialogVisible.value = false
  editingRows.value = []
  editableRole.value = null
}

const onEditRole = (row: RowData): void => {
  if (editingRows.value.length) {
    onCancelEdit()
  }

  dialogHeader.value = `Edit Role: ${row.roleName}`
  editableRole.value = JSON.parse(JSON.stringify(row)) as Role
  roleFormDialogVisible.value = true
}

const onSaveRole = async (newData: RowData): Promise<void> => {
  if (!editableRole.value || !originalRole.value) return

  const payload: Role = {
    ...originalRole.value,
    ...(newData as Role),
    modulePermissions: originalRole.value.modulePermissions,
    isActive: editableRole.value.isActive,
  }

  const originalDataToCompare = {
    roleName: originalRole.value.roleName,
    description: originalRole.value.description,
    isActive: originalRole.value.isActive,
  }

  const newDataToCompare = {
    roleName: payload.roleName,
    description: payload.description,
    isActive: payload.isActive,
  }

  if (isEqual(originalDataToCompare, newDataToCompare)) {
    toast.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No modifications were made.',
      life: 3000,
    })
    editingRows.value = []
    editableRole.value = null
    originalRole.value = null
    resetValidation()
    return
  }

  try {
    await roleSchema.validate(payload, { abortEarly: false })
    await editRole(payload)
    editingRows.value = []
    editableRole.value = null
    originalRole.value = null
    resetValidation()
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
  if (originalRole.value) {
    const index = roles.value.findIndex((r) => r.id === originalRole.value!.id)
    if (index !== -1) {
      roles.value[index] = originalRole.value
    }
  }
  editingRows.value = []
  originalRole.value = null
  editableRole.value = null
  resetValidation()
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
  { label: 'Role Name', key: 'roleName', filterable: true, required: true },
  { label: 'Description', key: 'description', filterable: true, required: true },
  { label: 'Permissions', key: 'permissions', filterable: false, required: true },
  {
    label: 'Status',
    key: 'isActive',
    filterOption: false,
    filterable: true,
    useToggle: true,
    showFilterMatchModes: false,
    showFilterOperator: false,
    showAddButton: false,
  },
]

const showHistoryDrawer = async (row: Role): Promise<void> => {
  await loadHistory('role', row.id)
}
</script>

<template>
  <div class="space-y-4 h-full">
    <Dialog
      v-model:visible="roleFormDialogVisible"
      :header="dialogHeader"
      :style="{ width: '50rem' }"
      modal
      @hide="handleRoleFormCancel"
      class="mx-4"
    >
      <div v-if="roleFormDialogVisible" class="relative flex flex-col">
        <RoleForm
          class="flex-1 overflow-y-auto p-4 max-h-[400px]"
          ref="roleFormRef"
          :initialData="editableRole"
          @submit="handleRoleFormSubmit"
          @cancel="handleRoleFormCancel"
        />
      </div>
      <template #footer>
        <DialogFooter
          @cancel="handleRoleFormCancel"
          @submit="roleFormRef?.onSubmit && roleFormRef.onSubmit()"
        />
      </template>
    </Dialog>

    <ConfirmDialog
      v-model:visible="deleteDialogVisible"
      message="Are you sure you want to delete this role?"
      @confirm="onDeleteRole"
    />

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
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <span class="text-xs sm:text-sm font-bold text-slate-800">Security Roles</span>
            <span class="text-xs font-medium text-slate-400">({{ totalRecords }} total)</span>
          </div>
          <AppButton v-if="canCreate" label="New Role" icon="pi pi-plus" @click="onAddNewRole" />
        </div>
      </template>

      <template #body-isActive="{ row }">
        <ToggleSwitch
          v-if="canUpdate && editingRows.includes(row)"
          :modelValue="editableRole?.isActive"
          @update:modelValue="
            (newValue: boolean) => {
              if (editableRole) editableRole.isActive = newValue
            }
          "
        />
        <ToggleSwitch
          v-else-if="canUpdate"
          :modelValue="row.isActive"
          @click.stop.prevent="onStatusToggle(row as Role, !row.isActive)"
        />
        <span v-else>{{ (row as Role).isActive ? 'Active' : 'Inactive' }}</span>
      </template>

      <template #body-permissions="{ row }">
        <div
          v-for="(permissionLine, index) in formatModulePermissions(
            (row as Role).modulePermissions,
          )"
          :key="index"
          class="text-xs text-slate-700 whitespace-nowrap"
        >
          {{ permissionLine }}
        </div>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center gap-1">
          <ActionButton
            v-if="canViewHistory"
            icon="pi pi-history"
            title="View History"
            @click="showHistoryDrawer(row)"
          />
          <ActionButton
            v-if="canUpdate"
            icon="pi pi-pencil"
            title="Edit Role"
            @click="onEditRole(row)"
          />
          <ActionButton
            v-if="canDelete"
            icon="pi pi-trash"
            title="Delete Role"
            variant="danger"
            @click="handleDeleteConfirmation(row)"
          />
        </div>
      </template>
    </BaseTable>
    <HistoryDrawer v-model:visible="historyDrawerVisible" :historyData="historyData" />
  </div>
</template>
<style>
.p-tag {
  margin-bottom: 5px;
}
</style>
