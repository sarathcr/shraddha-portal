import { committeeApi } from '@/constants'
import type { EventType } from '@/types/eventType.model'
import { type AxiosResponse } from 'axios'

// Create new Eventype
export const createEventType = (newEventType: EventType): Promise<AxiosResponse<EventType>> => {
  return committeeApi.post<EventType>('/committee/EventType', newEventType)
}
