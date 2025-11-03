import { ref, type Ref } from 'vue'
import type { HistoryEntry } from '@/types/history'

type EntityType = 'user' | 'team' | 'role'

// Fake data for now
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
    field: 'Team Name',
    newValue: 'Engineering',
    date: '05/10/2025',
  },
  {
    id: 2,
    action: 'updated',
    user: 'Maria',
    field: 'Team Lead',
    oldValue: 'Alex',
    newValue: 'John',
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

interface UseHistoryReturn {
  historyDrawerVisible: Ref<boolean>
  historyData: Ref<HistoryEntry[]>
  currentEntity: Ref<EntityType>
  loadHistory: (entity: EntityType, id?: string | number) => void
}

export function useHistory(): UseHistoryReturn {
  const historyDrawerVisible = ref(false)
  const historyData = ref<HistoryEntry[]>([])
  const currentEntity = ref<EntityType>('user')

  const loadHistory = (entity: EntityType, _id?: string | number): void => {
    currentEntity.value = entity

    switch (entity) {
      case 'user':
        historyData.value = userHistory
        break
      case 'team':
        historyData.value = teamHistory
        break
      case 'role':
        historyData.value = roleHistory
        break
      default:
        historyData.value = []
    }

    historyDrawerVisible.value = true
  }

  return {
    historyDrawerVisible,
    historyData,
    currentEntity,
    loadHistory,
  }
}
