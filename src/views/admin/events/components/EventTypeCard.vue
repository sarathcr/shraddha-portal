<script setup lang="ts">
import { Card } from 'primevue'

const props = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <Card class="w-80 cursor-pointer hover:!bg-gray-50">
    <template #title>{{ props.title }}</template>
    <template #content>
      <p class="m-0">
        {{ props.description || 'No description available.' }}
      </p>
    </template>
  </Card>
</template>
