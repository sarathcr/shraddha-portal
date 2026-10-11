<script setup lang="ts">
import { Card } from 'primevue'

const props = defineProps<{
  id: string
  title: string
  description?: string
}>()

const emit = defineEmits<{
  (e: 'select', payload: { id: string; name: string }): void
  (e: 'history', id: string): void
}>()
</script>

<template>
  <Card
    class="w-full cursor-pointer hover:!bg-violet-50"
    @click="emit('select', { id: props.id, name: props.title })"
  >
    <template #title>
      <p class="text-violet-600 capitalize font-semibold text-lg">{{ props.title }}</p></template
    >
    <template #content>
      <div class="flex items-center justify-between">
        <p>{{ props.description || 'No description available.' }}</p>
        <i
          class="pi pi-history hover:bg-violet-100 p-2 rounded"
          @click.stop="emit('history', props.id)"
        ></i>
      </div>
    </template>
  </Card>
</template>
