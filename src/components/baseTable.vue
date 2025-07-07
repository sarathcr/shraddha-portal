<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface ColumnDef {
  label: string
  key: string
  filterable?: boolean
}

interface RowData {
  [key: string]: unknown
}

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowData[]
  pageSize?: number
  editableRow?: RowData | null
}>()

const emit = defineEmits<{
  (e: 'save', row: RowData): void
  (e: 'cancel'): void
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

const filters = ref<Record<string, { value: string; matchMode: string }>>({})
const conditionDropdown = ref<Record<string, string>>({})
const conditionInput = ref<Record<string, string>>({})

props.columns.forEach((col) => {
  if (col.filterable) {
    filters.value[col.key] = {
      value: '',
      matchMode: FilterMatchMode.CONTAINS,
    }
    conditionDropdown.value[col.key] = FilterMatchMode.CONTAINS
    conditionInput.value[col.key] = ''
  }
})

const applyFilter = (key: string): void => {
  filters.value[key] = {
    value: conditionInput.value[key],
    matchMode: conditionDropdown.value[key],
  }
}
</script>

<template>
  <div class="space-y-4">
    <DataTable
      :value="rows"
      :filters="filters"
      filterDisplay="menu"
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
        :filterField="col.key"
        style="min-width: 200px"
      >
        <template #body="{ data }">
          <div v-if="editableRow === data">
            <InputText v-model="tempRow[col.key] as string" class="w-full" />
          </div>
          <div v-else>
            {{ data[col.key] }}
          </div>
        </template>

        <template v-if="col.filterable" #filter="{ filterCallback }">
          <div class="flex flex-col gap-2">
            <InputText
              v-model="conditionInput[col.key]"
              class="w-full"
              :placeholder="`Enter ${col.label}`"
            />
            <Button
              label="Apply"
              size="small"
              @click="
                () => {
                  applyFilter(col.key)
                  filterCallback()
                }
              "
              class="w-full"
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
            <slot name="actions" :row="data" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
