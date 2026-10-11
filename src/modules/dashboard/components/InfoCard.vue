<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string
    icon: string
    color?: 'blue' | 'orange' | 'cyan' | 'purple' | 'emerald' | 'indigo'
    trendValue?: string
    trendDirection?: 'up' | 'down' | 'neutral'
    trendLabel?: string
  }>(),
  {
    color: 'blue',
    trendDirection: 'up',
  },
)

interface ColorStyle {
  bg: string
  text: string
  ring: string
}

const colorClasses = computed((): ColorStyle => {
  switch (props.color) {
    case 'blue':
      return {
        bg: 'bg-indigo-50 text-indigo-600',
        text: 'text-indigo-600',
        ring: 'ring-indigo-100',
      }
    case 'orange':
      return {
        bg: 'bg-amber-50 text-amber-600',
        text: 'text-amber-600',
        ring: 'ring-amber-100',
      }
    case 'cyan':
      return {
        bg: 'bg-cyan-50 text-cyan-600',
        text: 'text-cyan-600',
        ring: 'ring-cyan-100',
      }
    case 'indigo':
    case 'purple':
      return {
        bg: 'bg-indigo-50 text-indigo-600',
        text: 'text-indigo-600',
        ring: 'ring-indigo-100',
      }
    case 'emerald':
      return {
        bg: 'bg-emerald-50 text-emerald-600',
        text: 'text-emerald-600',
        ring: 'ring-emerald-100',
      }
    default:
      return {
        bg: 'bg-slate-50 text-slate-600',
        text: 'text-slate-600',
        ring: 'ring-slate-100',
      }
  }
})
</script>

<template>
  <div
    class="bg-white w-full p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{
          title
        }}</span>
        <p class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ value }}</p>
      </div>

      <div
        class="size-11 rounded-xl flex items-center justify-center ring-4 transition-all duration-200 group-hover:scale-105"
        :class="[colorClasses.bg, colorClasses.ring]"
      >
        <i class="pi text-lg" :class="[icon, colorClasses.text]"></i>
      </div>
    </div>

    <!-- Trend Indicator or Custom Footer -->
    <div class="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
      <slot name="footer">
        <template v-if="trendValue">
          <span
            v-if="trendDirection === 'up'"
            class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-arrow-up-right text-[10px]"></i>
            {{ trendValue }}
          </span>
          <span
            v-else-if="trendDirection === 'down'"
            class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700"
          >
            <i class="pi pi-arrow-down-right text-[10px]"></i>
            {{ trendValue }}
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
          >
            {{ trendValue }}
          </span>
          <span v-if="trendLabel" class="text-slate-500">{{ trendLabel }}</span>
        </template>
      </slot>
    </div>
  </div>
</template>
