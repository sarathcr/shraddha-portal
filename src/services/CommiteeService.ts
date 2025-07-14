import type { Committee } from '@/types/commitee'
import type { ApiResponse } from '@/types/index'
export const CommiteeService = {
  getCommitteeData(): ApiResponse<Committee[]> {
    return {
      data: [
        {
          year: '2023-2024',
          coreMembers: 'Aarav, Diya',
          executiveMembers: 'Kabir, Meera',
          status: 'Active',
          createdAt: '08-07-2025',
          id: '1234',
        },
        {
          year: '2022-2023',
          coreMembers: 'Rohan, Sanya',
          executiveMembers: 'Nikhil, Priya',
          status: 'Inactive',
          createdAt: '08-07-2025',
          id: '123',
        },
        {
          year: '2023-2024',
          coreMembers: 'Aarav, Diya',
          executiveMembers: 'Kabir, Meera',
          status: 'Active',
          createdAt: '08-07-2025',
          id: '1234',
        },
        {
          year: '2022-2023',
          coreMembers: 'Rohan, Sanya',
          executiveMembers: 'Nikhil, Priya',
          status: 'Inactive',
          createdAt: '08-07-2025',
          id: '123',
        },
        {
          year: '2021-2022',
          coreMembers: 'Ishaan, Anaya',
          executiveMembers: 'Arjun, Tanya',
          status: 'Inactive',
          createdAt: '08-07-2025',
          id: '122',
        },
        {
          year: '2020-2021',
          coreMembers: 'Vivaan, Myra',
          executiveMembers: 'Dev, Kiara',
          status: 'Inactive',
          createdAt: '08-07-2025',
          id: '121',
        },
        {
          year: '2019-2020',
          coreMembers: 'Reyansh, Aadhya',
          executiveMembers: 'Neil, Avni',
          status: 'Inactive',
          createdAt: '08-07-2025',
          id: '120',
        },
        {
          year: '2024-2025',
          coreMembers: 'Krish, Zoya',
          executiveMembers: 'Shaurya, Rhea',
          status: 'Active',
          createdAt: '08-07-2025',
          id: '1235',
        },
      ],
      errors: null,
      message: 'Committee fetched successfully',
      pageNumber: 1,
      pageSize: 10,
      succeeded: true,
      totalPages: 7,
      totalRecords: 65,
    }
  },
}
