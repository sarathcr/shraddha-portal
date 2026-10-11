<script setup lang="ts">
interface ActivityItem {
  id: string
  title: string
  detail?: string
  time: string
  icon: string
  iconColor: string
  bgColor: string
  period: 'Today' | 'Yesterday'
}

const activities: ActivityItem[] = [
  {
    id: '1',
    title: 'Justin Thomas requested ₹ 200 for event refreshments',
    time: '12m ago',
    icon: 'pi pi-wallet',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    period: 'Today',
  },
  {
    id: '2',
    title: 'Equipment budget for Shuttlecocks was approved',
    time: '2h ago',
    icon: 'pi pi-check-circle',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    period: 'Today',
  },
  {
    id: '3',
    title: 'New member registration completed: Alex Doe',
    time: 'Yesterday, 4:15 PM',
    icon: 'pi pi-user-plus',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    period: 'Yesterday',
  },
  {
    id: '4',
    title: 'Monthly Committee Minutes published for review',
    time: 'Yesterday, 11:30 AM',
    icon: 'pi pi-file-check',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    period: 'Yesterday',
  },
]
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 w-full"
  >
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          Recent Activity
        </h2>
        <p class="text-xs text-slate-500">Real-time alerts, claims, and approval updates</p>
      </div>

      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
      >
        <span class="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        Live
      </span>
    </div>

    <!-- Activity Stream -->
    <div class="flex flex-col gap-4">
      <!-- Today Section -->
      <div>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2"
          >Today</span
        >
        <div class="flex flex-col gap-2">
          <div
            v-for="item in activities.filter((a) => a.period === 'Today')"
            :key="item.id"
            class="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div
              class="size-8 rounded-lg flex items-center justify-center shrink-0"
              :class="item.bgColor"
            >
              <i :class="[item.icon, item.iconColor]" class="text-sm"></i>
            </div>
            <div class="flex flex-col gap-0.5 grow min-w-0">
              <p class="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                {{ item.title }}
              </p>
              <span class="text-[11px] text-slate-400">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Yesterday Section -->
      <div class="pt-2 border-t border-slate-100">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2"
          >Yesterday</span
        >
        <div class="flex flex-col gap-2">
          <div
            v-for="item in activities.filter((a) => a.period === 'Yesterday')"
            :key="item.id"
            class="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div
              class="size-8 rounded-lg flex items-center justify-center shrink-0"
              :class="item.bgColor"
            >
              <i :class="[item.icon, item.iconColor]" class="text-sm"></i>
            </div>
            <div class="flex flex-col gap-0.5 grow min-w-0">
              <p class="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                {{ item.title }}
              </p>
              <span class="text-[11px] text-slate-400">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
