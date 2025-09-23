<script setup lang="ts">
import type { ColumnDef, RowData } from '@/types/baseTable.model'
import { formatDateForUI } from '@/utils/dateUtils'
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
import { useValidation } from '@/views/admin/roles/composables/useValidation'

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
}>()

const tempRow = reactive<RowData>({})
const { validationErrors, validateField, isSaveDisabled } = useValidation()

const tableFilters = ref<DataTableFilterMeta>({})

const sortField = ref<string | undefined>(undefined)
const sortOrder = ref<1 | -1 | undefined>(undefined)

const first = ref(0)
const internalPageSize = ref(props.rowsPerPage || 5)
const dynamicRowsPerPageOptions = computed((): number[] => {
  const total = props.totalRecords || 0
  if (total === 0) {
    return [5, 10, 20, 50]
  }

  const options: number[] = []
  const step = 5
  for (let i = step; i <= total; i += step) {
    options.push(i)
  }

  if (total % step !== 0 && !options.includes(total)) {
    options.push(total)
  }

  return options
})
watch(
  dynamicRowsPerPageOptions,
  (options) => {
    if (!options.includes(internalPageSize.value)) {
      internalPageSize.value = options.at(-1)!
    }
  },
  { immediate: true },
)

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

watch(
  tempRow,
  (newRow) => {
    props.columns.forEach((col) => {
      if (col.required) validateField(col.key, newRow[col.key], col.label)
    })
  },
  { deep: true },
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
  first.value = event.first
  internalPageSize.value = event.rows
  emit('lazy:load', event)
}
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
          <div class="flex justify-between items-center sticky top-0 z-0">
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
                dateFormat="yy/mm/dd"
                showIcon
                class="w-full"
                @blur="col.required ? validateField(col.key, tempRow[col.key], col.label) : null"
              />

              <p v-if="col.useDateFilter" class="text-red-500 text-xs absolute">
                {{ validationErrors[col.key] }}
              </p>

              <div v-else-if="col.filterOption">
                <Select
                  v-model="tempRow[col.key]"
                  :options="col.options"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="col.placeholder || `Select ${col.label}`"
                  class="w-full"
                  @change="
                    col.required ? validateField(col.key, tempRow[col.key], col.label) : null
                  "
                  @blur="col.required ? validateField(col.key, tempRow[col.key], col.label) : null"
                />
                <p v-if="validationErrors[col.key]" class="text-red-500 text-xs absolute">
                  {{ validationErrors[col.key] }}
                </p>
              </div>
              <div v-else-if="col.useMultiSelect">
                <MultiSelect
                  v-model="tempRow[col.key]"
                  :options="col.options"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="col.placeholder || `Select ${col.label}`"
                  display="chip"
                  filter
                  class="w-full"
                  @change="
                    col.required ? validateField(col.key, tempRow[col.key], col.label) : null
                  "
                  @blur="col.required ? validateField(col.key, tempRow[col.key], col.label) : null"
                />
                <p v-if="validationErrors[col.key]" class="text-red-500 text-xs absolute">
                  {{ validationErrors[col.key] }}
                </p>
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
                  @blur="col.required ? validateField(col.key, tempRow[col.key], col.label) : null"
                />
                <p v-if="validationErrors[col.key]" class="text-red-500 text-xs absolute">
                  {{ validationErrors[col.key] }}
                </p>
              </div>
            </template>
            <template v-else>
              <span v-if="col.useDateFilter">{{ formatDateForUI(data[col.key]) }}</span>
              <template v-else-if="col.useMultiSelect">
                <Tag
                  v-if="data[col.key]"
                  :value="
                    col.options?.find((opt: any) => opt.value === data[col.key])?.label ||
                    data[col.key]
                  "
                  class="mr-1"
                />
              </template>
              <ToggleSwitch
                v-else-if="col.useToggle"
                :modelValue="Boolean(data[col.key])"
                @update:modelValue="
                  (newValue: boolean) => $emit('save', { ...data, [col.key]: newValue })
                "
              />
              <span v-else>
                {{
                  col.options
                    ? col.options.find((opt: any) => String(opt.value) === String(data[col.key]))
                        ?.label || data[col.key]
                    : data[col.key]
                }}
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
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Select Date"
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
              <Button
                icon="pi pi-check"
                severity="success"
                size="small"
                :disabled="isSaveDisabled"
                @click="saveEdit()"
              />

              <Button icon="pi pi-times" severity="danger" size="small" @click="cancelEdit" />
            </div>
            <div v-else>
              <slot name="actions" v-bind="{ row: data, onDelete: () => emit('delete', data) }" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center text-gray-500 p-4">No data found.</div>
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
