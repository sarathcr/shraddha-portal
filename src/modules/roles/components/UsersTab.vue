<script setup lang="ts">
import BaseTable from '@/shared/components/BaseTable.vue'
import HistoryDrawer from '@/shared/components/HistoryDrawer.vue'
import Dialog from 'primevue/dialog'
import AppButton from '@/shared/components/AppButton.vue'
import ActionButton from '@/shared/components/ActionButton.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { ref, computed, watch } from 'vue'
import { useUsers } from '@/modules/roles/composables/useUser'
import UserForm from './UserForm.vue'
import { useValidation } from '@/shared/composables/useValidation'
import { useHistory } from '@/shared/composables/useHistory'
import type { User, UserRole, OptionItem } from '@/modules/roles/types/user.types'
import type { RowData } from '@/shared/types/baseTable.model'
import { userSchema } from '@/modules/roles/schemas/userSchema'
import * as yup from 'yup'
import sortBy from 'lodash/sortBy'
import DialogFooter from '@/shared/components/DialogFooter.vue'
import { useModulePermissions } from '@/shared/composables/useModulePermissions'
import { useUserColumns } from '../composables/useUserColumns'
import { hasUserChanges, buildUserPayload } from '../utils/userHelpers'

const MODULE_NAME: string = 'RolesAndAccess'

const {
  canCreate,
  canUpdate,
  canDelete,
  canRead: canViewHistory,
} = useModulePermissions(MODULE_NAME)

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

const createRoles = ref<OptionItem[]>([])

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

const ensureLookupsLoaded = async (): Promise<void> => {
  if (roles.value.length === 0 || teams.value.length === 0) {
    await fetchInitialData()
  }
}

const openCreateUserDialog = async (): Promise<void> => {
  await ensureLookupsLoaded()
  createRoles.value = roles.value.filter((r: OptionItem) => !r.isCommitteeRole)

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

const onEdit = async (row: User): Promise<void> => {
  await ensureLookupsLoaded()
  originalUser.value = JSON.parse(JSON.stringify(row))

  const selectedRoleIds =
    row.roles && Array.isArray(row.roles)
      ? row.roles.map((r: any) => (typeof r === 'string' ? r : r.roleId || r.id))
      : []

  editableUser.value = {
    ...row,
    teamId: row.teamId ?? undefined,
    roleId: row.roleId ?? undefined,
    roles: selectedRoleIds,
    isActive: row.isActive ?? true,
  }
  editingRows.value = [row]
}

const onSave = async (newData: RowData): Promise<void> => {
  if (!editableUser.value) return
  const newRoleIds = Array.isArray(newData.roles) ? sortBy(newData.roles) : []
  const originalTeamName =
    teams.value.find((t) => t.value === originalUser.value?.teamId)?.label ?? null

  if (
    !hasUserChanges(
      originalUser.value,
      newData,
      originalTeamName,
      newRoleIds,
      editableUser.value.isActive,
    )
  ) {
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
    roles: Array.isArray(newData.roles)
      ? newData.roles
          .map((id: string) => roles.value.find((r: any) => r.value === id)?.label ?? '')
          .join(', ')
      : '',
    status: editableUser.value.isActive,
  }

  try {
    await userSchema.validate(dataToValidate, { abortEarly: false })

    const teamId = teams.value.find((t) => t.label === newData.team)?.value
    const userToSave = buildUserPayload(editableUser.value, newData, newRoleIds, teamId)
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

const { columns, isStatusDisabled } = useUserColumns(teams, roles)

const showHistoryDrawer = async (row: User): Promise<void> => {
  await loadHistory('user', row.id)
}

const normalUserRoleId = computed((): string | null => {
  return roles.value.find((r) => r.label === 'Normal User')?.value ?? null
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
      <div class="relative flex flex-col">
        <UserForm
          class="flex-1 overflow-y-auto p-4"
          ref="userFormRef"
          :roles="createRoles"
          :teams="teams"
          :is-loading="isLoading"
          @submit="handleUserFormSubmit"
          @cancel="handleUserFormCancel"
        />
        <DialogFooter
          @cancel="handleUserFormCancel"
          @submit="userFormRef?.onSubmit && userFormRef.onSubmit()"
        />
      </div>
    </Dialog>
    <ConfirmDialog
      v-model:visible="deleteDialogVisible"
      message="Are you sure you want to delete this user?"
      @confirm="onPerformDelete"
    />
    <BaseTable
      :columns="columns"
      :rows="users"
      :totalRecords="totalRecords"
      :rowsPerPage="pageSize"
      :editableRow="editingRows[0] as RowData"
      :loading="isLoading"
      :statusOptions="statusOptions"
      :unremovableRoleId="normalUserRoleId"
      @save="onSave"
      @cancel="onCancel"
      @lazy:load="onLazyLoad"
      :paginator="true"
      :saveDisabled="isSaveDisabled"
    >
      <template #table-header>
        <div class="flex items-center justify-between gap-2.5 w-full flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-2">
            <span class="text-xs sm:text-sm font-bold text-slate-800">User Accounts</span>
            <span class="text-xs font-medium text-slate-400">({{ totalRecords }} total)</span>
          </div>
          <AppButton
            v-if="canCreate"
            label="New User"
            icon="pi pi-plus"
            @click="openCreateUserDialog"
          />
        </div>
      </template>
      <template #body-name="{ row }">
        <div class="flex items-center gap-3">
          <div
            class="size-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
          >
            {{ row.name ? row.name.slice(0, 2).toUpperCase() : 'U' }}
          </div>
          <div class="flex flex-col">
            <span class="text-xs sm:text-sm font-semibold text-slate-800">{{ row.name }}</span>
            <span class="text-[11px] text-slate-400 font-mono">{{ row.employeeId }}</span>
          </div>
        </div>
      </template>
      <template #body-email="{ row }">
        <span class="text-xs text-slate-600 flex items-center gap-1.5 truncate">
          <i class="pi pi-envelope text-[11px] text-slate-400"></i>
          {{ row.email }}
        </span>
      </template>
      <template #body-team="{ row }">
        <span
          v-if="row.team"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50/80 text-indigo-700 border border-indigo-200/60"
        >
          <span class="size-1.5 rounded-full bg-indigo-500"></span>
          {{ row.team }}
        </span>
        <span v-else class="text-xs text-slate-400 italic">Unassigned</span>
      </template>
      <template #body-roles="{ row }">
        <div v-if="row.roles && row.roles.length" class="flex flex-wrap gap-1.5">
          <Tag
            v-for="role in row.roles.length === 1
              ? row.roles
              : row.roles.filter((r: UserRole) => r.role !== 'Normal User')"
            :key="role.roleId"
            :value="role.role"
            :severity="
              role.role === 'Admin' || role.role === 'AdminHR'
                ? 'info'
                : role.role === 'Normal User'
                  ? 'secondary'
                  : 'warn'
            "
            class="!text-[11px] !py-0.5 !px-2 font-semibold"
          />
        </div>
        <div v-else class="text-xs text-slate-400">N/A</div>
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
            title="Edit User"
            @click="onEdit(row as User)"
          />
          <ActionButton
            v-if="canDelete"
            icon="pi pi-trash"
            title="Delete User"
            variant="danger"
            @click="handleDeleteConfirmation(row as User)"
          />
        </div>
      </template>
    </BaseTable>
    <HistoryDrawer v-model:visible="historyDrawerVisible" :historyData="historyData" />
  </div>
</template>
