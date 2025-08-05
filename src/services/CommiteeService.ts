import type { ApiResponse } from '@/types'
import type { Committee, CommitteeDashboard } from '@/types/commitee'

export const committeeData: ApiResponse<Committee[]> = {
  data: [
    {
      id: '1',
      year: '2024-2025',
      coreMembers: ['Alice Johnson', 'Bob Smith'],
      executiveMembers: ['Karen Lee', 'John Doe'],
      status: true,
      createdAt: '2025-07-21T00:00:00Z',
    },
    {
      id: '2',
      year: '2023-2024',
      coreMembers: ['Johnson', 'Smith'],
      executiveMembers: ['Lee', 'John Doe'],
      status: true,
      createdAt: '2025-07-20T00:00:00Z',
    },
  ],
  errors: null,
  message: 'Committee fetched successfully',
  pageNumber: 1,
  pageSize: 10,
  succeeded: true,
  totalPages: 1,
  totalRecords: 5,
}

export const committeeDashboards: ApiResponse<CommitteeDashboard[]> = {
  data: [
    {
      id: '1',
      year: '2024-2025',
      finance: {
        balance: 32500,
        graph: {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'june',
            'July',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          values: [5000, 8000, 7000, 12500, 8000, 11000, 15000, 2300, 8900, 20000, 11000, 20000],
        },
      },
      moms: [
        { date: '2025-07-02', pdfUrl: 'https://example.com/files/mom-2025-07-02.pdf' },
        { date: '2025-07-08', pdfUrl: 'https://example.com/files/mom-2025-07-08.pdf' },
        { date: '2025-07-12', pdfUrl: 'https://example.com/files/mom-2025-07-12.pdf' },
        { date: '2025-07-19', pdfUrl: 'https://example.com/files/mom-2025-07-19.pdf' },
        { date: '2025-07-26', pdfUrl: 'https://example.com/files/mom-2025-07-26.pdf' },
      ],
      birthdayGift: {
        year: 2025,
        list: [
          { month: 'January', totalCelebrated: 2 },
          { month: 'February', totalCelebrated: 1 },
          { month: 'March', totalCelebrated: 3 },
          { month: 'April', totalCelebrated: 0 },
          { month: 'May', totalCelebrated: 2 },
          { month: 'June', totalCelebrated: 1 },
          { month: 'July', totalCelebrated: 2 },
        ],
      },
      tournaments: {
        completed: 2,
        list: [
          { name: 'Badminton - 2025', startDate: '2025-03-01', endDate: '2025-04-03' },
          { name: 'BoardGames - 2025', startDate: '2025-03-01', endDate: '2025-04-03' },
        ],
      },
      events: {
        year: 2025,
        totalEvents: 12,
        eventsList: [
          { name: 'New Year Celebration', date: '2025-01-01' },
          { name: 'Woman’s Day', date: '2025-03-08' },
          { name: 'Annual Day', date: '2025-07-21' },
          { name: 'Independence Day', date: '2025-08-15' },
          { name: 'Christmas Celebration', date: '2025-12-25' },
        ],
      },
      charity: {
        count: 5,
        latest: '2025-06-30',
        activities: [
          { date: '2025-01-15', title: 'Visit to Old Age Home' },
          { date: '2025-03-10', title: 'Blood Donation Camp' },
          { date: '2025-05-12', title: 'School Kit Distribution' },
          { date: '2025-06-30', title: 'Tree Plantation Drive' },
          { date: '2025-07-18', title: 'Support for Flood Relief' },
        ],
      },
      members: {
        total: 150,
        newThisYear: 12,
        active: 140,
      },
    },
  ],
  errors: null,
  message: 'CommitteeDetail fetched successfully',
  pageNumber: 1,
  pageSize: 10,
  succeeded: true,
  totalPages: 1,
  totalRecords: 5,
}
