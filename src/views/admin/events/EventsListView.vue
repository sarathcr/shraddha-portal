<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import EventCard from './components/EventCard.vue'
import { useEvents } from './composables/useEvents'
import EventCardSkeleton from '@/components/Skelton/EventCardSkeleton.vue'

const { events, loading, error } = useEvents()
</script>

<template>
  <div>
    <PageTitle pageName="Celebrations" />
    <div v-if="loading" class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      <EventCardSkeleton v-for="i in 4" :key="i" />
    </div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
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
  </div>
</template>
