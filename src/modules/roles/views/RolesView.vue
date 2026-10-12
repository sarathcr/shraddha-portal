<script setup lang="ts">
import { ref } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'

import UsersTab from '../components/UsersTab.vue'
import RolesTab from '../components/RolesTab.vue'
import TeamsTab from '../components/TeamsTab.vue'

const selectedTab = ref<string>('0')
const tabs = ref([
  { value: '0', title: 'Users', icon: 'pi pi-users' },
  { value: '1', title: 'Roles', icon: 'pi pi-shield' },
  { value: '2', title: 'Teams', icon: 'pi pi-sitemap' },
])

const visitedTabs = ref<Set<string>>(new Set(['0']))

const handleTabChange = (newVal: string | number): void => {
  const tabVal = String(newVal)
  selectedTab.value = tabVal
  visitedTabs.value.add(tabVal)
}
</script>

<template>
  <Toast position="top-right" />
  <div class="flex flex-col gap-6 w-full">
    <!-- Header Summary Card -->
    <div
      class="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-11 sm:size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl shrink-0"
        >
          <i class="pi pi-shield"></i>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Roles & Access Management
            </h1>
            <span
              class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              Security Hub
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure system accounts, assign granular role permissions, and manage departmental
            teams.
          </p>
        </div>
      </div>
    </div>

    <!-- Tabbed Tables Card Container -->
    <div
      class="roles__content bg-white w-full rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden"
    >
      <Tabs :value="selectedTab" @update:value="handleTabChange">
        <TabList
          class="sticky top-0 bg-white border-b border-slate-100 px-1 sm:px-2 pt-1 overflow-hidden"
        >
          <Tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold !py-2.5 sm:!py-3 !px-3 sm:!px-4"
          >
            <i :class="tab.icon" class="text-xs sm:text-sm"></i>
            <span>{{ tab.title }}</span>
          </Tab>
        </TabList>
        <TabPanels class="p-0!">
          <TabPanel value="0">
            <UsersTab v-if="visitedTabs.has('0')" v-show="selectedTab === '0'" />
          </TabPanel>

          <TabPanel value="1">
            <RolesTab v-if="visitedTabs.has('1')" v-show="selectedTab === '1'" />
          </TabPanel>

          <TabPanel value="2">
            <TeamsTab v-if="visitedTabs.has('2')" v-show="selectedTab === '2'" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
<style>
.p-tabs,
.p-tabpanels,
.p-tabpanel {
  height: 100%;
  min-height: 100%;
}
</style>
