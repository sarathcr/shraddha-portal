import { ref, type Ref } from 'vue'
import type { EntityType, HistoryEntry } from '@/types/history'
import { getHistoryByEntity } from '@/services/HistoryService'

interface UseHistoryReturn {
  historyDrawerVisible: Ref<boolean>
  historyData: Ref<HistoryEntry[]>
  currentEntity: Ref<EntityType>
  loadHistory: (entity: EntityType, id?: string | number) => Promise<void>
}

export function useHistory(): UseHistoryReturn {
  const historyDrawerVisible = ref(false)
  const historyData = ref<HistoryEntry[]>([])
  const currentEntity = ref<EntityType>('user')

  const loadHistory = async (entity: EntityType, id?: string | number): Promise<void> => {
    currentEntity.value = entity
    historyDrawerVisible.value = true
    historyData.value = await getHistoryByEntity(entity, id)
  }

  return {
    historyDrawerVisible,
    historyData,
    currentEntity,
    loadHistory,
  }
}
