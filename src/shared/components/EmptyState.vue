<script setup lang="ts">
import AppButton from './AppButton.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    icon?: string
    actionLabel?: string
    actionIcon?: string
    showAction?: boolean
  }>(),
  {
    title: 'No Data Available',
    description: 'There are no records to display at the moment.',
    icon: 'pi pi-inbox',
    actionLabel: '',
    actionIcon: 'pi pi-plus',
    showAction: false,
  },
)

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div
    class="empty-state w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-14 text-center flex flex-col items-center justify-center my-6 min-h-[360px] transition-all duration-200"
  >
    <div
      class="size-16 sm:size-20 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 sm:mb-5 shadow-xs"
    >
      <slot name="icon">
        <i :class="[props.icon, 'text-2xl sm:text-3xl']"></i>
      </slot>
    </div>

    <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-1.5 tracking-tight">
      <slot name="title">{{ props.title }}</slot>
    </h3>

    <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
      <slot name="description">{{ props.description }}</slot>
    </p>

    <div v-if="props.showAction || $slots.action">
      <slot name="action">
        <AppButton
          v-if="props.actionLabel"
          :label="props.actionLabel"
          :icon="props.actionIcon"
          variant="primary"
          @click="emit('action')"
        />
      </slot>
    </div>
  </div>
</template>
