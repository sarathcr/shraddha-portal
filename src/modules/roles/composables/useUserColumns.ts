import { computed, type Ref, type ComputedRef } from 'vue'
import type { OptionItem, User } from '@/modules/roles/types/user.types'
import type { ColumnDef } from '@/shared/types/baseTable.model'
import { CommitteeRoles } from '@/shared/constants/committeeRoles.enum'

export function useUserColumns(
  teams: Ref<OptionItem[]>,
  roles: Ref<OptionItem[]>,
): {
  columns: ComputedRef<ColumnDef[]>
  isStatusDisabled: (row: User) => boolean
} {
  const columns = computed((): ColumnDef[] => [
    { label: 'Name', key: 'name', filterable: true, required: true },
    { label: 'Employee ID', key: 'employeeId', filterable: true, required: true },
    {
      label: 'Date of Birth',
      key: 'dob',
      filterable: true,
      required: true,
      useDateFilter: true,
      showAddButton: false,
    },
    { label: 'Email', key: 'email', filterable: true, required: true },
    {
      label: 'Team',
      key: 'team',
      filterable: true,
      filterOption: true,
      options: teams.value.map((t) => ({ label: t.label, value: t.label })),
      required: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
    },
    {
      label: 'Role',
      key: 'roles',
      backendKey: 'role',
      filterable: true,
      filterOption: true,
      options: roles.value.map((r) => ({ label: r.label, value: String(r.label) })),
      required: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
      useMultiSelect: true,
    },
    {
      label: 'Status',
      key: 'isActive',
      filterable: true,
      useToggle: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
    },
  ])

  const isStatusDisabled = (row: User): boolean => {
    if (!row) return false

    return row.roles && Array.isArray(row.roles)
      ? row.roles.some((role: any) =>
          Object.values(CommitteeRoles).includes(
            (typeof role === 'string' ? role : role.role) as CommitteeRoles,
          ),
        )
      : false
  }

  return {
    columns,
    isStatusDisabled,
  }
}
