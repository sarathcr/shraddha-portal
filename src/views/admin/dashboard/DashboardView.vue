<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import HeaderView from '@/components/HeaderView.vue'
import SidebarView from '@/components/SidebarView.vue'
import { ProductService } from '@/services/ProductService'
import { useSidebarStore } from '@/stores/sidebar'
import type { IProduct } from '@/types/index'
import InfoCard from './components/InfoCard.vue'
import NotificationCard from './components/NotificationCard.vue'
import RecentEventsCard from './components/RecentEventsCard.vue'
import RevenueStreamCard from './components/RevenueStreamCard.vue'
import TournamentsCard from './components/TournamentsCard.vue'

// ---  STATE & STORE ---
const sidebarStore = useSidebarStore()
const products = ref<IProduct[]>()

const screenWidth = ref(window.innerWidth)
const isDesktop = computed(() => screenWidth.value >= 1024)

const updateScreenWidth = (): void => {
  screenWidth.value = window.innerWidth
}

watch(isDesktop, (isNowDesktop, wasPreviouslyDesktop) => {
  // This check prevents the watch from running on initial component load
  if (wasPreviouslyDesktop === undefined) {
    return
  }

  // If we just resized from mobile to desktop, show the sidebar.
  if (isNowDesktop && !wasPreviouslyDesktop) {
    sidebarStore.showSidebar()
  }

  // If we just resized from desktop to mobile, hide the sidebar.
  if (!isNowDesktop && wasPreviouslyDesktop) {
    sidebarStore.hideSidebar()
  }
})

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  ProductService.getProductsMini()
    .then((data) => (products.value = data))
    .catch((error) => {
      console.error('Failed to fetch products:', error)
    })

  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<template>
  <div class="dashboard min-h-screen flex flex-col bg-[#f1f5f9]">
    <div class="dashboard__header">
      <HeaderView />
    </div>

    <div
      class="dashboard__main p-8 grow-1 flex"
      :class="[sidebarStore.isSidebarVisible && isDesktop ? 'gap-[30px]' : 'gap-0']"
    >
      <div
        class="dashboard__sidebar transition-all duration-400 ease-in-out"
        :class="[sidebarStore.isSidebarVisible && isDesktop ? 'w-[240px]' : 'w-0']"
      >
        <div class="w-[240px] bg-white">
          <SidebarView />
        </div>
      </div>

      <div
        class="dashboard__content w-full flex flex-col gap-7 lg:h-[calc(100vh-126px)] overflow-auto"
      >
        <div class="grid lg:grid-cols-4 gap-7">
          <InfoCard title="Events" value="52" icon="pi-calendar" color="blue">
            <template #footer>
              <span class="text-[#06B6D4]">24 new</span> since last visit
            </template>
          </InfoCard>
          <InfoCard title="Revenue" value="₹ 18K" icon="pi-money-bill" color="orange">
            <template #footer> <span class="text-[#06B6D4]">%10+</span> since last visit </template>
          </InfoCard>
          <InfoCard title="Members" value="80" icon="pi-users" color="cyan">
            <template #footer> <span class="text-[#06B6D4]">10</span> newly registered </template>
          </InfoCard>
          <InfoCard title="Feedbacks" value="80" icon="pi-inbox" color="purple">
            <template #footer>
              <span class="text-sm"> <span class="text-black font-bold">80</span> Unread </span>
            </template>
          </InfoCard>
        </div>

        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-7 grow-1">
          <RecentEventsCard :products="products" />
          <RevenueStreamCard />
        </div>

        <div class="grid lg:grid-cols-2 gap-7">
          <TournamentsCard />
          <NotificationCard />
        </div>
      </div>
    </div>
  </div>
</template>
