import { ref, type Ref } from 'vue'
import type { CommitteeList, EventFormPayload } from '@/types/event'
import { getCommitteeList, createEvent } from '@/views/admin/services/event.services'
import type { ApiResponse } from '@/types'
import { useToast } from 'primevue'

export function useEventForm(): {
  committees: Ref<CommitteeList[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  loadCommittees: () => Promise<void>
  submitEvent: (payload: EventFormPayload) => Promise<ApiResponse<EventFormPayload>>
} {
  const committees = ref<CommitteeList[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  const loadCommittees = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const list = await getCommitteeList()
      committees.value = list
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load committees'
    } finally {
      loading.value = false
    }
  }

  const submitEvent = async (payload: EventFormPayload): Promise<ApiResponse<EventFormPayload>> => {
    loading.value = true
    error.value = null

    try {
      const resp = await createEvent(payload)

      if (resp.data) {
        toast.add({
          severity: 'success',
          summary: 'Event Created',
          detail: resp.message || 'Event created successfully',
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Failed to Create Event',
          detail: resp.message || 'Unknown error',
          life: 4000,
        })
      }

      return resp
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event'

      error.value = msg

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 4000,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    committees,
    loading,
    error,
    loadCommittees,
    submitEvent,
  }
}
