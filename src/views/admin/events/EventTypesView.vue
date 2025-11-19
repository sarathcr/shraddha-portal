<script setup lang="ts">
import EventTypeCardSkeleton from '@/components/Skelton/EventTypeCardSkeleton.vue'
import EventTypeCard from './components/EventTypeCard.vue'
import { useEventTypes } from './composables/useEventTypes'
import { Toast } from 'primevue'
import { useRouter } from 'vue-router'
import PageTitle from '@/components/PageTitle.vue'
import { useHistory } from '@/composables/useHistory'
import HistoryDrawer from '@/components/HistoryDrawer.vue'

const { eventTypes, loading, error } = useEventTypes()
const router = useRouter()

const { historyDrawerVisible, historyData, loadHistory } = useHistory()

const openHistory = async (id: string): Promise<void> => {
  await loadHistory('eventType', id)
}

const handleSelect = async (payload: { id: string; name: string }): Promise<void> => {
  await router.push({
    path: `/admin/events/${payload.id}`,
    query: { name: payload.name },
  })
}
</script>

<template>
  <div>
    <Toast />
    <PageTitle pageName="Event Types" />
    <div v-if="loading" class="grid lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      <EventTypeCardSkeleton v-for="i in 4" :key="i" />
    </div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      <EventTypeCard
        v-for="event in eventTypes"
        :key="event.eventTypeName"
        :id="event.id"
        :title="event.eventTypeName"
        :description="event.description"
        @select="handleSelect"
        @history="openHistory"
      />
    </div>
    <HistoryDrawer v-model:visible="historyDrawerVisible" :historyData="historyData" />
  </div>
</template>
