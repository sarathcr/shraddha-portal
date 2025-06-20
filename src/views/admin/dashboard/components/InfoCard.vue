<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string
  icon: string
  color: 'blue' | 'orange' | 'cyan' | 'purple'
}>()

const colorClasses = computed(() => {
  switch (props.color) {
    case 'blue':
      return {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#3B82F6]',
      }
    case 'orange':
      return {
        bg: 'bg-[#FFEDD5]',
        text: 'text-[#F97316]',
      }
    case 'cyan':
      return {
        bg: 'bg-[#CFFAFE]',
        text: 'text-[#06B6D4]',
      }
    case 'purple':
      return {
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#A855F7]',
      }
    default:
      return {
        bg: 'bg-gray-200',
        text: 'text-gray-800',
      }
  }
})
</script>

<template>
  <div class="bg-white w-full p-4 flex flex-col justify-between gap-3.5 rounded-md shadow-md">
    <div class="flex justify-between">
      <div class="flex flex-col justify-between gap-3.5">
        <h2>{{ title }}</h2>
        <p class="text-black text-2xl">{{ value }}</p>
      </div>
      <div
        class="p-3 rounded-md size-[40px] flex items-center justify-center"
        :class="colorClasses.bg"
      >
        <i class="pi" :class="[icon, colorClasses.text]"></i>
      </div>
    </div>
    <p>
      <slot name="footer"></slot>
    </p>
  </div>
</template>
