<script setup lang="ts">
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import { formatDate } from '@/utils/dateUtils'
import { FilterMatchMode } from '@primevue/core/api'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker' // ✅ Changed
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { computed, reactive, ref, watch } from 'vue'
import { useSlots } from 'vue'
import { Select } from 'primevue'

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowData[]
  pageSize?: number
  editableRow?: RowData | null
  statusOptions?: { label: string; value: string }[]
  multiSelectOption?: { label: string; value: string }[]
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
    if (newRow) Object.assign(tempRow, newRow)
  },
  { immediate: true },
)

const saveEdit = (row: RowData): void => {
  Object.assign(row, tempRow)
  emit('save', row)
}

const cancelEdit = (): void => {
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

const slots = useSlots()
const hasTableHeader = computed(() => !!slots['table-header'])
</script>

<template>
  <div class="space-y-4 h-full p-4">
    <DataTable
      :value="rows"
      v-model:filters="filters"
      filterDisplay="row"
      scrollable
      scrollDirection="horizontal"
      :paginator="true"
      :rows="pageSize || 20"
      :rowsPerPageOptions="[5, 10, 20]"
      dataKey="id"
      class="min-w-full"
      paginatorPosition="bottom"
    >
      <template #header v-if="hasTableHeader">
        <div class="flex justify-between items-center w-full">
          <slot name="table-header" />
        </div>
      </template>

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
            <DatePicker
              v-if="col.useDateFilter"
              v-model="tempRow[col.key] as Date | null"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
            />
            <Select
              v-else-if="col.filterOption"
              v-model="tempRow[col.key]"
              :options="props.statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="col.placeholder || `Select ${col.label}`"
              class="w-full"
            />
            <MultiSelect
              v-else-if="col.useMultiSelect"
              v-model="tempRow[col.key]"
              :options="props.multiSelectOption"
              optionLabel="label"
              optionValue="value"
              :placeholder="col.placeholder || `Select ${col.label}`"
              display="chip"
              filter
              class="w-full"
            />
            <InputText v-else v-model="tempRow[col.key] as string" class="w-full" />
          </div>
          <div v-else>
            <span v-if="col.useDateFilter">{{ formatDate(data[col.key]) }}</span>
            <template v-else-if="col.useMultiSelect && Array.isArray(data[col.key])">
              <Tag
                v-for="item in data[col.key]"
                :key="item"
                :value="props.multiSelectOption?.find((opt) => opt.value === item)?.label || item"
                class="mr-1"
              />
            </template>
            <Tag
              v-else-if="col.useTag"
              :value="
                props.statusOptions?.find((opt) => opt.value === data[col.key])?.label ||
                data[col.key]
              "
              :severity="getSeverity(data[col.key])"
            />
            <span v-else>{{ data[col.key] }}</span>
          </div>
        </template>

        <template #filter="{ filterModel, filterCallback }">
          <div class="flex flex-col gap-1">
            <Select
              v-if="col.filterOption"
              v-model="filterModel.value"
              :options="props.statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="col.placeholder || `Select ${col.label}`"
              class="w-full"
              @change="filterCallback()"
            />
            <DatePicker
              v-else-if="col.useDateFilter"
              v-model="filterModel.value"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Select Date"
              class="w-full"
              @date-select="filterCallback()"
              @change="filterCallback()"
            />
            <MultiSelect
              v-else-if="col.useMultiSelect"
              v-model="filterModel.value"
              :options="props.multiSelectOption"
              optionLabel="label"
              optionValue="value"
              :placeholder="col.placeholder || `Select ${col.label}`"
              filter
              display="chip"
              :maxSelectedLabels="3"
              class="w-full"
              @change="filterCallback()"
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
            <slot
              name="actions"
              v-bind="{ row: data, onDelete: (row: number) => emit('delete', data) }"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<style lang="scss">
.p-datatable-header {
  padding: 0 0 1rem 0 !important;
}
</style>
