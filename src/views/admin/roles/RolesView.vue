<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HeaderView from '@/components/HeaderView.vue'
import SidebarView from '@/components/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { ProductService } from '@/services/ProductService'
import { createUser } from '@/views/admin/services/roles-and-access.services'
import Dialog from 'primevue/dialog'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
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
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

// State & layout
const sidebarStore = useSidebarStore()
const screenWidth = ref(window.innerWidth)
const isDesktop = computed((): boolean => screenWidth.value >= 1024)
const visible = ref(false)

const name = ref('')
const employeeId = ref('')
const email = ref('')
const team = ref('')
const role = ref('')

const errorMessage = ref('')
const successMessage = ref('')

// Tabs
const tabs = ref([
  { title: 'Users', value: '0' },
  { title: 'Create New Role', value: '1' },
  { title: 'Add Team', value: '2' },
])
const selectedTab = ref<string | number>('0')

// Role options
const roles = ref([
  { label: 'Secretary', value: 'Secretary' },
  { label: 'Treasurer', value: 'Treasurer' },
  { label: 'Assistant Treasurer', value: 'Assistant Treasurer' },
  { label: 'Executive Committee member', value: 'Executive Committee member' },
  { label: 'User', value: 'User' },
])

// Product model
interface Product {
  id: string
  name: string
  inventoryRole: string
  [key: string]: unknown
}

const products = ref<Product[]>([])
const editingRows = ref<string[]>([])

const onRowEditSave = ({ newData, index }: { newData: Product; index: number }): void => {
  products.value[index] = newData
  editingRows.value = editingRows.value.filter((rowId) => rowId !== newData.id)
}

const onDeleteRow = (row: Product): void => {
  products.value = products.value.filter((p) => p.id !== row.id)
}

const handleCreateUser = async (): Promise<void> => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await createUser({
      name: name.value,
      employeeId: employeeId.value,
      email: email.value,
      team: team.value,
      role: role.value,
    })

    products.value.push({
      id: response.data.id,
      name: response.data.name,
      inventoryRole: response.data.role,
    })

    successMessage.value = response.message
    visible.value = false

    resetForm()
  } catch (error: unknown) {
    console.error('Create user error:', error)

    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as { error: { message?: string } }).error?.message === 'string'
    ) {
      errorMessage.value = (error as { error: { message: string } }).error.message
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: string }).message === 'string'
    ) {
      errorMessage.value = (error as { message: string }).message
    } else {
      errorMessage.value = 'Failed to create user'
    }
  }
}

const resetForm = (): void => {
  name.value = ''
  employeeId.value = ''
  email.value = ''
  team.value = ''
  role.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

// Fetch product data
onMounted(async (): Promise<void> => {
  const data = await ProductService.getProductsMini()
  products.value = data.map((item: Record<string, unknown>) => ({
    ...item,
    inventoryRole: item.inventoryRole || 'User',
  })) as Product[]
})

// Tag severity
const getRoleLabel = (
  role: string,
): 'success' | 'info' | 'secondary' | 'warn' | 'danger' | 'contrast' => {
  const validRoles = [
    'Secretary',
    'Treasurer',
    'Assistant Treasurer',
    'Executive Committee member',
    'User',
  ]
  return validRoles.includes(role) ? 'success' : 'secondary'
}

// Filters
interface FilterMap {
  [key: string]: unknown
  global: { value: string | null; matchMode: string }
}

const filters = ref<FilterMap>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const initFilters = (): void => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    'country.name': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    date: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    balance: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    role: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    activity: { value: [0, 100], matchMode: FilterMatchMode.BETWEEN },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
}
initFilters()

const clearFilter = (): void => initFilters()

// Role/Committee Form
const roleName = ref('')
const permissions = ref<string[]>([])
const description = ref('')
</script>

