<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

const props = withDefaults(
  defineProps<{
    label?: string
    icon?: string
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'small' | 'normal' | 'large'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'normal',
    disabled: false,
    loading: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return '!bg-white hover:!bg-slate-50 !border !border-slate-200 !text-slate-700 !shadow-xs'
    case 'danger':
      return '!bg-rose-600 hover:!bg-rose-700 !border-0 !text-white !shadow-xs'
    case 'ghost':
      return '!bg-transparent hover:!bg-slate-100 !border-0 !text-slate-600'
    case 'primary':
    default:
      return '!bg-indigo-600 hover:!bg-indigo-700 !border-0 !text-white !shadow-xs'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return '!h-8 !px-3 !py-1.5 text-xs !rounded-lg'
    case 'large':
      return '!h-11 !px-5 !py-2.5 text-sm sm:text-base !rounded-xl'
    case 'normal':
    default:
      return '!h-9 sm:!h-10 !px-4 !py-2 text-xs sm:text-sm !rounded-xl'
  }
})
</script>

<template>
  <Button
    :label="props.label"
    :icon="props.icon"
    :disabled="props.disabled || props.loading"
    :loading="props.loading"
    :type="props.type"
    :class="[
      '!inline-flex !items-center !justify-center !gap-2 !font-semibold active:scale-95 transition-all duration-150 cursor-pointer shadow-xs',
      variantClasses,
      sizeClasses,
    ]"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </Button>
</template>
