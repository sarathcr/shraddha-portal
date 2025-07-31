<script setup lang="ts">
import type { IProduct } from '@/types'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { useDashboard } from '../composable/useDashboard'

// eslint-disable-next-line vue/no-dupe-keys
const { moms } = useDashboard()

defineProps<{
  moms: IProduct[]
}>()
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2>Recent MOM</h2>

    <div class="overflow-x-auto">
      <DataTable :value="moms" :rows="5" tableStyle="min-width: 30rem">
        <Column field="date" header="Date" />
        <Column header="Link">
          <template #body="slotProps">
            <a
              :href="slotProps.data.pdfUrl"
              target="_blank"
              rel="noopener"
              class="text-blue-600 hover:underline"
            >
              View Mom
            </a>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
