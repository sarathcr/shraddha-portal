<script setup lang="ts">
import { ProductService } from '@/services/ProductService'
import type { IProduct } from '@/types/index'
import { onMounted, ref } from 'vue'
import InfoCard from './components/InfoCard.vue'
import NotificationCard from './components/NotificationCard.vue'
import RecentEventsCard from './components/RecentEventsCard.vue'
import RevenueStreamCard from './components/RevenueStreamCard.vue'
import TournamentsCard from './components/TournamentsCard.vue'

// ---  STATE & STORE ---
const products = ref<IProduct[]>()

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  ProductService.getProductsMini()
    .then((data) => (products.value = data))
    .catch((error) => {
      console.error('Failed to fetch products:', error)
    })
})
</script>

<template>
  <div class="grid lg:grid-cols-4 gap-7">
    <InfoCard title="Events" value="52" icon="pi-calendar" color="blue">
      <template #footer> <span class="text-[#06B6D4]">24 new</span> since last visit </template>
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
</template>
