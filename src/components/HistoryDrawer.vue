<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import Drawer from 'primevue/drawer'
import type { HistoryEntry } from '@/types/history'

const props = defineProps<{
  visible: boolean
  historyData: HistoryEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const localVisible = ref(props.visible)

watch(
  () => props.visible,
  (val) => {
    localVisible.value = val
  },
)

watch(localVisible, (val) => {
  emit('update:visible', val)
})
</script>

<template>
  <Drawer
    v-model:visible="localVisible"
    header="History"
    position="right"
    :dismissable="true"
    :modal="true"
  >
    <div v-if="props.historyData?.length" class="mt-3 flex flex-col">
      <div v-for="entry in props.historyData" :key="entry.id" class="p-3 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <i
            :class="[
              'pi border-1 p-2 rounded-full border-gray-400',
              entry.action === 'created' ? 'pi-plus' : 'pi-pencil',
            ]"
          ></i>
          <div>
            <p>
              <span class="capitalize">{{ entry.action }}</span>
              by <span class="font-bold">{{ entry.user }}</span>
            </p>
            <div v-if="entry.field" class="text-sm">
              <p>
                {{ entry.field }}:
                <span v-if="entry.oldValue" class="line-through text-gray-500">
                  {{ entry.oldValue }}
                </span>
                <span v-if="entry.newValue"> to {{ entry.newValue }}</span>
              </p>
            </div>

            <p class="italic text-xs text-gray-600">on {{ entry.date }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-4 text-gray-500 italic text-center">No history available.</div>
  </Drawer>
</template>

<style scoped>
.p-drawer-content {
  overflow-y: auto;
  max-height: calc(100vh - 5rem);
}
</style>
