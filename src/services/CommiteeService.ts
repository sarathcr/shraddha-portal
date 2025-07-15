import type { Committee } from '@/types/commitee'
import type { ApiResponse } from '@/types/index'
export const CommiteeService = {
  getCommitteeData(): ApiResponse<Committee[]> {
    return {
      data: [
        {
          id: 'c1',
          year: '2021-2022',
          coreMembers: 'Neel, Sara',
          executiveMembers: 'Om, Riya',
          status: 'Active',
          createdAt: '10-05-2023',
        },
        {
          id: 'c2',
          year: '2020-2021',
          coreMembers: 'Arjun, Isha',
          executiveMembers: 'Manav, Simran',
          status: 'Inactive',
          createdAt: '20-04-2022',
        },
        {
          id: 'c3',
          year: '2023-2024',
          coreMembers: 'Karan, Nisha',
          executiveMembers: 'Ayaan, Priya',
          status: 'Active',
          createdAt: '12-08-2025',
        },
        {
          id: 'c4',
          year: '2019-2020',
          coreMembers: 'Rahul, Sneha',
          executiveMembers: 'Kabir, Meera',
          status: 'Inactive',
          createdAt: '11-03-2021',
        },
        {
          id: 'c5',
          year: '2023-2024',
          coreMembers: 'Karan, Nisha',
          executiveMembers: 'Ayaan, Priya',
          status: 'Active',
          createdAt: '12-08-2025',
        },
        {
          id: 'c6',
          year: '2019-2020',
          coreMembers: 'Rahul, Sneha',
          executiveMembers: 'Kabir, Meera',
          status: 'Inactive',
          createdAt: '11-03-2021',
        },
        {
          id: 'c7',
          year: '2019-2020',
          coreMembers: 'Rahul, Sneha',
          executiveMembers: 'Kabir, Meera',
          status: 'Inactive',
          createdAt: '11-03-2021',
        },
        {
          id: 'c8',
          year: '2019-2020',
          coreMembers: 'Rahul, Sneha',
          executiveMembers: 'Kabir, Meera',
          status: 'Inactive',
          createdAt: '11-03-2021',
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
