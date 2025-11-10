<script setup lang="ts">
import { useRoute } from 'vue-router'
import EventCard from './components/EventCard.vue'
import { useEvents } from './composables/useEvents'
const route = useRoute()
const eventTypeId = route.params.id as string

const { events, loading, error } = useEvents()
</script>

<template>
  <div>
    <h2>Events for Type ID: {{ eventTypeId }}</h2>
    <div v-if="loading" class="text-gray-500">Loading events...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid lg:grid-cols-4 gap-4">
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
