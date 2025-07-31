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
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          values: [5000, 8000, 7000, 12500],
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
        totalCelebrated: 14,
        year: 2025,
      },
      tournaments: {
        completed: 6,
        list: [
          { name: 'BoardGames', date: '2025-03-01' },
          { name: 'Badminton', date: '2025-04-15' },
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
    },
    {
      id: '2',
      year: '2023-2024',
      finance: {
        balance: 28100,
        graph: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          values: [6000, 7000, 5000, 10100],
        },
      },
      moms: [
        { date: '2024-07-01', pdfUrl: 'https://example.com/files/mom-2024-07-01.pdf' },
        { date: '2024-07-07', pdfUrl: 'https://example.com/files/mom-2024-07-07.pdf' },
        { date: '2024-07-13', pdfUrl: 'https://example.com/files/mom-2024-07-13.pdf' },
        { date: '2024-07-20', pdfUrl: 'https://example.com/files/mom-2024-07-20.pdf' },
        { date: '2024-07-27', pdfUrl: 'https://example.com/files/mom-2024-07-27.pdf' },
      ],
      birthdayGift: {
        totalCelebrated: 10,
        year: 2024,
      },
      tournaments: {
        completed: 4,
        list: [
          { name: 'Chess Tournament', date: '2024-02-10' },
          { name: 'Table Tennis', date: '2024-04-20' },
        ],
      },
      events: {
        year: 2024,
        totalEvents: 10,
        eventsList: [
          { name: 'New Year Celebration', date: '2024-01-01' },
          { name: 'Woman’s Day', date: '2024-03-08' },
          { name: 'Annual Day', date: '2024-07-21' },
          { name: 'Independence Day', date: '2024-08-15' },
          { name: 'Christmas Celebration', date: '2024-12-25' },
        ],
      },
      charity: {
        count: 4,
        latest: '2024-06-30',
        activities: [
          { date: '2024-01-18', title: 'Orphanage Visit' },
          { date: '2024-03-09', title: 'Blood Donation Drive' },
          { date: '2024-05-22', title: 'Stationery Kit Distribution' },
          { date: '2024-06-30', title: 'Beach Cleanup Campaign' },
        ],
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
