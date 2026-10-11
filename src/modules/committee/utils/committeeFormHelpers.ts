import type {
  Committee,
  CommitteeFormData,
  CommitteeUser,
} from '@/modules/committee/types/committee.types'
import { AdministrativeRoles } from '@/shared/constants/committeeRoles.enum'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import isEqual from 'lodash/isEqual'

export const getInitialCommitteeData = (): CommitteeFormData => ({
  year: '',
  startDate: null,
  endDate: null,
  isActive: false,
  coreMembers: [],
  executiveMembers: [],
  selectedCoreMembers: {},
  selectedExecutiveMember: [],
})

export function filterAllowedCommitteeUsers(
  allUsers: CommitteeUser[],
): { label: string; value: string }[] {
  const filteredUsers = allUsers.filter((u) => {
    if (!Array.isArray(u.roles)) return false
    const roleNames = u.roles.map((r) => r.role)
    const hasExcludedRole = [
      AdministrativeRoles.AdminHR,
      AdministrativeRoles.Director,
      AdministrativeRoles.DeliveryManager,
    ].some((excluded) => roleNames.includes(excluded))
    return !hasExcludedRole
  })

  return filteredUsers
    .filter((u): u is CommitteeUser & { name: string; id: string } => !!u.name && !!u.id)
    .map((u) => ({ label: u.name, value: u.id }))
}

export function extractMemberNames(members: string | CommitteeUser[] | undefined | null): string[] {
  if (!members) return []
  if (typeof members === 'string') {
    return members.split(',').map((s) => s.trim())
  } else if (Array.isArray(members)) {
    return members.map((m) => m.userName?.trim() || m.name?.trim() || '')
  }
  return []
}

export function hasCommitteeChanged(
  committee: Committee | null | undefined,
  originalCommittee: Committee | null,
  current: {
    year: string
    startDate: Date | null
    endDate: Date | null
    isActive: boolean
    selectedCoreMembers: Record<string, string>
    selectedExecutiveMember: string[]
  },
  userOptions: { label: string; value: string }[],
): boolean {
  if (!committee || !originalCommittee) return true

  const originalData = {
    year: originalCommittee.year,
    startDate: originalCommittee.startDate,
    endDate: originalCommittee.endDate,
    isActive: originalCommittee.isActive,
    coreMembers: extractMemberNames(originalCommittee.coreMembers),
    executiveMembers: extractMemberNames(originalCommittee.executiveMembers),
  }

  const currentData = {
    year: current.year,
    startDate: current.startDate ? formatDateForAPI(current.startDate) : null,
    endDate: current.endDate ? formatDateForAPI(current.endDate) : null,
    isActive: current.isActive,
    coreMembers: Object.entries(current.selectedCoreMembers).map(([, userId]) => {
      const user = userOptions.find((u) => u.value === userId)
      return user?.label ?? ''
    }),
    executiveMembers: current.selectedExecutiveMember.map(
      (id) => userOptions.find((u) => u.value === id)?.label ?? '',
    ),
  }
  originalData.coreMembers.sort()
  currentData.coreMembers.sort()
  originalData.executiveMembers.sort()
  currentData.executiveMembers.sort()

  return !isEqual(originalData, currentData)
}
