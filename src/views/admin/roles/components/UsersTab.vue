<!-- src/views/admin/roles/components/UsersTab.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useToast } from 'primevue/usetoast'
import { useUsers } from '@/views/admin/roles/composables/useUser'
import UserForm from './UserForm.vue'
import type { User } from '@/types/user'

const toast = useToast()
const {
  users,
  roles,
  teams,
  isLoading,
  editingRows,
  filters,
  clearFilter,
  fetchInitialData,
  createUser,
  editUser,
  deleteUser,
} = useUsers()
const userFormDialogVisible = ref(false)
const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)
const openCreateUserDialog = (): void => {
  userFormDialogVisible.value = true
  if (userFormRef.value) {
    userFormRef.value.resetForm()
  }
}
const handleUserFormSubmit = async (payload: Omit<User, 'id' | 'dob'>): Promise<void> => {
  const success = await createUser(payload)
  if (success) {
    userFormDialogVisible.value = false
  }
}
const handleUserFormCancel = (): void => {
  userFormDialogVisible.value = false
}
const onRowEditSave = async (event: { newData: User; index: number }): Promise<void> => {
  const { newData, index } = event
  const oldData = users.value[index]

  const { success, user: updatedUserResult } = await editUser(newData, oldData)

  if (success) {
    users.value[index] = updatedUserResult
  } else {
    users.value[index] = { ...oldData }
  }
}

const onDeleteRow = (row: User): void => {
  deleteUser(row)
}

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <toast />
  <div v-if="isLoading" class="flex justify-center items-center h-full">
    <p>Loading user data...</p>
  </div>
  <DataTable
    v-else
    scrollable
    scrollHeight="400px"
    v-model:editingRows="editingRows"
    :value="users"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    :pt="{ table: { style: 'min-width: 90rem' } }"
    :filters="filters"
    paginator
    :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    filterDisplay="row"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <div class="card flex justify-center flex-wrap gap-4">
          <Button
            label="New User"
            icon="pi pi-plus"
            severity="help"
            @click="openCreateUserDialog"
          />
          <Dialog
            v-model:visible="userFormDialogVisible"
            header="Create User"
            :style="{ width: '50rem', margin: '15px' }"
            :modal="true"
            @hide="handleUserFormCancel"
          >
            <!-- Use the new UserForm component -->
            <UserForm
              ref="userFormRef"
              :roles="roles"
              :teams="teams"
              @submit="handleUserFormSubmit"
              @cancel="handleUserFormCancel"
            />
          </Dialog>
        </div>
        <div class="flex justify-end gap-3">
          <Button icon="pi pi-filter-slash" label="Clear Filters" outlined @click="clearFilter()" />
          <IconField>
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText v-model="filters.global.value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </div>
    </template>

    <Column field="name" header="Name" style="width: 15%">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" autofocus />
      </template>
    </Column>

    <Column field="employeeId" header="Employee ID" style="width: 15%">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>

    <Column field="email" header="Email" style="width: 25%">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>

    <Column field="team" header="Team" style="width: 15%">
      <template #editor="{ data, field }">
        <MultiSelect
          v-model="data[field]"
          :options="teams"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Team(s)"
          display="chip"
          class="w-full"
        />
      </template>
      <template #body="slotProps">
        <span v-if="slotProps.data.team && slotProps.data.team.length">
          {{
            slotProps.data.team
              .map((t: string) => teams.find((opt) => opt.value === t)?.label || t)
              .join(', ')
          }}
        </span>
        <span v-else>N/A</span>
      </template>
    </Column>

    <Column field="role" header="Role" style="width: 15%">
      <template #editor="{ data, field }">
        <Select
          v-model="data[field]"
          :options="roles"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a Role"
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.role }}
      </template>
    </Column>

    <Column :rowEditor="true" style="width: 5%; min-width: 5rem" bodyStyle="text-align:center" />
    <Column header="Actions" style="width: 10%; min-width: 8rem; text-align: center">
      <template #body="slotProps">
        <div class="flex justify-content-center gap-2">
          <Button
            icon="pi pi-trash"
            @click="onDeleteRow(slotProps.data)"
            rounded
            outlined
            severity="danger"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
