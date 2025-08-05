<script setup lang="ts">
import FolderCard from '../components/CommitteCard.vue'
import FinanceChart from '../components/CommitteGraph.vue'
import MomList from '../components/CommitteMomList.vue'
import TournamentList from '../components/CommitteTournaments.vue'
import BirthdayCard from '../components/CommitBirthdayCard.vue'
import { useDashboard } from '../composable/useDashboard'
import type { CommitteeCard } from '@/types/commitee'
import { computed, ref, onMounted } from 'vue'

import CommitteeCardSkelton from '@/components/Skelton/CommitteeCardSkelton.vue'
import CommitteeTableSkelton from '@/components/Skelton/CommitteeTableSkelton.vue'
import CommitteeGraphSkelton from '@/components/Skelton/CommitteeGraphSkelton.vue'
import CommitteeTournamentSkelton from '@/components/Skelton/CommitteeTournamentSkelton.vue'

const { cards, moms, tournaments, birthdayGift } = useDashboard()
const isLoadingCards = ref(true)
const isLoadingTable = ref(true)
const isLoadingGraph = ref(true)
const isLoadingTournaments = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoadingCards.value = false
    isLoadingTable.value = false
    isLoadingGraph.value = false
    isLoadingTournaments.value = false
  }, 1500)
})

const committeeCards = computed(() => cards.value as CommitteeCard[])

const lastFiveMonthsData = computed(() => birthdayGift.value.slice(-3))

const filteredCards = computed(() =>
  committeeCards.value.filter((card) =>
    ['Events', 'Charity', 'Members', 'Birthday-Gifts'].includes(card.title),
  ),
)

const tournamentCount = computed(
  () => committeeCards.value.find((card) => card.title === 'Tournaments')?.countValue || 0,
)
</script>

<template>
  <div class="flex flex-col gap-6 h-full">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow">
      <template v-if="isLoadingCards">
        <CommitteeCardSkelton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <FolderCard
          v-for="card in filteredCards"
          :key="card.title"
          :title="card.title"
          :icon="card.icon"
          :colorClasses="card.colorClasses"
          :countValue="card.countValue"
          :countLabel="card.countLabel"
        />
      </template>
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-7 grow">
      <template v-if="isLoadingTable">
        <CommitteeTableSkelton />
      </template>
      <template v-else>
        <MomList :moms="moms" />
      </template>
      <template v-if="isLoadingGraph">
        <CommitteeGraphSkelton />
      </template>
      <template v-else>
        <FinanceChart />
      </template>
    </div>

    <div class="grid lg:grid-cols-2 gap-7">
      <template v-if="isLoadingTournaments">
        <CommitteeTournamentSkelton />
      </template>
      <template v-else>
        <TournamentList :tournaments="tournaments" :completedCount="tournamentCount" />
      </template>
      <template v-if="isLoadingTable">
        <CommitteeTableSkelton />
      </template>
      <template v-else>
        <BirthdayCard :birthdayGift="lastFiveMonthsData" />
      </template>
    </div>
  </div>
</template>
