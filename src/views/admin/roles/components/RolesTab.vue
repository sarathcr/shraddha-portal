<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import BaseTable from '@/components/baseTable.vue'
import RoleForm from './RoleForm.vue'
import { useRoles } from '@/views/admin/roles/composables/useRole'
import type { Role } from '@/types/role'
import type { RowData } from '@/types/baseTable.model'
import { useValidation } from '@/views/admin/roles/composables/useValidation'
import ToggleSwitch from 'primevue/toggleswitch'
import { roleSchema } from '@/views/admin/schemas/roleSchema'
import * as yup from 'yup'
import { useToast } from 'primevue/usetoast'
import { isEqual } from 'lodash'
import { useHistory } from '@/composables/useHistory'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import DialogFooter from '@/components/DialogFooter.vue'
import { fetchAvailableModules } from '@/views/auth/services/module.service'
import { useModulePermissions } from '@/composables/useModulePermissions'
import type { ModuleApiData } from '@/types/module'

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

const { resetValidation, isSaveDisabled } = useValidation()

const roleFormDialogVisible = ref(false)
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null)
const originalRole = ref<Role | null>(null)
const editableRole = ref<Role | null>(null)
const deleteDialogVisible = ref(false)
const roleToDelete = ref<Role | null>(null)
const { historyDrawerVisible, historyData, loadHistory } = useHistory()
const toast = useToast()

const moduleIdToNameMap = ref<Record<string, string>>({})
const moduleDefinitions = ref<ModuleApiData[]>([])

const dialogHeader = ref('Create Role')

const loadModuleMap = async (): Promise<void> => {
  try {
    const moduleData = (await fetchAvailableModules()) as ModuleApiData[]

    const map: Record<string, string> = {}
    moduleData.forEach((item) => {
      map[item.id] = item.module
    })
    moduleIdToNameMap.value = map
    moduleDefinitions.value = moduleData
  } catch (error) {
    console.error('Failed to load module map for roles table:', error)
  }
}

const formatModulePermissions = (modulePermissions: Role['modulePermissions']): string[] => {
  if (!modulePermissions || modulePermissions.length === 0) {
    return ['No Permissions']
  }

  const map = moduleIdToNameMap.value

  return modulePermissions
    .map((mp) => {
      const moduleIdKey = String(mp.moduleId)
      const moduleName = map[moduleIdKey] || `Module ID ${mp.moduleId}`
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

onMounted(() => {
  void fetchInitialData()
  void loadModuleMap()
})
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
      <div class="relative flex flex-col">
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
      <template #table-header v-if="canCreate">
        <Button label="New Role" icon="pi pi-plus" severity="help" @click="onAddNewRole" />
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
        <span v-else>{{ (row as Role).isActive ? 'Active' : 'Inactive' }}</span> </template
      >     
      <template #body-permissions="{ row }">
               
        <div
          v-for="(permissionLine, index) in formatModulePermissions(
            (row as Role).modulePermissions,
          )"
          :key="index"
          class="text-xs text-gray-700 whitespace-nowrap"
        >
                    {{ permissionLine }}        
        </div>
             
      </template>
      <template #actions="{ row }">
        <button
          v-if="canViewHistory"
          @click="showHistoryDrawer(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-history"></i>
        </button>
        <button
          v-if="canUpdate"
          @click="onEditRole(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-pencil text-slate-700 text-base"></i>
        </button>
        <button
          v-if="canDelete"
          @click="handleDeleteConfirmation(row)"
          class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
        >
          <i class="pi pi-trash text-red-600 text-base"></i>
        </button>
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
