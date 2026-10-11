<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'emblem' | 'full'
  }>(),
  {
    variant: 'emblem',
  },
)
</script>

<template>
  <div v-if="variant === 'full'" class="flex justify-center w-full">
    <img
      src="@/assets/logo-full.png"
      alt="Shraddha Logo"
      class="w-56 sm:w-64 h-auto object-contain"
    />
  </div>
  <div v-else class="logo flex items-center justify-center md:justify-start gap-3">
    <div class="figure logo__figure h-11 sm:h-12 w-auto flex items-center justify-center shrink-0">
      <img
        src="@/assets/logo-emblem.png"
        alt="Shraddha Logo"
        class="h-full w-auto object-contain"
      />
    </div>
    <div class="flex flex-col text-left leading-none">
      <h1 class="text-base sm:text-xl font-extrabold tracking-tight text-slate-900">SHRADDHA</h1>
      <span
        class="text-[9px] sm:text-[10px] font-bold text-indigo-600 tracking-wider mt-1 hidden sm:block uppercase"
        >Connect | Engage | Support</span
      >
    </div>
  </div>
</template>
