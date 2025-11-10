<script setup lang="ts">
import { Card } from 'primevue'
const props = defineProps<{
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
}>()
</script>

<template>
  <Card class="cursor-pointer">
    <template #header>
      <figure>
        <img
          alt="user header"
          src="../../../../assets/events/istockphoto-1371940128-612x612.jpg"
          class="rounded-t-lg border-b-3 border-gray-300 w-full"
        />
      </figure>
    </template>
    <template #title>{{ props.name }}</template>
    <template #content>
      <p>
        {{ props.description }}
      </p>
    </template>
    <template #footer>
      <p class="italic flex flex-row-reverse mt-auto">{{ props.startDate }}</p>
    </template>
  </Card>
</template>

<style>
.p-card-body {
  height: 100%;
}
.p-card-footer {
  margin-top: auto;
}
</style>
