import sortBy from 'lodash/sortBy'
import isEqual from 'lodash/isEqual'
import { formatDateForAPI } from '@/shared/utils/dateUtils'
import type { User } from '@/modules/roles/types/user.types'
import type { RowData } from '@/shared/types/baseTable.model'

export const getRoleIdsForComparison = (user: User | null): string[] => {
  if (!user || !user.roles || !Array.isArray(user.roles)) return []
  return sortBy(user.roles.map((r: any) => (typeof r === 'string' ? r : r.roleId || r.id)))
}

export const normalizeDOB = (dob: unknown): string | null => {
  if (!dob) return null
  let dateObj: Date | null = null
  if (dob instanceof Date) {
    dateObj = dob
  } else if (typeof dob === 'string') {
    if (dob.includes('T')) {
      dateObj = new Date(dob)
    } else if (dob.includes('-')) {
      const [dd, mm, yyyy] = dob.split('-').map(Number)
      dateObj = new Date(yyyy, mm - 1, dd)
    }
  }
  return dateObj && !isNaN(dateObj.getTime()) ? formatDateForAPI(dateObj) : null
}

export const hasUserChanges = (
  originalUser: User | null,
  newData: RowData,
  originalTeamName: string | null,
  newRoleIds: string[],
  currentStatus: boolean,
): boolean => {
  const originalRoleIds = getRoleIdsForComparison(originalUser)
  const originalData = {
    name: originalUser?.name,
    employeeId: originalUser?.employeeId,
    dob: normalizeDOB(originalUser?.dob),
    email: originalUser?.email,
    team: originalTeamName,
    roles: originalRoleIds,
    status: originalUser?.isActive,
  }
  const updatedData = {
    name: newData.name,
    employeeId: newData.employeeId,
    dob: normalizeDOB(newData.dob),
    email: newData.email,
    team: newData.team,
    roles: newRoleIds,
    status: currentStatus,
  }
  return !isEqual(originalData, updatedData)
}

export const buildUserPayload = (
  editableUser: User,
  newData: RowData,
  newRoleIds: string[],
  teamId?: string | null,
): User => {
  return {
    ...editableUser,
    ...newData,
    teamId: teamId ?? editableUser.teamId,
    roles: newRoleIds,
    roleId: undefined,
    isActive: editableUser.isActive,
  }
}
