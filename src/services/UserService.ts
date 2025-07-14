import type { ApiResponse } from '@/types/index'
import type { User } from '@/types/user'
export const UserService = {
  getUsersData(): ApiResponse<User[]> {
    return {
      data: [
        {
          id: '1000',
          name: 'James Butt',
          employeeId: '34',
          email: 'james.butt@example.com',
          team: ['BE', 'QA'],
          role: 'Secretary',
          dob: '01-04-1990',
        },
        {
          id: '1001',
          name: 'Linda Smith',
          employeeId: '35',
          email: 'linda.smith@example.com',
          team: ['FE'],
          role: 'Treasurer',
          dob: '15-08-1985',
        },
        {
          id: '1002',
          name: 'Robert Green',
          employeeId: '36',
          email: 'robert.green@example.com',
          team: ['BE', 'DevOps'],
          role: 'Assistant Treasurer',
          dob: '20-11-1992',
        },
        {
          id: '1003',
          name: 'Anita Patel',
          employeeId: '37',
          email: 'anita.patel@example.com',
          team: ['QA'],
          role: 'Executive Committee member',
          dob: '05-03-1988',
        },
        {
          id: 'user1',
          name: 'Sarath',
          employeeId: 'EMP001',
          email: 'sarath@example.com',
          team: ['Front-end'],
          dob: '01-04-1999',
          role: 'President',
        },
      ],
      errors: null,
      message: 'Users fetched successfully',
      pageNumber: 1,
      pageSize: 10,
      succeeded: true,
      totalPages: 7,
      totalRecords: 65,
    }
  },
}

export const Teams = (): { teams: { label: string; value: string }[] } => {
  return {
    teams: [
      { label: 'BE', value: 'BE' },
      { label: 'FE', value: 'FE' },
      { label: '.NET', value: '.NET' },
      { label: 'QA', value: 'QA' },
    ],
  }
}

export const Roles = (): { roles: { label: string; value: string }[] } => {
  return {
    roles: [
      { label: 'Secretary', value: 'Secretary' },
      { label: 'Treasurer', value: 'Treasurer' },
      { label: 'Assistant Treasurer', value: 'Assistant Treasurer' },
      { label: 'Executive Committee member', value: 'Executive Committee member' },
      { label: 'President', value: 'President' },
    ],
  }
}
