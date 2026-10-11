<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  colorClasses: {
    bg: string
    text: string
  }
  countValue?: number
  countLabel?: string
}>()
</script>

<template>
  <div
    class="bg-white w-full p-4 min-h-[120px] rounded-md shadow-md hover:bg-gray-50 cursor-pointer transition relative"
  >
    <div
      class="absolute top-4 right-4 p-3 rounded-md flex items-center justify-center"
      :class="colorClasses.bg"
    >
      <i class="text-xl" :class="[icon, colorClasses.text]"></i>
    </div>

    <div class="flex flex-col justify-between h-full pr-16">
      <h2 class="text-base font-semibold text-gray-800">{{ title }}</h2>
      <p class="text-black text-2xl">{{ countValue }}</p>
      <p v-if="countValue !== undefined && countLabel" class="text-sm text-gray-500 mt-2">
        {{ countValue }} <span class="lowercase">{{ countLabel }}</span>
      </p>
    </div>
  </div>
</template>