<template>
  <div class="roles min-h-screen flex flex-col bg-[#f1f5f9]">
    <HeaderView />
    <div
      class="roles__main p-8 flex-grow flex"
      :class="[sidebarStore.isSidebarVisible && isDesktop ? 'gap-[30px]' : 'gap-0']"
    >
      <div
        class="roles__sidebar transition-all duration-400 ease-in-out"
        :class="[sidebarStore.isSidebarVisible && isDesktop ? 'w-[240px]' : 'w-0']"
      >
        <div class="w-[240px] bg-white">
          <SidebarView />
        </div>
      </div>

      <div
        class="roles__content w-full flex flex-col gap-7 h-auto lg:h-[calc(100vh-126px)] overflow-auto"
      >
        <div class="card p-4 bg-white rounded-md shadow">
          <Tabs :value="selectedTab" @update:value="selectedTab = $event">
            <TabList>
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
                  :pt="{
                    table: { style: 'min-width: 50rem' },
                  }"
                >
                  <template #header>
                    <div class="flex justify-between">
                      <div class="card flex justify-center flex-wrap gap-4">
                        <Button
                          label="new"
                          @click="
                            () => {
                              visible = true
                              resetForm()
                            }
                          "
                          severity="info"
                        />

                        <Dialog
                          v-model:visible="visible"
                          header="Create user"
                          :style="{ width: '50rem' }"
                          :modal="true"
                        >
                          <div class="flex flex-col gap-4 mb-4">
                            <label for="username" class="font-semibold">Username</label>
                            <InputText
                              id="username"
                              v-model="name"
                              class="flex-auto"
                              autocomplete="off"
                            />
                          </div>

                          <div class="flex flex-col gap-4 mb-4">
                            <label for="employeeId" class="font-semibold">Employee Id</label>
                            <InputText
                              id="employeeId"
                              v-model="employeeId"
                              class="flex-auto"
                              autocomplete="off"
                            />
                          </div>

                          <div class="flex flex-col gap-4 mb-4">
                            <label for="email" class="font-semibold">Email Id</label>
                            <InputText
                              id="email"
                              v-model="email"
                              class="flex-auto"
                              autocomplete="off"
                            />
                          </div>

                          <div class="flex flex-col gap-4 mb-4">
                            <label for="team" class="font-semibold">Team</label>
                            <InputText
                              id="team"
                              v-model="team"
                              class="flex-auto"
                              autocomplete="off"
                            />
                          </div>

                          <div class="flex flex-col gap-4 mb-4">
                            <label for="role" class="font-semibold">Role</label>
                            <Select
                              v-model="role"
                              :options="roles"
                              optionLabel="label"
                              optionValue="value"
                              placeholder="Select a Role"
                              class="w-full"
                            />
                          </div>

                          <div v-if="errorMessage" class="text-red-500 font-semibold">
                            {{ errorMessage }}
                          </div>
                          <div v-if="successMessage" class="text-green-600 font-semibold">
                            {{ successMessage }}
                          </div>

                          <div class="flex justify-end gap-2">
                            <Button label="Cancel" severity="secondary" @click="visible = false" />
                            <Button label="Save" @click="handleCreateUser" />
                          </div>
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
                      >
                        <template #option="slotProps">
                          <Tag :value="slotProps.option.value" />
                        </template>
                      </Select>
                    </template>
                    <template #body="slotProps">
                      <Tag
                        :value="slotProps.data.inventoryRole"
                        :severity="getRoleLabel(slotProps.data.inventoryRole)"
                      />
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

              <TabPanel value="1">
                <div class="flex flex-col gap-4">
                  <InputText v-model="roleName" placeholder="Enter Role Name" />
                  <div class="flex flex-wrap gap-4">
                    <span class="w-full font-semibold">Permissions:</span>
                    <div
                      class="flex items-center gap-2"
                      v-for="perm in ['read', 'write', 'update', 'delete']"
                      :key="perm"
                    >
                      <Checkbox v-model="permissions" :inputId="perm" :value="perm" />
                      <label :for="perm">{{ perm.charAt(0).toUpperCase() + perm.slice(1) }}</label>
                    </div>
                  </div>
                  <Textarea v-model="description" rows="5" cols="30" placeholder="Description" />
                </div>
              </TabPanel>
              <TabPanel value="2">
                <template v-if="selectedTab === '2'">
                  <div class="flex flex-col gap-4">
                    <InputText v-model="roleName" placeholder="Add Team" />
                  </div>
                </template>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
</template>
