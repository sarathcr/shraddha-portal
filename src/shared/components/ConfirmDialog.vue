<script setup lang="ts">
import Dialog from 'primevue/dialog'
import AppButton from '@/shared/components/AppButton.vue'

withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'primary' | 'secondary' | 'danger'
    icon?: string
    iconClass?: string
    loading?: boolean
    width?: string
  }>(),
  {
    title: 'Confirm Deletion',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    icon: 'pi pi-exclamation-triangle',
    iconClass: 'text-red-600 text-3xl',
    loading: false,
    width: '30rem',
  },
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const onCancel = (): void => {
  emit('update:visible', false)
  emit('cancel')
}

const onConfirm = (): void => {
  emit('confirm')
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="title"
    :style="{ width }"
    modal
    @update:visible="(val) => emit('update:visible', val)"
    @hide="onCancel"
  >
    <div class="flex items-center gap-4">
      <i :class="[icon, iconClass]" />
      <span class="text-slate-700 text-sm leading-relaxed">{{ message }}</span>
    </div>
    <template #footer>
      <AppButton :label="cancelLabel" variant="secondary" @click="onCancel" />
      <AppButton
        :label="confirmLabel"
        :variant="confirmVariant"
        :loading="loading"
        @click="onConfirm"
      />
    </template>
  </Dialog>
</template>
