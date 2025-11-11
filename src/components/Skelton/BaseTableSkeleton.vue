<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const props = defineProps<{
  columnsCount: number
  rowsCount?: number
}>()
const visibleRows = props.rowsCount && props.rowsCount < 9 ? props.rowsCount : 9
</script>

<template>
  <div class="base-table-skeleton">
    <DataTable
      :value="Array(visibleRows).fill({})"
      :paginator="false"
      :rows="visibleRows"
      dataKey="id"
      class="min-w-full"
      scrollable
    >
      <template #header>
        <div class="flex justify-between items-center w-full">
          <Skeleton width="8rem" height="3rem" class="mr-2"></Skeleton>
        </div>
      </template>

      <Column v-for="i in columnsCount - 1" :key="i" style="min-width: 200px">
        <template #header>
          <Skeleton width="7rem" height="2rem" />
        </template>
        <template #body>
          <Skeleton />
        </template>
        <template #filter>
          <Skeleton width="100%" height="2rem" />
        </template>
      </Column>

      <Column style="min-width: 150px">
        <template #header>
          <Skeleton width="5rem" height="2rem" />
        </template>
        <template #body>
          <Skeleton width="5rem" height="2rem" />
        </template>
        <template #filter>
          <Skeleton width="100%" height="2rem" />
        </template>
      </Column>
    </DataTable>

    <div class="p-datatable-paginator p-datatable-paginator-bottom">
      <div
        class="p-paginator p-component p-paginator-bottom flex items-center justify-between px-3"
      >
        <div class="flex items-center gap-2">
          <Skeleton width="2rem" height="2rem" />
          <Skeleton width="2rem" height="2rem" />

          <div class="flex items-center gap-2 px-2">
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
          </div>

          <Skeleton width="2rem" height="2rem" />
          <Skeleton width="2rem" height="2rem" />
        </div>

        <div class="flex items-center gap-2">
          <Skeleton width="6rem" height="2.2rem" />
        </div>
      </div>
    </div>
  </div>
</template>
