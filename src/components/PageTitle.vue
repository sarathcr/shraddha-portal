<script setup lang="ts">
const props = defineProps<{ pageName: string }>()
</script>

<template>
  <h2 class="font-semibold text-2xl">
    {{ props.pageName }}
  </h2>
</template>
