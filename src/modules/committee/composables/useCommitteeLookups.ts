import { ref, type Ref } from 'vue'
import type { CommitteeRole, CommitteeUser } from '@/modules/committee/types/committee.types'
import type { OptionItem } from '@/modules/roles/types/user.types'
import type { ApiResponse } from '@/shared/types'
import { fetchRoles, fetchUsers } from '../services/committee.services'

export const committeeUsers: Ref<CommitteeUser[]> = ref([])
export const committeeRoles: Ref<OptionItem[]> = ref([])

export const getUsersData = async (): Promise<CommitteeUser[]> => {
  const users: ApiResponse<CommitteeUser[]> = await fetchUsers(-1, -1, { isActive: '= true' })
  if (users?.succeeded && users.data) {
    committeeUsers.value = users.data
    return users.data
  } else {
    committeeUsers.value = []
    return []
  }
}

export const getRolesData = async (): Promise<void> => {
  const roles: ApiResponse<CommitteeRole[]> = await fetchRoles(-1, -1)
  if (roles?.succeeded && roles.data) {
    committeeRoles.value = roles.data.map((role: CommitteeRole) => ({
      label: role.roleName,
      value: role.id,
    }))
  } else {
    committeeRoles.value = []
  }
}
