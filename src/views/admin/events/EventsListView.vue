<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import EventCard from './components/EventCard.vue'
import EventCardSkeleton from '@/components/Skelton/EventCardSkeleton.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { useEvents } from './composables/useEvents'
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Button, Dialog, Toast } from 'primevue'
import EventForm from './components/EventForm.vue'
import { useEventForm } from './composables/useEventForm'
import type { EventFormPayload, EventFormData } from '@/types/event'
import DialogFooter from '@/components/DialogFooter.vue'
import { useModulePermissions } from '@/composables/useModulePermissions'

const MODULE_NAME: string = 'Events'

const { canCreate } = useModulePermissions(MODULE_NAME)

const route = useRoute()
const EventFormDialogVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const { submitEvent } = useEventForm()
const selectedEvent = ref<EventFormData | null>(null)
const eventFormRef = ref<InstanceType<typeof EventForm> | null>(null)

const openCreateEventDialog = (): void => {
  formMode.value = 'create'
  EventFormDialogVisible.value = true
}

const eventTypeId = String(route.params.id)
const eventTypeName =
  (Array.isArray(route.query.name) ? route.query.name[0] : route.query.name) || ''
const scrollContainer = ref<HTMLElement | null>(null)

const { events, loading, error, hasMore, loadEvents, loadMore } = useEvents()

const handleScroll = (): void => {
  if (!hasMore.value || loading.value) {
    return
  }

  const bottomReached = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200

  if (bottomReached) {
    void loadMore({ eventTypeId })
  }
}

const handleEventSubmit = async (payload: EventFormPayload): Promise<void> => {
  const resp = await submitEvent(payload)
  if (resp.data) {
    events.value = []
    hasMore.value = true

    await loadEvents({
      eventTypeId,
    })
  }
  EventFormDialogVisible.value = false
}

onMounted(() => {
  void loadEvents({ eventTypeId })
  scrollContainer.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll)
})

watch(EventFormDialogVisible, (visible) => {
  if (visible && scrollContainer.value) {
    scrollContainer.value.style.overflowY = 'hidden'
  } else if (scrollContainer.value) {
    scrollContainer.value.style.overflowY = 'auto'
  }
})
</script>

<template>
  <div ref="scrollContainer" class="overflow-y-auto">
    <div class="flex justify-between">
      <PageTitle :pageName="eventTypeName" />
      <Button
        v-if="canCreate"
        label="Create Event"
        icon="pi pi-plus"
        severity="help"
        @click="openCreateEventDialog"
      />
    </div>
    <Toast />
    <Dialog
      class="m-4"
      v-model:visible="EventFormDialogVisible"
      :header="formMode === 'create' ? 'Create Event' : 'Edit Event'"
      :style="{ width: '50rem' }"
      modal
    >
      <EventForm
        ref="eventFormRef"
        :eventTypeId="eventTypeId"
        :initialData="formMode === 'edit' ? selectedEvent : null"
        @submit="handleEventSubmit"
        @cancel="EventFormDialogVisible = false"
      >
      </EventForm>
      <template #footer>
        <DialogFooter
          @cancel="EventFormDialogVisible = false"
          @submit="eventFormRef?.onSubmit && eventFormRef.onSubmit()"
        />
      </template>
    </Dialog>
    <div
      v-if="loading && events.length === 0"
      class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4"
    >
      <EventCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <!-- ERROR STATE -->
    <div
      v-else-if="error"
      class="p-8 bg-red-50/60 border border-red-200 rounded-2xl text-center my-6 flex flex-col items-center justify-center gap-2"
    >
      <div
        class="size-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl"
      >
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <p class="font-semibold text-slate-800 text-sm">Failed to load events</p>
      <p class="text-xs text-red-600 max-w-md">{{ error }}</p>
    </div>

    <!-- EMPTY STATE -->
    <EmptyState
      v-else-if="events.length === 0"
      title="No Events Found"
      :description="
        eventTypeId && eventTypeId !== 'undefined'
          ? `There are no events listed under &quot;${eventTypeName}&quot; yet. Create a new event to start organizing and engaging your community.`
          : 'There are currently no events scheduled in the system. Start by creating your first event.'
      "
      icon="pi pi-calendar-times"
      :actionLabel="canCreate ? 'Create Event' : ''"
      actionIcon="pi pi-plus"
      :showAction="canCreate"
      @action="openCreateEventDialog"
    />

    <!-- EVENTS LIST GRID -->
    <div v-else class="grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      <EventCard
        v-for="(event, index) in events"
        :key="index"
        :name="event.name"
        :description="event.description"
        :startDate="event.startDate"
        :endDate="event.endDate"
        :status="event.status"
      />
    </div>

    <div v-if="loading && events.length > 0" class="p-4 grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <EventCardSkeleton v-for="i in 4" :key="'lazy-' + i" />
    </div>
  </div>
</template>
