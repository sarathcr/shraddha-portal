import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useModulePermissions } from './useModulePermissions'
import * as permChecker from '@/core/permissions/permissionChecker'

describe('useModulePermissions Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('evaluates permission actions correctly', () => {
    vi.spyOn(permChecker, 'hasModuleAccess').mockReturnValue(true)
    vi.spyOn(permChecker, 'canPerformAction').mockImplementation(
      (_, action) => action === 'READ' || action === 'CREATE',
    )

    const perms = useModulePermissions('Dashboard')

    expect(perms.hasAnyAccess.value).toBe(true)
    expect(perms.canRead.value).toBe(true)
    expect(perms.canCreate.value).toBe(true)
    expect(perms.canUpdate.value).toBe(false)
    expect(perms.canDelete.value).toBe(false)
    expect(perms.canApproveReject.value).toBe(false)
  })
})
