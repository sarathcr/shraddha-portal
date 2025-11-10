<script setup lang="ts">
import { Card } from 'primevue'

const props = defineProps<{
  id: string
  title: string
  description?: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string | number): void
}>()
</script>

<template>
  <Card class="w-full cursor-pointer hover:!bg-violet-50" @click="emit('select', props.id)">
    <template #title
      ><p class="text-violet-600 capitalize font-semibold text-lg">{{ props.title }}</p></template
    >
    <template #content>
      {{ props.description || 'No description available.' }}
    </template>
  </Card>
</template>
