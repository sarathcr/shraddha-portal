<script setup lang="ts">
import Button from 'primevue/button'

defineEmits(['cancel', 'submit'])
</script>

<template>
  <div class="flex justify-end gap-2 mt-4 sticky bottom-0">
    <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
    <Button label="Save" @click="$emit('submit')" />
  </div>
</template>
