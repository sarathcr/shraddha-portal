<script setup lang="ts">
import { Card } from 'primevue'

const props = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <Card class="w-full cursor-pointer hover:!bg-gray-50">
    <template #title>{{ props.title }}</template>
    <template #content>
      {{ props.description || 'No description available.' }}
    </template>
  </Card>
</template>
