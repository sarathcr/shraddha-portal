<script setup lang="ts">
import { ref } from 'vue'
import { Column, DataTable } from 'primevue'
import type { IProduct } from '@/types'

defineProps<{
  products?: IProduct[]
}>()

const columns = ref([
  { field: 'code', header: 'Code' },
  { field: 'name', header: 'Name' },
  { field: 'category', header: 'Category' },
  { field: 'quantity', header: 'Quantity' },
])
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2>Recent Events</h2>

    <div class="overflow-x-auto">
      <DataTable :value="products" :rows="3" tableStyle="min-width: 50rem">
        <Column
          v-for="col of columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>
