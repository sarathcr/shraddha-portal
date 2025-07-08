<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import {
  createUser,
  getRoles,
  getTeams,
  editUser,
} from '@/views/admin/services/roles-and-access.services'
import type { User, OptionItem } from '@/types/user'
import type { APIError } from '@/types/index'
import { ProductService } from '@/services/ProductService'
import Toast from 'primevue/toast'
import { userSchema } from '@/views/admin/schemas/userSchema'

const visible = ref(false)
const toast = useToast()

const roles = ref<OptionItem[]>([])
const teams = ref<OptionItem[]>([])

const { handleSubmit, errors, resetForm } = useForm<Omit<User, 'id'>>({
  validationSchema: userSchema,
})
const { value: name } = useField<string>('name')
const { value: employeeId } = useField<string>('employeeId')
const { value: email } = useField<string>('email')
const { value: team } = useField<string[]>('team')
const { value: role } = useField<string>('role')

interface Product {
  id: string
  name: string
  employeeId: string
  email: string
  team: string[]
  inventoryRole: string
}

interface RawProduct {
  id: string
  name: string
  employeeId?: string
  email?: string
  team?: string[]
  inventoryRole?: string
}

const products = ref<Product[]>([])
const editingRows = ref([])

const selectedTab = ref<string>('0')
const tabs = ref([
  { value: '0', title: 'Users' },
  { value: '1', title: 'Roles' },
  { value: '2', title: 'Teams' },
])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const clearFilter = (): void => {
  filters.value.global.value = null
}

const onRowEditSave = async (event: { newData: Product; index: number }): Promise<void> => {
  const { newData, index } = event
  const oldData = products.value[index]

  try {
    const payload: Partial<Omit<User, 'id'>> = {}

    if (newData.name !== oldData.name) {
      payload.name = newData.name
    }
    if (newData.employeeId !== oldData.employeeId) {
      payload.employeeId = newData.employeeId
    }
    if (newData.email !== oldData.email) {
      payload.email = newData.email
    }
    if (JSON.stringify(newData.team) !== JSON.stringify(oldData.team)) {
      payload.team = newData.team
    }
    if (newData.inventoryRole !== oldData.inventoryRole) {
      payload.role = newData.inventoryRole
    }

    if (Object.keys(payload).length === 0) {
      toast.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No modifications detected for this user.',
        life: 3000,
      })
      products.value[index] = { ...oldData }
      return
    }

    const res = await editUser(newData.id, payload)

    products.value[index] = {
      id: res.data.id,
      name: res.data.name,
      employeeId: res.data.employeeId,
      email: res.data.email,
      team: res.data.team,
      inventoryRole: res.data.role,
    }

    toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })
  } catch (err) {
    const error = err as APIError
    const message = error?.error?.message || error.message || 'Failed to update user'
    toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
    products.value[index] = { ...oldData }
  }
}

const onDeleteRow = (row: Product): void => {
  products.value = products.value.filter((p) => p.id !== row.id)
  toast.add({
    severity: 'success',
    summary: 'Deleted',
    detail: `User ${row.name} deleted successfully (simulated).`,
    life: 3000,
  })
}

const handleCreateUser = handleSubmit(async (values) => {
  try {
    const res = await createUser(values)
    products.value.push({
      id: res.data.id,
      name: res.data.name,
      employeeId: res.data.employeeId,
      email: res.data.email,
      team: res.data.team,
      inventoryRole: res.data.role,
    })
    toast.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 })
    visible.value = false
    resetForm()
  } catch (err) {
    const error = err as APIError
    const message = error?.error?.message || error.message || 'Failed to create user'
    toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
  }
})

const roleName = ref('')
const permissions = ref<string[]>([])
const description = ref('')

onMounted(async () => {
  const data = await ProductService.getProductsMini()
  products.value = data.map((item: RawProduct) => ({
    id: item.id,
    name: item.name,
    employeeId: item.employeeId || '',
    email: item.email || '',
    team: item.team || [],
    inventoryRole: item.inventoryRole || 'User',
  }))

  roles.value = await getRoles()
  teams.value = await getTeams()
})
</script>

