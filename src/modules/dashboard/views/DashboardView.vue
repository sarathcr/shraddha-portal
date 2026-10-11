<script setup lang="ts">
import DashboardHero from '../components/DashboardHero.vue'
import InfoCard from '../components/InfoCard.vue'
import NotificationCard from '../components/NotificationCard.vue'
import RecentEventsCard from '../components/RecentEventsCard.vue'
import RevenueStreamCard from '../components/RevenueStreamCard.vue'
import TournamentsCard from '../components/TournamentsCard.vue'
</script>

<template>
  <div class="flex flex-col gap-6 sm:gap-7 w-full pb-8">
    <!-- Welcome & Quick Action Hero -->
    <DashboardHero />

    <!-- 4 High-Impact KPI Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <InfoCard
        title="Total Events"
        value="52"
        icon="pi-calendar"
        color="indigo"
        trendValue="+14.2%"
        trendDirection="up"
        trendLabel="vs last month"
      />
      <InfoCard
        title="Total Funds"
        value="₹ 1.24 L"
        icon="pi-wallet"
        color="emerald"
        trendValue="+8.5%"
        trendDirection="up"
        trendLabel="this quarter"
      />
      <InfoCard
        title="Active Members"
        value="128"
        icon="pi-users"
        color="blue"
        trendValue="+12 new"
        trendDirection="up"
        trendLabel="this month"
      />
      <InfoCard
        title="Pending Reviews"
        value="6"
        icon="pi-inbox"
        color="orange"
        trendValue="2 urgent"
        trendDirection="down"
        trendLabel="awaiting action"
      />
    </div>

    <!-- Main Analytics Row: Recent Events & Financial Stream -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <RecentEventsCard />
      <RevenueStreamCard />
    </div>

    <!-- Secondary Row: Active Tournaments & Recent Activity -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <TournamentsCard />
      <NotificationCard />
    </div>
  </div>
</template>
