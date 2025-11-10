<script setup lang="ts">
import { Card } from 'primevue'

const props = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <Card class="w-full cursor-pointer hover:!bg-violet-50">
    <template #title
      ><p class="text-violet-600 uppercase text-lg">{{ props.title }}</p></template
    >
    <template #content>
      {{ props.description || 'No description available.' }}
    </template>
  </Card>
</template>
