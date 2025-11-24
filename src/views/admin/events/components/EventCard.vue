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
          class="rounded-t-lg border-gray-300 w-full"
        />
      </figure>
    </template>
    <template #title
      ><p class="text-violet-500 font-semibold text-lg">{{ props.name }}</p></template
    >
    <template #content>
      <p>
        {{ props.description }}
      </p>
    </template>
    <template #footer>
      <p
        v-if="props.startDate !== props.endDate"
        class="italic flex flex-row-reverse mt-auto text-sm"
      >
        {{ props.startDate }} - {{ props.endDate }}
      </p>
      <p v-else class="italic flex flex-row-reverse mt-auto text-sm">{{ props.startDate }}</p>
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
