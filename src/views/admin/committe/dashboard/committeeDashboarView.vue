<script setup lang="ts">
import FolderCard from '../components/CommitteCard.vue'
import FinanceChart from '../components/CommitteGraph.vue'
import MomList from '../components/CommitteMomList.vue'
import Events from '../components/CommitteEvents.vue'

const moms = [
  {
    id: '1',
    code: 'MOM001',
    name: 'July Meeting',
    category: 'Monthly',
    quantity: 1,
  },
  {
    id: '2',
    code: 'MOM002',
    name: 'Finance Review',
    category: 'Quarterly',
    quantity: 1,
  },
]

const cards = [
  {
    title: 'Tournaments',
    icon: 'pi pi-trophy',
    colorClasses: { bg: 'bg-pink-100', text: 'text-pink-600' },
    countValue: 6,
    countLabel: 'tournaments completed this year',
  },
  {
    title: 'Events',
    icon: 'pi pi-calendar',
    colorClasses: { bg: 'bg-purple-100', text: 'text-purple-600' },
    countValue: 12,
    countLabel: 'done this month',
  },
  {
    title: 'Charity',
    icon: 'pi pi-heart',
    colorClasses: { bg: 'bg-red-100', text: 'text-red-600' },
    countValue: 5,
    countLabel: 'completed this year',
  },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FolderCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :icon="card.icon"
        :colorClasses="card.colorClasses"
        :countValue="card.countValue"
        :countLabel="card.countLabel"
      />
    </div>
    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-7 grow-1">
      <MomList :moms="moms" />
      <FinanceChart />
    </div>
    <div class="grid lg:grid-cols-2 gap-7">
      <Events />
    </div>
  </div>
</template>