<template>
  <Toast />

  <div class="roles__content w-full overflow-auto">
    <div class="card bg-white rounded-md shadow">
      <Tabs :value="selectedTab" @update:value="selectedTab = String($event)">
        <TabList class="sticky top-0 z-50 bg-white">
          <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.title }}</Tab>
        </TabList>
        <TabPanels class="p-0">
          <TabPanel value="0">
            <DataTable
              scrollable
              scrollHeight="400px"
              v-model:editingRows="editingRows"
              :value="products"
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
                      severity="info"
                      @click="
                        () => {
                          visible = true
                          resetForm()
                        }
                      "
                    />
                    <Dialog
                      v-model:visible="visible"
                      header="Create User"
                      :style="{ width: '50rem', margin: '15px' }"
                      :modal="true"
                      @hide="resetForm()"
                    >
                      <form @submit.prevent="handleCreateUser" class="flex flex-col gap-4">
                        <div>
                          <label for="username" class="font-semibold mb-2">Username</label>
                          <InputText id="username" v-model="name" class="w-full" />
                          <small class="text-red-500">{{ errors.name }}</small>
                        </div>
                        <div>
                          <label for="employeeId" class="font-semibold mb-2">Employee ID</label>
                          <InputText id="employeeId" v-model="employeeId" class="w-full" />
                          <small class="text-red-500">{{ errors.employeeId }}</small>
                        </div>
                        <div>
                          <label for="email" class="font-semibold mb-2">Email</label>
                          <InputText id="email" v-model="email" class="w-full" />
                          <small class="text-red-500">{{ errors.email }}</small>
                        </div>
                        <div>
                          <label for="team" class="font-semibold mb-2">Team</label>
                          <MultiSelect
                            id="team"
                            v-model="team"
                            :options="teams"
                            display="chip"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Team(s)"
                            class="w-full"
                          />
                          <small class="text-red-500">{{ errors.team }}</small>
                        </div>
                        <div>
                          <label for="role" class="font-semibold mb-2">Role</label>
                          <Select
                            id="role"
                            v-model="role"
                            :options="roles"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select a Role"
                            class="w-full"
                          />
                          <small class="text-red-500">{{ errors.role }}</small>
                        </div>
                        <div class="flex justify-end gap-2 mt-2">
                          <Button label="Cancel" severity="secondary" @click="visible = false" />
                          <Button type="submit" label="Save" />
                        </div>
                      </form>
                    </Dialog>
                  </div>
                  <div class="flex justify-end gap-3">
                    <Button
                      icon="pi pi-filter-slash"
                      label="Clear Filters"
                      outlined
                      @click="clearFilter()"
                    />
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

              <Column field="inventoryRole" header="Role" style="width: 15%">
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
                  {{ slotProps.data.inventoryRole }}
                </template>
              </Column>

              <Column
                :rowEditor="true"
                style="width: 5%; min-width: 5rem"
                bodyStyle="text-align:center"
              />
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
          </TabPanel>

          <TabPanel value="1">
            <div class="flex flex-col gap-4">
              <h3 class="font-semibold text-lg mb-2">Permissions for New Role</h3>
              <div class="flex flex-wrap gap-4">
                <div
                  class="flex items-center gap-2"
                  v-for="perm in ['read', 'write', 'update', 'delete']"
                  :key="perm"
                >
                  <Checkbox v-model="permissions" :inputId="perm" :value="perm" />
                  <label :for="perm" class="cursor-pointer">{{
                    perm.charAt(0).toUpperCase() + perm.slice(1)
                  }}</label>
                </div>
              </div>
              <InputText v-model="roleName" placeholder="New Role Name" class="w-full mt-4" />
              <Textarea
                v-model="description"
                rows="5"
                cols="30"
                placeholder="Role Description"
                class="w-full"
              />
              <Button label="Save Role" icon="pi pi-save" class="mt-4" />
            </div>
          </TabPanel>

          <TabPanel value="2">
            <div class="flex flex-col gap-4">
              <h3 class="font-semibold text-lg mb-2">Add New Team</h3>
              <InputText v-model="roleName" placeholder="New Team Name" class="w-full" />
              <Textarea
                rows="5"
                cols="30"
                placeholder="Team Description (Optional)"
                class="w-full"
              />
              <Button label="Save Team" icon="pi pi-save" class="mt-4" />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
