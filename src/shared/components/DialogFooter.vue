<script setup lang="ts">
import AppButton from '@/shared/components/AppButton.vue'

defineProps<{
  saveLabel?: string
  cancelLabel?: string
  saveLoading?: boolean
  saveDisabled?: boolean
  submitType?: 'button' | 'submit'
  saveVariant?: 'primary' | 'secondary' | 'danger'
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <div class="flex justify-end gap-2 mt-4 sticky bottom-0">
    <AppButton :label="cancelLabel || 'Cancel'" variant="secondary" @click="$emit('cancel')" />
    <AppButton
      :type="submitType || 'button'"
      :label="saveLabel || 'Save'"
      :variant="saveVariant || 'primary'"
      :loading="saveLoading"
      :disabled="saveDisabled"
      @click="$emit('submit')"
    />
  </div>
</template>
