import type { ApiResponse } from '@/types'
import type { Event } from '@/types/event'

export const getEventsByEventType = async (eventTypeId: string): Promise<ApiResponse<Event[]>> => {
  // Mock data
  const fakeData: Event[] = [
    {
      name: 'Tech Innovators Summit',
      description: 'A full-day summit showcasing the latest technology innovations.',
      committeeId: '201',
      eventTypeId,
      startDate: '05/01/2026',
      endDate: '05/01/2026',
      status: 'Completed',
    },
    {
      name: 'Quarterly Review Meeting',
      description: 'Reviewing quarterly performance and new strategy planning.',
      committeeId: '202',
      eventTypeId,
      startDate: '12/01/2026',
      endDate: '12/01/2026',
      status: 'Scheduled',
    },
    {
      name: 'Annual Sports Day',
      description: 'A day filled with fun outdoor activities and competitions.',
      committeeId: '203',
      eventTypeId,
      startDate: '25/02/2026',
      endDate: '26/02/2026',
      status: 'Upcoming',
    },
    {
      name: 'Cultural Fest',
      description: 'Evening cultural performances from employees and their families.',
      committeeId: '204',
      eventTypeId,
      startDate: '10/03/2026',
      endDate: '10/03/2026',
      status: 'Upcoming',
    },
    {
      name: 'Tech Innovators Summit',
      description: 'A full-day summit showcasing the latest technology innovations.',
      committeeId: '201',
      eventTypeId,
      startDate: '05/01/2026',
      endDate: '05/01/2026',
      status: 'Completed',
    },
    {
      name: 'Quarterly Review Meeting',
      description: 'Reviewing quarterly performance and new strategy planning.',
      committeeId: '202',
      eventTypeId,
      startDate: '12/01/2026',
      endDate: '12/01/2026',
      status: 'Scheduled',
    },
    {
      name: 'Annual Sports Day',
      description: 'A day filled with fun outdoor activities and competitions.',
      committeeId: '203',
      eventTypeId,
      startDate: '25/02/2026',
      endDate: '26/02/2026',
      status: 'Upcoming',
    },
    {
      name: 'Cultural Fest',
      description: 'Evening cultural performances from employees and their families.',
      committeeId: '204',
      eventTypeId,
      startDate: '10/03/2026',
      endDate: '10/03/2026',
      status: 'Upcoming',
    },
    {
      name: 'Annual Sports Day',
      description: 'A day filled with fun outdoor activities and competitions.',
      committeeId: '203',
      eventTypeId,
      startDate: '25/02/2026',
      endDate: '26/02/2026',
      status: 'Upcoming',
    },
    {
      name: 'Cultural Fest',
      description: 'Evening cultural performances from employees and their families.',
      committeeId: '204',
      eventTypeId,
      startDate: '10/03/2026',
      endDate: '10/03/2026',
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
