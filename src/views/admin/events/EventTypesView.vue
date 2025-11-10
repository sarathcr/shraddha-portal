<script setup lang="ts">
import EventTypeCardSkeleton from '@/components/Skelton/EventTypeCardSkeleton.vue'
import EventTypeCard from './components/EventTypeCard.vue'
import { useEventTypes } from './composables/useEventTypes'
import { Toast } from 'primevue'

const { eventTypes, loading, error } = useEventTypes()
</script>

<template>
  <div class="p-4">
    <Toast />
    <div v-if="loading" class="grid lg:grid-cols-4 gap-4">
      <EventTypeCardSkeleton v-for="i in 4" :key="i" />
    </div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid lg:grid-cols-4 gap-4">
      <EventTypeCard
        v-for="event in eventTypes"
        :key="event.eventTypeName"
        :title="event.eventTypeName"
        :description="event.description"
      />
    </div>
  </div>
</template>
