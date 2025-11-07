import type { Ref } from 'vue'

export interface EventType {
  eventTypeName: string
  description: string
}

export interface UseEventTypesReturn {
  eventTypes: Ref<EventType[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchAllEventTypes: () => Promise<void>
}
