<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import EventCard from './components/EventCard.vue'
import EventCardSkeleton from '@/components/Skelton/EventCardSkeleton.vue'
import { useEvents } from './composables/useEvents'
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'

const route = useRoute()

const eventTypeId = String(route.params.id)
const eventTypeName =
  (Array.isArray(route.query.name) ? route.query.name[0] : route.query.name) || ''
const scrollContainer = ref<HTMLElement | null>(null)

const { events, loading, error, hasMore, loadEvents, loadMore } = useEvents()

const handleScroll = (): void => {
  if (!hasMore.value || loading.value) {
    return
  }

  const bottomReached = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200

  if (bottomReached) {
    void loadMore({ eventTypeId })
  }
}

onMounted(() => {
  void loadEvents({ eventTypeId })
  scrollContainer.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div ref="scrollContainer" class="overflow-y-auto">
    <PageTitle :pageName="eventTypeName" />

    <div
      v-if="loading && events.length === 0"
      class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4"
    >
      <EventCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      <EventCard
        v-for="(event, index) in events"
        :key="index"
        :name="event.name"
        :description="event.description"
        :startDate="event.startDate"
        :endDate="event.endDate"
        :status="event.status"
      />
    </div>

    <div v-if="loading && events.length > 0" class="p-4 grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <EventCardSkeleton v-for="i in 4" :key="'lazy-' + i" />
    </div>
  </div>
</template>
