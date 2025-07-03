<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <input
        v-model="globalSearch"
        type="text"
        placeholder="Search..."
        class="px-3 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <div class="flex items-center gap-2">
        <slot name="header-right" />
      </div>
    </div>

    <!-- Table -->
    <table class="w-full border-collapse mb-4 text-sm">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 bg-gray-100 font-semibold text-left hover:bg-gray-200 active:bg-gray-200 transition-colors cursor-pointer"
          >
            <div class="flex flex-col gap-2">
              {{ col.label }}
              <input
                v-if="col.filterable"
                v-model="filters[col.key]"
                type="text"
                :placeholder="`Filter ${col.label}`"
                class="px-2 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </th>
          <th
            v-if="$slots.actions"
            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 transition-colors font-semibold text-left"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in paginatedRows"
          :key="rowIndex"
          class="border-b border-gray-200 hover:bg-gray-200 transition-colors"
        >
          <td v-for="col in columns" :key="col.key" class="px-4 py-2">
            {{ row[col.key] }}
          </td>
          <td v-if="$slots.actions" class="px-4 py-6">
            <slot name="actions" :row="row" :index="rowIndex" />
          </td>
        </tr>
        <tr v-if="paginatedRows.length === 0">
          <td
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
            class="text-center px-4 py-4 text-gray-500"
          >
            No data found.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-4">
      <Button
        icon="pi pi-chevron-left"
        text
        rounded
        :disabled="currentPage === 1"
        @click="currentPage--"
      />

      <span class="text-sm">Page</span>

      <select
        v-model="currentPage"
        class="px-2 py-1 rounded-md text-sm border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option v-for="page in totalPages" :key="page" :value="page">
          {{ page }}
        </option>
      </select>

      <span class="text-sm">of {{ totalPages }}</span>

      <Button
        icon="pi pi-chevron-right"
        text
        rounded
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, reactive } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{
  columns: Array<{
    label: string
    key: string
    filterable?: boolean
  }>
  rows: Array<Record<string, unknown>>
  pageSize?: number
}>()

const emit = defineEmits(['update:filters'])

const currentPage = ref(1)
const filters = reactive<Record<string, string>>({})
const globalSearch = ref('')

const pageSize = computed(() => props.pageSize || 5)

const filteredRows = computed(() => {
  return props.rows.filter((row) => {
    const globalMatch = globalSearch.value
      ? Object.values(row).some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(globalSearch.value.toLowerCase()),
        )
      : true

    const columnMatch = props.columns.every((col) => {
      if (!col.filterable || !filters[col.key]) return true
      const cell = String(row[col.key] ?? '').toLowerCase()
      return cell.includes(filters[col.key].toLowerCase())
    })

    return globalMatch && columnMatch
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)),
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRows.value.slice(start, end)
})

watch([(): Record<string, unknown>[] => props.rows, filters, globalSearch], () => {
  currentPage.value = 1
})

watch(filters, (newFilters) => {
  emit('update:filters', { ...newFilters })
})
</script>
