import type { EntityType, HistoryEntry } from '@/types/history'

// Fake Data (can be replaced later with API calls)
const userHistory: HistoryEntry[] = [
  {
    id: 1,
    action: 'updated',
    user: 'Steve',
    field: 'Employee ID',
    oldValue: 'IN0160',
    newValue: 'IN0161',
    date: '12/12/2025',
  },
  {
    id: 2,
    action: 'created',
    user: 'Steve',
    date: '11/12/2025',
  },
]

const teamHistory: HistoryEntry[] = [
  {
    id: 1,
    action: 'created',
    user: 'Alex',
    date: '05/10/2025',
  },
  {
    id: 2,
    action: 'updated',
    user: 'Maria',
    field: 'Team Name',
    oldValue: 'Backend',
    newValue: 'Frontend',
    date: '20/10/2025',
  },
]

const roleHistory: HistoryEntry[] = [
  {
    id: 1,
    action: 'created',
    user: 'Diana',
    field: 'Role Name',
    newValue: 'Manager',
    date: '08/09/2025',
  },
  {
    id: 2,
    action: 'updated',
    user: 'Michael',
    field: 'Permissions',
    oldValue: 'Read Only',
    newValue: 'Read & Write',
    date: '10/09/2025',
  },
]

const committeeHistory: HistoryEntry[] = [
  {
    id: 1,
    action: 'updated',
    user: 'Steve',
    field: 'Employee ID',
    oldValue: 'IN0160',
    newValue: 'IN0161',
    date: '12/12/2025',
  },
  {
    id: 2,
    action: 'created',
    user: 'Steve',
    date: '11/12/2025',
  },
]

const eventTypeHistory: HistoryEntry[] = [
  {
    id: 1,
    action: 'created',
    user: 'Admin',
    field: 'Event Type',
    newValue: 'Sports & Games',
    date: '08/11/2025',
  },
  {
    id: 2,
    action: 'updated',
    user: 'Admin',
    field: 'Description',
    oldValue: 'Old description',
    newValue: 'Updated event type description',
    date: '12/11/2025',
  },
]

export async function getHistoryByEntity(
  entity: EntityType,
  _id?: string | number,
): Promise<HistoryEntry[]> {
  // Replace this with your API call later:

  switch (entity) {
    case 'user':
      return Promise.resolve(userHistory)
    case 'team':
      return Promise.resolve(teamHistory)
    case 'role':
      return Promise.resolve(roleHistory)
    case 'committee':
      return Promise.resolve(committeeHistory)
    case 'eventType':
      return Promise.resolve(eventTypeHistory)
    default:
      return Promise.resolve([])
  }
}
