<script setup lang="ts">
const props = defineProps<{
  title?: string
  pageName?: string
}>()
</script>

<template>
  <h1 class="text-xl font-bold text-slate-800">{{ props.title || props.pageName }}</h1>
</template>
