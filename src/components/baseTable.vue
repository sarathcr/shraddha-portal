<script setup lang="ts">
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import type {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
  DataTableFilterMeta,
} from 'primevue/datatable'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import Tag from 'primevue/tag'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSlots } from 'vue'
import Select from 'primevue/select'
import BaseTableSkeleton from './Skelton/BaseTableSkeleton.vue'
import { CommitteeRoles } from '@/constants/committeeRoles.enum'

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowData[]
  totalRecords?: number
  rowsPerPage?: number
  editableRow?: RowData | null
  statusOptions?: { label: string; value: string }[]
  multiSelectOption?: { label: string; value: string }[]
  loading?: boolean
  saveDisabled?: boolean
  paginator?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', row: RowData): void
  (e: 'cancel'): void
  (e: 'lazy:load', event: DataTablePageEvent | DataTableSortEvent | DataTableFilterEvent): void
  (e: 'delete', row: RowData): void
  (e: 'update:permissions', value: string[]): void
}>()

const tempRow = reactive<RowData>({})
const tableFilters = ref<DataTableFilterMeta>({})

const sortField = ref<string | undefined>(undefined)
const sortOrder = ref<1 | -1 | undefined>(undefined)

const first = ref(0)
const internalPageSize = ref(props.rowsPerPage ?? 10)

const dynamicRowsPerPageOptions = computed((): number[] => {
  const total = props.totalRecords || 0
  const options = new Set<number>()

  options.add(internalPageSize.value)

  if (total > 0) {
    const step = 5
    for (let i = step; i <= total; i += step) {
      options.add(i)
    }
    const finalMultipleOf5 = Math.ceil(total / 5) * 5
    options.add(finalMultipleOf5)
  } else {
    ;[5, 10, 20].forEach((opt) => options.add(opt))
  }
  return Array.from(options).sort((a, b) => a - b)
})

const initFilters = (): void => {
  const initialFilters: DataTableFilterMeta = {}
  props.columns.forEach((col) => {
    if (col.filterable) {
      const filterKey = col.backendKey || col.key
      initialFilters[filterKey] = {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      }
    }
  })
  tableFilters.value = initialFilters
}

watch(
  () => props.columns,
  () => {
    initFilters()
  },
  { immediate: true },
)

watch(
  () => props.editableRow,
  (newRow) => {
    if (newRow) {
      Object.keys(tempRow).forEach((key) => delete tempRow[key])
      Object.assign(tempRow, JSON.parse(JSON.stringify(newRow)))
    } else {
      Object.keys(tempRow).forEach((key) => delete tempRow[key])
    }
  },
  { immediate: true },
)

const saveEdit = (): void => {
  emit('save', { ...tempRow })
}

const cancelEdit = (): void => {
  emit('cancel')
}

const slots = useSlots()
const hasTableHeader = computed(() => !!slots['table-header'])

const onLazyLoad = (
  event: DataTablePageEvent | DataTableSortEvent | DataTableFilterEvent,
): void => {
  const isFilterEvent =
    Object.prototype.hasOwnProperty.call(event, 'filters') &&
    !Object.prototype.hasOwnProperty.call(event, 'page')

  if (isFilterEvent) {
    first.value = 0
  } else {
    first.value = event.first ?? 0
  }

  internalPageSize.value = event.rows ?? internalPageSize.value

  emit('lazy:load', {
    ...event,
    first: first.value,
    rows: internalPageSize.value,
  })
}
const adjustFirstForTotalRecords = (): void => {
  const total = props.totalRecords || 0
  const pageSize = internalPageSize.value
  const totalPages = Math.ceil(total / pageSize)
  let currentPage = Math.floor(first.value / pageSize) + 1
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages
    first.value = (currentPage - 1) * pageSize
  }
  if (first.value < 0) first.value = 0
}
watch(
  () => [props.rows, props.totalRecords],
  () => {
    adjustFirstForTotalRecords()
  },
)

