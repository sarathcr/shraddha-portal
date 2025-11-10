import type { Ref } from 'vue'

export interface EventType {
  id: string
  eventTypeName: string
  description: string
}

export interface UseEventTypesReturn {
  eventTypes: Ref<EventType[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchAllEventTypes: () => Promise<void>
}
export interface Event {
  name: string
  description: string
  committeeId: string
  eventTypeId: string
  startDate: string
  endDate: string
  status: string
}

export interface UseEventsReturn {
  events: Ref<Event[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchEvents: (eventTypeId: string) => Promise<void>
}
