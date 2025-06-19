<script setup lang="ts">
import HeaderView from '@/components/HeaderView.vue'
import SidebarView from '@/components/SidebarView.vue'
import { ProductService } from '@/services/ProductService'
import { useSidebarStore } from '@/stores/sidebar'
import { Column, DataTable, Divider, ProgressBar } from 'primevue'
import Chart from 'primevue/chart'
import { onMounted, ref } from 'vue'
const sidebarStore = useSidebarStore()
onMounted(() => {
  ProductService.getProductsMini()
    .then((data) => (products.value = data))
    .catch((error) => {
      console.error('Failed to fetch products:', error)
    })

  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})
const chartData = ref()
const chartOptions = ref()

const setChartData = (): object => {
  const documentStyle = getComputedStyle(document.documentElement)

  return {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        type: 'bar',
        label: 'Dataset 1',
        backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
        data: [50, 25, 12, 48, 90, 76, 42],
      },
      {
        type: 'bar',
        label: 'Dataset 2',
        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
        data: [21, 84, 24, 75, 37, 65, 34],
      },
      {
        type: 'bar',
        label: 'Dataset 3',
        backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
        data: [41, 52, 24, 74, 23, 21, 32],
      },
    ],
  }
}

const setChartOptions = (): object => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },
  }
}
const products = ref()
const columns = [
  { field: 'code', header: 'Code' },
  { field: 'name', header: 'Name' },
  { field: 'category', header: 'Category' },
  { field: 'quantity', header: 'Quantity' },
]
</script>

