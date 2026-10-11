<script setup lang="ts">
import { ref, watch } from 'vue'
import Drawer from 'primevue/drawer'
import type { HistoryRecord, HistoryEntry } from '@/shared/types/history.types'
import { formatDate } from '@/shared/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  historyData: (HistoryRecord | HistoryEntry | any)[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const drawerVisible = ref(props.visible)

watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val
  },
)

watch(drawerVisible, (val) => {
  emit('update:visible', val)
})
</script>

<template>
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    header="Audit History"
    class="!w-[400px] !max-w-[90vw]"
  >
    <div v-if="historyData && historyData.length" class="flex flex-col gap-4 p-2">
      <div
        v-for="record in historyData"
        :key="record.id"
        class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs"
      >
        <div class="flex items-center justify-between font-semibold text-slate-800">
          <span class="capitalize">{{ record.action }}</span>
          <span class="text-[11px] text-slate-400">{{
            formatDate(record.performedAt || record.date)
          }}</span>
        </div>
        <span class="text-slate-500">By: {{ record.performedBy || record.user }}</span>
        <div v-if="record.field" class="text-slate-600 mt-1">
          Field: <strong>{{ record.field }}</strong>
          <span v-if="record.newValue"> &rarr; {{ record.newValue }}</span>
        </div>
      </div>
    </div>
    <div v-else class="p-4 text-center text-xs text-slate-400">No audit history available.</div>
  </Drawer>
</template>
