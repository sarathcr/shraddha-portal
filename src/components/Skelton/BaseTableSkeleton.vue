<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

defineProps<{
  columnsCount: number // Number of columns in your table
  rowsCount?: number // Number of skeleton rows to display
}>()
</script>

<template>
  <DataTable
    :value="Array(rowsCount || 10).fill({})"
    :paginator="true"
    :rows="rowsCount || 10"
    :rowsPerPageOptions="[5, 10, 20]"
    dataKey="id"
    class="min-w-full"
    paginatorPosition="bottom"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <Skeleton width="10rem" height="2rem" class="mr-2"></Skeleton>
        <Skeleton width="8rem" height="2rem"></Skeleton>
      </div>
    </template>

    <Column v-for="i in columnsCount - 1" :key="i" style="min-width: 200px">
      <template #header>
        <Skeleton width="7rem" height="1.5rem"></Skeleton>
      </template>
      <template #body>
        <Skeleton></Skeleton>
      </template>
      <template #filter>
        <Skeleton width="100%" height="2rem"></Skeleton>
      </template>
    </Column>

    <Column style="min-width: 150px">
      <template #header>
        <Skeleton width="5rem" height="1.5rem"></Skeleton>
      </template>
      <template #body>
        <Skeleton width="5rem" height="2rem"></Skeleton>
      </template>
      <template #filter>
        <Skeleton width="100%" height="2rem"></Skeleton>
      </template>
    </Column>
  </DataTable>
</template>
