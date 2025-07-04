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
import { createUser, getRoles, getTeams } from '@/views/admin/services/roles-and-access.services'
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

const products = ref<{ id: string; name: string; inventoryRole: string }[]>([])
const editingRows = ref([])
interface Product {
  id: string
  name: string
  inventoryRole: string
}
interface RawProduct {
  id: string
  name: string
  inventoryRole?: string
}

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

// Handlers
const onRowEditSave = (event: { newData: Product; index: number }): void => {
  const { newData, index } = event
  products.value[index] = newData
}
const onDeleteRow = (row: Product): void => {
  products.value = products.value.filter((p) => p.id !== row.id)
}

const handleCreateUser = handleSubmit(async (values) => {
  try {
    const res = await createUser(values)
    products.value.push({
      id: res.data.id,
      name: res.data.name,
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

// Role/Team form (Tab 1 & 2)
const roleName = ref('')
const permissions = ref<string[]>([])
const description = ref('')

// Init
onMounted(async () => {
  const data = await ProductService.getProductsMini()
  products.value = data.map((item: RawProduct) => ({
    id: item.id,
    name: item.name,
    inventoryRole: item.inventoryRole || 'User',
  }))

  roles.value = await getRoles()
  teams.value = await getTeams()
})
</script>

<template>
  <Toast />

  <div class="roles__content w-full overflow-auto">
    <div class="card p-4 bg-white rounded-md shadow">
      <Tabs :value="selectedTab" @update:value="selectedTab = String($event)">
        <TabList>
          <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.title }}</Tab>
        </TabList>
        <TabPanels class="p-0">
          <TabPanel value="0">
            <!-- Users Table -->
            <DataTable
              scrollable
              scrollHeight="400px"
              v-model:editingRows="editingRows"
              :value="products"
              editMode="row"
              dataKey="id"
              @row-edit-save="onRowEditSave"
              :pt="{ table: { style: 'min-width: 50rem' } }"
            >
              <template #header>
                <div class="flex justify-between">
                  <div class="card flex justify-center flex-wrap gap-4">
                    <Button
                      label="new"
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
                      header="Create user"
                      :style="{ width: '50rem', margin: '15px' }"
                      :modal="true"
                    >
                      <form @submit.prevent="handleCreateUser" class="flex flex-col gap-4">
                        <div>
                          <label class="font-semibold">Username</label>
                          <InputText v-model="name" class="w-full" />
                          <small class="text-red-500">{{ errors.name }}</small>
                        </div>
                        <div>
                          <label class="font-semibold">Employee ID</label>
                          <InputText v-model="employeeId" class="w-full" />
                          <small class="text-red-500">{{ errors.employeeId }}</small>
                        </div>
                        <div>
                          <label class="font-semibold">Email</label>
                          <InputText v-model="email" class="w-full" />
                          <small class="text-red-500">{{ errors.email }}</small>
                        </div>
                        <div>
                          <label class="font-semibold">Team</label>
                          <MultiSelect
                            v-model="team"
                            :options="teams"
                            display="chip"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select team"
                            class="w-full"
                          />
                          <small class="text-red-500">{{ errors.team }}</small>
                        </div>
                        <div>
                          <label class="font-semibold">Role</label>
                          <Select
                            v-model="role"
                            :options="roles"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select a role"
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
                      label="Clear"
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

              <Column field="name" header="Name" style="width: 40%">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" fluid />
                </template>
              </Column>

              <Column field="inventoryRole" header="Role" style="width: 40%">
                <template #editor="{ data, field }">
                  <Select
                    v-model="data[field]"
                    :options="roles"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a role"
                    fluid
                  />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data.inventoryRole }}
                </template>
              </Column>

              <Column
                :rowEditor="true"
                style="width: 10%; min-width: 8rem"
                bodyStyle="text-align:center"
              />
              <Column header="Actions" style="width: 12rem; text-align: center">
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

          <!-- Roles Panel -->
          <TabPanel value="1">
            <div class="flex flex-wrap gap-4 mb-5">
              <span class="w-full font-semibold">Permissions:</span>
              <div
                class="flex items-center gap-2"
                v-for="perm in ['read', 'write', 'update', 'delete']"
                :key="perm"
              >
                <div class="flex items-center gap-2">
                  <Checkbox v-model="permissions" :inputId="perm" :value="perm" />
                  <label :for="perm" class="cursor-pointer">{{
                    perm.charAt(0).toUpperCase() + perm.slice(1)
                  }}</label>
                </div>
              </div>
            </div>
            <Textarea v-model="description" rows="5" cols="30" placeholder="Description" />
          </TabPanel>

          <!-- Teams Panel -->
          <TabPanel value="2">
            <div class="flex flex-col gap-4">
              <InputText v-model="roleName" placeholder="Add Team" />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
