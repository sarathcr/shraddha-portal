<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon: string
    title?: string
    variant?: 'default' | 'danger' | 'info' | 'success'
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
    case 'success':
      return 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
    case 'info':
    case 'default':
    default:
      return 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
  }
})
</script>

<template>
  <button
    type="button"
    :title="props.title"
    :aria-label="props.title"
    :disabled="props.disabled"
    class="size-8 rounded-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
    @click="(e) => emit('click', e)"
  >
    <i :class="props.icon" class="text-xs"></i>
  </button>
</template>
