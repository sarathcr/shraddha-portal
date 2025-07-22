import type { ApiResponse } from '@/types'
import type { Committee } from '@/types/commitee'

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
