<script setup lang="ts">
import type { ColumnDef, RowData } from '@/shared/types/baseTable.types'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import type {
  DataTablePageEvent,
  DataTableSortEvent,
  DataTableFilterEvent,
  DataTableFilterMeta,
} from 'primevue/datatable'
import ActionButton from './ActionButton.vue'
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
import BaseTableSkeleton from './skeletons/BaseTableSkeleton.vue'

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowData[]
  unremovableRoleId?: string | null
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
    }
  },
  { immediate: true },
)

const saveEdit = (): void => {
  emit('save', tempRow)
}

const cancelEdit = (): void => {
  emit('cancel')
}

const isEditing = (row: RowData): boolean => {
  return props.editableRow !== null && props.editableRow?.id === row.id
}

const onPageChange = (event: DataTablePageEvent): void => {
  first.value = event.first
  internalPageSize.value = event.rows
  emit('lazy:load', event)
}

const onSortChange = (event: DataTableSortEvent): void => {
  sortField.value = typeof event.sortField === 'string' ? event.sortField : undefined
  sortOrder.value = typeof event.sortOrder === 'number' ? (event.sortOrder as 1 | -1) : undefined
  emit('lazy:load', event)
}

const onFilterChange = (event: DataTableFilterEvent): void => {
  emit('lazy:load', event)
}

const slots = useSlots()
const hasActionsSlot = computed((): boolean => !!slots.actions)
const hasTableHeaderSlot = computed((): boolean => !!slots['table-header'])

onMounted(() => {
  initFilters()
  emit('lazy:load', {
    first: first.value,
    rows: internalPageSize.value,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    filters: tableFilters.value,
  } as any)
})
</script>

<template>
  <div class="baseTable flex flex-col justify-between overflow-hidden shrink-0">
    <div
      v-if="hasTableHeaderSlot"
      class="baseTable__header border-b border-slate-100 p-4 sm:px-6 sm:py-4 bg-white flex items-center justify-between"
    >
      <slot name="table-header"></slot>
    </div>

    <!-- SKELETON STATE -->
    <BaseTableSkeleton
      v-if="props.loading"
      :columns="props.columns"
      :hasActionsSlot="hasActionsSlot"
    />

    <!-- DATA STATE -->
    <DataTable
      v-else
      v-model:filters="tableFilters"
      :value="props.rows"
      dataKey="id"
      class="p-datatable-sm overflow-x-auto w-full"
      :lazy="true"
      :paginator="props.paginator !== false"
      :rows="internalPageSize"
      :totalRecords="props.totalRecords"
      :rowsPerPageOptions="dynamicRowsPerPageOptions"
      :first="first"
      :sortField="sortField"
      :sortOrder="sortOrder"
      filterDisplay="menu"
      responsiveLayout="scroll"
      @page="onPageChange"
      @sort="onSortChange"
      @filter="onFilterChange"
    >
      <template #empty>
        <div class="p-8 text-center text-slate-400 text-sm font-medium">No records found.</div>
      </template>

      <!-- DYNAMIC COLUMNS -->
      <Column
        v-for="col in props.columns"
        :key="col.key"
        :field="col.key"
        :header="col.label"
        :sortable="col.sortable ?? true"
      >
        <!-- Custom Body Rendering -->
        <template #body="{ data }">
          <!-- 1. SLOT SPECIFIC FOR CELL -->
          <slot
            v-if="slots[`body-${col.key}`]"
            :name="`body-${col.key}`"
            :row="data"
            :value="data[col.key]"
          />

          <!-- 2. EDITING MODE FOR ROW -->
          <template v-else-if="isEditing(data)">
            <InputText
              v-if="col.type === 'text' || !col.type"
              v-model="tempRow[col.key]"
              class="w-full text-xs"
            />
            <DatePicker
              v-else-if="col.type === 'date'"
              v-model="tempRow[col.key]"
              dateFormat="yy-mm-dd"
              showIcon
              class="w-full text-xs"
            />
            <Select
              v-else-if="col.type === 'select'"
              v-model="tempRow[col.key]"
              :options="col.options || props.statusOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full text-xs"
            />
            <MultiSelect
              v-else-if="col.type === 'multi-select'"
              v-model="tempRow[col.key]"
              :options="col.options || props.multiSelectOption"
              optionLabel="label"
              optionValue="value"
              class="w-full text-xs"
            />
            <ToggleSwitch v-else-if="col.type === 'toggle'" v-model="tempRow[col.key]" />
          </template>

          <!-- 3. DEFAULT DISPLAY MODE -->
          <template v-else>
            <span
              v-if="col.type === 'text' || !col.type"
              class="text-xs sm:text-sm text-slate-700 font-medium"
            >
              {{ data[col.key] }}
            </span>
            <Tag
              v-else-if="col.type === 'status'"
              :value="data[col.key]"
              :severity="
                data[col.key] === 'Active' || data[col.key] === 'Completed' ? 'success' : 'warn'
              "
              class="!text-[11px] !py-0.5 !px-2 font-semibold"
            />
            <span v-else-if="col.type === 'date'" class="text-xs text-slate-500">
              {{ data[col.key] }}
            </span>
            <ToggleSwitch v-else-if="col.type === 'toggle'" :modelValue="data[col.key]" disabled />
          </template>
        </template>
      </Column>

      <!-- ROW ACTIONS -->
      <Column
        v-if="hasActionsSlot || props.editableRow !== undefined"
        header="Actions"
        class="w-[100px]"
      >
        <template #body="{ data }">
          <div v-if="isEditing(data)" class="flex items-center gap-1.5">
            <ActionButton icon="pi pi-check" variant="success" title="Save" @click="saveEdit()" />
            <ActionButton icon="pi pi-times" variant="danger" title="Cancel" @click="cancelEdit" />
          </div>
          <div v-else class="flex items-center gap-1">
            <slot name="actions" :row="data" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
