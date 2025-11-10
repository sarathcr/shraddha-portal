import type { ApiResponse } from '@/types'
import type { Event } from '@/types/event'

export const getEventsByEventType = async (eventTypeId: string): Promise<ApiResponse<Event[]>> => {
  // Mock data
  const fakeData: Event[] = [
    {
      name: 'Annual Day Celebration',
      description: 'Full-day celebration with cultural programs',
      committeeId: '101',
      eventTypeId,
      startDate: '2025-12-01',
      endDate: '2025-12-01',
      status: 'Completed',
    },
    {
      name: 'Monthly Meeting',
      description: 'Core committee review and planning',
      committeeId: '102',
      eventTypeId,
      startDate: '2025-12-15',
      endDate: '2025-12-15',
      status: 'Scheduled',
    },
    {
      name: 'Employee Birthday',
      description: 'Monthly birthday celebration for employees',
      committeeId: '103',
      eventTypeId,
      startDate: '2025-12-20',
      endDate: '2025-12-20',
      status: 'Upcoming',
    },
  ]

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: fakeData,
        message: 'Events fetched successfully',
        succeeded: true,
        errors: null,
        pageNumber: 1,
        pageSize: fakeData.length,
        totalPages: 1,
        totalRecords: fakeData.length,
      })
    }, 600)
  })
}
