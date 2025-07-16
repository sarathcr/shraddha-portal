<script setup lang="ts">
import { ref } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'

import UsersTab from './components/UsersTab.vue'
import RolesTab from './components/RolesTab.vue'
import TeamsTab from './components/TeamsTab.vue'

const selectedTab = ref<string>('0')
const tabs = ref([
  { value: '0', title: 'Users' },
  { value: '1', title: 'Roles' },
  { value: '2', title: 'Teams' },
])
</script>

<template>
  <Toast position="top-left" />
  <div class="roles__content bg-white w-full overflow-auto rounded-md shadow z-0">
    <Tabs :value="selectedTab" @update:value="selectedTab = String($event)">
      <TabList class="sticky top-0 bg-white">
        <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.title }}</Tab>
      </TabList>
      <TabPanels class="p-0!">
        <TabPanel value="0">
          <UsersTab />
        </TabPanel>

        <TabPanel value="1">
          <RolesTab />
        </TabPanel>

        <TabPanel value="2">
          <TeamsTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<style>
.roles__content {
  @media screen and (min-width: 1024px) {
    height: calc(100svh - 123px) !important;
  }
}
</style>
