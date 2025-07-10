<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
interface ColumnDef {
  label: string
  key: string
  filterable?: boolean
  useTag?: boolean
  filterOption?: boolean
  useDateFilter?: boolean
}

interface RowData {
  [key: string]: unknown
}

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowData[]
  pageSize?: number
  editableRow?: RowData | null
  statusOptions?: { label: string; value: string }[]
}>()
const emit = defineEmits<{
  (e: 'save', row: RowData): void
  (e: 'cancel'): void
  (e: 'delete', row: RowData): void
  (e: 'update:filters', filters: Record<string, { value: unknown; matchMode: string }>): void
}>()

const tempRow = reactive<RowData>({})

watch(
  () => props.editableRow,
  (newRow) => {
    if (newRow) {
      Object.assign(tempRow, newRow)
    }
  },
  { immediate: true },
)

function saveEdit(row: RowData): void {
  Object.assign(row, tempRow)
  emit('save', row)
}

function cancelEdit(): void {
  emit('cancel')
}

const filters = ref<Record<string, { value: unknown; matchMode: string }>>({})

props.columns.forEach((col) => {
  if (col.filterable) {
    filters.value[col.key] = {
      value: '',
      matchMode:
        col.filterOption || col.useDateFilter ? FilterMatchMode.EQUALS : FilterMatchMode.CONTAINS,
    }
  }
})

watch(filters, (newFilters) => {
  emit('update:filters', { ...newFilters })
})

function getSeverity(value: unknown): string {
  if (value === 'Active') return 'success'
  if (value === 'Inactive') return 'danger'
  return 'info'
}
function formatDate(value: unknown): string {
  if (!value) return ''
  const date = new Date(value as string)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
</script>

<template>
  <div class="space-y-4">
    <DataTable
      :value="rows"
      v-model:filters="filters"
      filterDisplay="row"
      scrollable
      scrollDirection="horizontal"
      scrollHeight="700px"
      :paginator="true"
      :rows="pageSize || 20"
      :rowsPerPageOptions="[5, 10, 20]"
      dataKey="id"
      class="min-w-full"
    >
      <Column
        v-for="col in columns"
        :key="col.key"
        :field="col.key"
        :header="col.label"
        :sortable="true"
        :filter="col.filterable"
        :filterField="col.key"
        style="min-width: 200px"
      >
        <template #body="{ data }">
          <div v-if="editableRow === data">
            <Calendar
              v-if="col.useDateFilter"
              v-model="tempRow[col.key] as Date | null"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
            />

            <InputText v-else v-model="tempRow[col.key] as string" class="w-full" />
          </div>
          <div v-else>
            <span v-if="col.useDateFilter">{{ formatDate(data[col.key]) }}</span>
            <Tag
              v-else-if="col.useTag"
              :value="data[col.key]"
              :severity="getSeverity(data[col.key])"
            />
            <span v-else>{{ data[col.key] }}</span>
          </div>
        </template>

        <template #filter="{ filterModel, filterCallback }">
          <div class="flex flex-col gap-1">
            <Dropdown
              v-if="col.filterOption"
              v-model="filterModel.value"
              :options="props.statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Status"
              class="w-full"
              @change="filterCallback()"
            />

            <Calendar
              v-else-if="col.useDateFilter"
              v-model="filterModel.value"
              dateFormat="yy/mm/dd"
              showIcon
              class="w-full"
              placeholder="Select Date"
              @date-select="filterCallback()"
            />
            <InputText
              v-else
              v-model="filterModel.value"
              class="w-full"
              :placeholder="`Search ${col.label}`"
              @input="filterCallback()"
            />
          </div>
        </template>
      </Column>

      <Column header="Actions" style="min-width: 150px">
        <template #body="{ data }">
          <div v-if="editableRow === data" class="flex gap-2">
            <Button icon="pi pi-check" severity="success" size="small" @click="saveEdit(data)" />
            <Button icon="pi pi-times" severity="danger" size="small" @click="cancelEdit" />
          </div>
          <div v-else>
            <slot name="actions" v-bind="{ row: data }" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
