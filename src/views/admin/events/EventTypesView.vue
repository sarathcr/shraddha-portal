<script setup lang="ts">
import EventTypeCard from './components/EventTypeCard.vue'

const eventTypes = [
  {
    title: 'Celebrations',
    description:
      'Company-wide festivals, annual days, and other special occasions celebrated together.',
  },
  {
    title: 'Birthdays',
    description:
      'Monthly birthday celebrations recognizing team members and fostering camaraderie.',
  },
  {
    title: 'MOM (Meetings)',
    description:
      'Official committee meetings with recorded Minutes of Meeting (MOM) for key decisions.',
  },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <EventTypeCard
      v-for="(event, index) in eventTypes"
      :key="index"
      :title="event.title"
      :description="event.description"
    />
  </div>
</template>
