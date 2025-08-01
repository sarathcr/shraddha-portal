<script setup lang="ts">
import FolderCard from '../components/CommitteCard.vue'
import FinanceChart from '../components/CommitteGraph.vue'
import MomList from '../components/CommitteMomList.vue'
import TournamentList from '../components/CommitteTournaments.vue'
import BirthdayCard from '../components/CommitBirthdayCard.vue'
import { useDashboard } from '../composable/useDashboard'
import type { CommitteeCard } from '@/types/commitee'
import { computed } from 'vue'

const { cards, moms, tournaments, birthdayGift } = useDashboard()

const committeeCards = computed(() => cards.value as CommitteeCard[])

const lastFiveMonthsData = computed(() => birthdayGift.value.slice(-3))

const filteredCards = computed(() =>
  committeeCards.value.filter((card) => ['Events', 'Charity', 'Tournaments'].includes(card.title)),
)

const tournamentCount = computed(
  () => committeeCards.value.find((card) => card.title === 'Tournaments')?.countValue || 0,
)
</script>

<template>
  <div class="flex flex-col gap-6 h-full">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
      <FolderCard
        v-for="card in filteredCards"
        :key="card.title"
        :title="card.title"
        :icon="card.icon"
        :colorClasses="card.colorClasses"
        :countValue="card.countValue"
        :countLabel="card.countLabel"
      />
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-7 grow">
      <MomList :moms="moms" />
      <FinanceChart />
    </div>

    <div class="grid lg:grid-cols-2 gap-7">
      <TournamentList :tournaments="tournaments" :completedCount="tournamentCount" />
      <BirthdayCard :birthdayGift="lastFiveMonthsData" />
    </div>
  </div>
</template>
