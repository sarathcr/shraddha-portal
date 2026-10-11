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
  hasMore: Ref<boolean>
  loadEvents: (filters: Record<string, string>) => Promise<void>
  loadMore: (filters: Record<string, string>) => Promise<void>
}

export type EventStatus =
  | 'Pending'
  | 'Scheduled'
  | 'Postponed'
  | 'Cancelled'
  | 'Ongoing'
  | 'Completed'

export interface CommitteeList {
  id: string
  name: string
  isactive?: boolean
}

export interface EventFormPayload {
  name: string
  description: string
  committeeId: string
  eventTypeId: string
  startDate: string
  endDate: string
  status: EventStatus
}

export interface EventFormData {
  name: string
  description: string
  committeeId: string
  eventTypeId: string
  startDate: Date | null
  endDate: Date | null
  status: EventStatus | ''
}