onMounted(() => {
  onLazyLoad({
    first: first.value,
    rows: internalPageSize.value,
    page: 0,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    filters: tableFilters.value,
  } as DataTablePageEvent)
})
const getOptionLabel = (
  options: (string | { label: string; value: string })[] | undefined,
  value: string | undefined,
): string => {
  if (!options || value === undefined) return value ?? ''
  const opt = options.find((o) => (typeof o === 'object' ? o.value === value : o === value))
  return opt && typeof opt === 'object' ? opt.label : value
}
</script>
<template>
  <div class="space-y-4 h-full p-4 flex flex-col justify-between">
    <div class="bg-white rounded-md max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <BaseTableSkeleton
        v-if="loading"
        :columns-count="columns.length + 1"
        :rows-count="rowsPerPage || 10"
      />
      <DataTable
        v-else
        :value="rows"
        :lazy="true"
        @lazy-load="onLazyLoad"
        @sort="onLazyLoad"
        @filter="onLazyLoad"
        @page="onLazyLoad"
        :paginator="paginator"
        :rows="internalPageSize"
        :totalRecords="totalRecords"
        v-model:first="first"
        v-model:sortField="sortField"
        v-model:sortOrder="sortOrder"
        filterDisplay="menu"
        scrollable
        scrollHeight="flex"
        scrollDirection="both"
        dataKey="id"
        class="min-w-full grow"
        v-model:filters="tableFilters"
        :rowsPerPageOptions="dynamicRowsPerPageOptions"
      >
        <template #header v-if="hasTableHeader">
          <div class="flex justify-between items-center sticky top-0 z-20">
            <slot name="table-header" />
          </div>
        </template>
        <Column
          v-for="col in columns"
          :key="col.key"
          :field="col.key"
          :header="col.label"
          sortable
          :filter="col.filterable"
          :filterField="col.backendKey || col.key"
          style="min-width: 200px"
          class="!py-4"
          :showFilterMatchModes="col.showFilterMatchModes"
          :showFilterOperator="col.showFilterOperator"
          v-bind="col.showAddButton === false ? { showAddButton: false } : {}"
        >
          <template #body="{ data, column }">
            <template v-if="slots[`body-${col.key}`]">
              <slot
                :name="`body-${col.key}`"
                :row="data"
                :column="column"
                :options="col.options"
                optionLabel="label"
                optionValue="value"
                :placeholder="col.placeholder || `Select ${col.label}`"
              ></slot>
            </template>
            <template v-else-if="editableRow === data">
              <DatePicker
                v-if="col.useDateFilter"
                v-model="tempRow[col.key] as Date | null"
                dateFormat="dd/mm/yy"
                showIcon
                class="w-full"
              />

              <div v-else-if="col.filterOption">
                <div
                  tabindex="-1"
                  v-tooltip.focus.top="
                    col.key === 'role' &&
                    Object.values(CommitteeRoles).includes(tempRow[col.key] as CommitteeRoles)
                      ? 'This user is under the current active committee'
                      : ''
                  "
                  class="w-full"
                >
                  <Select
                    v-model="tempRow[col.key]"
                    :options="col.options"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="col.placeholder || `Select ${col.label}`"
                    class="w-full"
                    :disabled="
                      col.key === 'role' &&
                      Object.values(CommitteeRoles).includes(tempRow[col.key] as CommitteeRoles)
                    "
                    :optionDisabled="
                      (opt) =>
                        col.key === 'role' &&
                        Object.values(CommitteeRoles).includes(opt.value as CommitteeRoles) &&
                        opt.value !== tempRow[col.key]
                    "
                  />
                </div>
              </div>

              <div v-else-if="col.useMultiSelect">
                <MultiSelect
                  :key="data.id"
                  v-model="tempRow[col.key]"
                  :options="col.options"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="col.placeholder || `Select ${col.label}`"
                  display="chip"
                  filter
                  class="w-full"
                  :maxSelectedLabels="3"
                />
              </div>
              <div v-else>
                <ToggleSwitch
                  v-if="col.useToggle"
                  v-model="tempRow[col.key] as boolean | undefined"
                />

                <InputText
                  v-else
                  v-model="tempRow[col.key] as string"
                  :type="col.key === 'email' ? 'email' : 'text'"
                  class="w-full"
                  :disabled="col.key === 'email'"
                />
              </div>
            </template>
            <template v-else>
              <span v-if="col.useDateFilter">{{ data[col.key] }}</span>
              <template v-else-if="col.useMultiSelect">
                <div class="flex flex-wrap gap-1">
                  <Tag
                    v-for="item in data[col.key]"
                    :key="item"
                    :value="getOptionLabel(col.options || [], item)"
                    class="mr-1"
                  />
                </div>
              </template>
              <ToggleSwitch
                v-else-if="col.useToggle"
                :modelValue="Boolean(data[col.key])"
                @update:modelValue="(newValue) => $emit('save', { ...data, [col.key]: newValue })"
              />
              <span v-else>
                <span>{{ getOptionLabel(col.options, data[col.key]) }}</span>
              </span>
            </template>
          </template>

          <template #filter="{ filterModel }">
            <div class="flex flex-col gap-1">
              <Select
                v-if="col.filterOption"
                v-model="filterModel.value"
                :options="col.options"
                optionLabel="label"
                optionValue="value"
                :placeholder="col.placeholder || `Select ${col.label}`"
                class="w-full"
              />
              <DatePicker
                v-else-if="col.useDateFilter"
                v-model="filterModel.value"
                dateFormat="dd-mm-yy"
                placeholder="dd-mm-yyyy"
                showIcon
                class="w-full"
              />
              <MultiSelect
                v-else-if="col.useMultiSelect"
                v-model="filterModel.value"
                :options="col.options"
                optionLabel="label"
                optionValue="value"
                :placeholder="col.placeholder || `Select ${col.label}`"
                filter
                display="chip"
                class="w-full"
                :maxSelectedLabels="3"
              />
              <Select
                v-else-if="col.useToggle"
                v-model="filterModel.value"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Status"
                class="w-full"
              />
              <InputText
                v-else
                v-model="filterModel.value"
                class="w-full"
                :placeholder="`Search ${col.label}`"
              />
            </div>
          </template>
        </Column>
        <Column header="Actions" style="min-width: 150px">
          <template #body="{ data }">
            <div v-if="editableRow === data" class="flex gap-2">
              <Button icon="pi pi-check" severity="success" size="small" @click="saveEdit()" />

              <Button icon="pi pi-times" severity="danger" size="small" @click="cancelEdit" />
            </div>
            <div v-else>
              <slot name="actions" v-bind="{ row: data, onDelete: () => emit('delete', data) }" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div v-if="!loading" class="text-center text-gray-500 p-4">No data found.</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
<style lang="scss">
.p-datatable-header {
  padding: 0 0 1rem 0 !important;
}
</style>