<template>
  <div class="dashboard h-screen flex flex-col bg-[#f1f5f9]">
    <div class="dashboard__header">
      <HeaderView />
    </div>
    <div
      class="dashboard__main p-8 grow-1 flex"
      :class="[!sidebarStore.isSidebarVisible ? 'gap-0' : 'gap-[70px]']"
    >
      <div
        class="dashboard__sidebar transition-all duration-400 ease-in-out"
        :class="[sidebarStore.isSidebarVisible ? 'w-[240px]' : 'w-0']"
      >
        <SidebarView />
      </div>

      <div class="dashboard__content w-full flex flex-col gap-7 justify-between">
        <!-- First Mini Cards Section -->
        <div class="grid grid-cols-4 gap-7">
          <!-- Card 1 - Events -->
          <div
            class="bg-white w-full p-4 flex flex-col justify-between gap-3.5 rounded-md shadow-md"
          >
            <div class="flex justify-between">
              <div class="flex flex-col justify-between gap-3.5">
                <h2>Events</h2>
                <p class="text-black text-2xl">52</p>
              </div>
              <div class="bg-[#DBEAFE] p-3 rounded-md size-[40px] flex items-center justify-center">
                <i class="pi pi-calendar text-[#3B82F6]"></i>
              </div>
            </div>
            <p><span class="text-[#06B6D4]">24 new</span> since last visit</p>
          </div>
          <!-- Card 2 - Revenue -->
          <div
            class="bg-white w-full p-4 flex flex-col justify-between gap-3.5 rounded-md shadow-md"
          >
            <div class="flex justify-between">
              <div class="flex flex-col justify-between gap-3.5">
                <h2>Revenue</h2>
                <p class="text-black text-2xl">₹ 18K</p>
              </div>
              <div class="bg-[#FFEDD5] p-3 rounded-md size-[40px] flex items-center justify-center">
                <i class="pi pi-calendar text-[#F97316]"></i>
              </div>
            </div>
            <p><span class="text-[#06B6D4]">%10+</span> since last visit</p>
          </div>
          <!-- Card 3 - Members -->
          <div
            class="bg-white w-full p-4 flex flex-col justify-between gap-3.5 rounded-md shadow-md"
          >
            <div class="flex justify-between">
              <div class="flex flex-col justify-between gap-3.5">
                <h2>Members</h2>
                <p class="text-black text-2xl">80</p>
              </div>
              <div class="bg-[#CFFAFE] p-3 rounded-md size-[40px] flex items-center justify-center">
                <i class="pi pi-calendar text-[#06B6D4]"></i>
              </div>
            </div>
            <p><span class="text-[#06B6D4]">10</span> newly registered</p>
          </div>
          <!-- Card 4 - Feedbacks -->
          <div
            class="bg-white w-full p-4 flex flex-col justify-between gap-3.5 rounded-md shadow-md"
          >
            <div class="flex justify-between">
              <div class="flex flex-col justify-between gap-3.5">
                <h2>Feedbacks</h2>
                <p class="text-black text-2xl">80<span> Unread</span></p>
              </div>
              <div class="bg-[#F3E8FF] p-3 rounded-md size-[40px] flex items-center justify-center">
                <i class="pi pi-calendar text-[#A855F7]"></i>
              </div>
            </div>
            <p><span class="text-[#06B6D4]">10</span> Responded</p>
          </div>
        </div>
        <!-- Second Middle Cards Section -->
        <div class="grid grid-cols-2 gap-7">
          <!-- Recent Event Section -->
          <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
            <h2>Recent Events</h2>
            <DataTable :value="products" :rows="3" tableStyle="min-width: 50rem">
              <Column
                v-for="col of columns"
                :key="col.field"
                :field="col.field"
                :header="col.header"
              ></Column>
            </DataTable>
          </div>
          <!-- Revenue Stream Section -->
          <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
            <h2>Revenue Stream</h2>
            <Chart type="bar" :data="chartData" :options="chartOptions" class="h-auto grow-1" />
          </div>
        </div>
        <!-- Last Cards Section -->
        <div class="grid grid-cols-2 gap-7">
          <!--Tournaments Section -->
          <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
            <h2>Tournaments</h2>
            <ul class="flex flex-col gap-4">
              <li class="flex justify-between align-middle gap-2">
                <div class="basis-2/3">
                  <h3 class="text-black font-bold mb-1">Badminton Tournament 2025</h3>
                  <p>27/06/2025 - 30/08/2025</p>
                </div>
                <div class="w-full basis-1/3"><ProgressBar :value="50"></ProgressBar></div>
              </li>
              <li class="flex justify-between align-middle gap-2">
                <div class="basis-2/3">
                  <h3 class="text-black font-bold mb-1">Badminton Tournament 2024</h3>
                  <p>27/06/2024 - 30/08/2024</p>
                </div>
                <span class="font-bold text-green-600">Completed</span>
              </li>
            </ul>
          </div>
          <!-- Notification Section -->
          <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
            <h2>Notification</h2>
            <ul class="flex flex-col gap-2">
              <li class="flex justify-between align-middle gap-2">
                <div>
                  <h3 class="text-black font-bold mb-4 uppercase text-[12px]">Today</h3>
                  <ul class="flex flex-col gap-2.5">
                    <li class="flex gap-2.5">
                      <div
                        class="bg-[#FCE7F3] p-3 rounded-full size-[28px] flex items-center justify-center"
                      >
                        <i class="pi pi-calendar text-[#EC4899] text-[13px]"></i>
                      </div>
                      <p class="text-[14px]">
                        Justin Thomas requested
                        <span class="text-green-600 font-bold">200 Rs</span> for Glucose
                      </p>
                    </li>
                    <li class="flex gap-2.5">
                      <div
                        class="bg-[#DCFCE7] p-3 rounded-full size-[28px] flex items-center justify-center"
                      >
                        <i class="pi pi-calendar text-[#22C55E] text-[13px]"></i>
                      </div>
                      <p class="text-[14px]">
                        Justin Thomas requested
                        <span class="text-green-600 font-bold">200 Rs</span> for Glucose
                      </p>
                    </li>
                  </ul>
                </div>
              </li>
              <Divider />
              <li class="flex justify-between align-middle gap-2">
                <div>
                  <h3 class="text-black font-bold mb-4 uppercase text-[12px]">Yesterday</h3>
                  <ul class="flex flex-col gap-2.5">
                    <li class="flex gap-2.5">
                      <div
                        class="bg-[#FCE7F3] p-3 rounded-full size-[24px] flex items-center justify-center"
                      >
                        <i class="pi pi-calendar text-[#EC4899] text-[13px]"></i>
                      </div>
                      <p class="text-[14px]">
                        Justin Thomas requested
                        <span class="text-green-600 font-bold">200 Rs</span> for Glucose
                      </p>
                    </li>
                    <li class="flex gap-2.5">
                      <div
                        class="bg-[#DCFCE7] p-3 rounded-full size-[24px] flex items-center justify-center"
                      >
                        <i class="pi pi-calendar text-[#22C55E] text-[13px]"></i>
                      </div>
                      <p class="text-[14px]">
                        Justin Thomas requested
                        <span class="text-green-600 font-bold">200 Rs</span> for Glucose
                      </p>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
