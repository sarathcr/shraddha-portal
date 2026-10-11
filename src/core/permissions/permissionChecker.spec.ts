import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import {
  hasModuleAccess,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canPerformAction,
} from '@/core/permissions/permissionChecker'
import type { UserPermission } from '@/core/permissions/permission.types'

describe('Permission Checker Utilities', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockPermissions: UserPermission[] = [
    {
      role: 'Admin',
      module: 'Events',
      permissions: ['READ', 'CREATE', 'UPDATE'],
    },
    {
      role: 'Admin',
      module: 'Finance',
      permissions: ['READ'],
    },
  ]

  describe('hasModuleAccess', () => {
    it('returns true if user has access to module', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasModuleAccess('Events')).toBe(true)
    })

    it('returns false if user does not have access to module', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasModuleAccess('Settings')).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('returns true if user has specific permission in module', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasPermission('Events', 'CREATE')).toBe(true)
    })

    it('returns false if user lacks specific permission in module', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasPermission('Events', 'DELETE')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true if user has at least one of the permissions', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasAnyPermission('Events', ['DELETE', 'CREATE'])).toBe(true)
    })

    it('returns false if user has none of the permissions', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasAnyPermission('Finance', ['CREATE', 'UPDATE'])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true if user has all required permissions', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasAllPermissions('Events', ['READ', 'CREATE'])).toBe(true)
    })

    it('returns false if user is missing any required permission', () => {
      const store = usePermissionStore()
      store.setPermissions(mockPermissions)
      expect(hasAllPermissions('Events', ['READ', 'DELETE'])).toBe(false)
    })
  })

  describe('case-insensitivity', () => {
    it('matches permissions regardless of casing', () => {
      const store = usePermissionStore()
      store.setPermissions([
        {
          role: 'Staff',
          module: 'RolesAndAccess',
          permissions: ['Create', 'Read'] as any,
        },
      ])
      expect(hasPermission('RolesAndAccess', 'CREATE')).toBe(true)
      expect(hasPermission('rolesandaccess', 'READ')).toBe(true)
    })
  })

  describe('canPerformAction', () => {
    it('returns true when permission is explicitly granted', () => {
      const store = usePermissionStore()
      store.setPermissions([
        {
          role: 'NormalUser',
          module: 'Events',
          permissions: ['READ'],
        },
      ])
      expect(canPerformAction('Events', 'READ')).toBe(true)
      expect(canPerformAction('Events', 'CREATE')).toBe(false)
    })

    it('returns true for AdminHR role even without explicit permission entry', () => {
      const store = usePermissionStore()
      store.setPermissions([
        {
          role: 'AdminHR',
          module: 'RolesAndAccess',
          permissions: [],
        },
      ])
      expect(canPerformAction('RolesAndAccess', 'CREATE')).toBe(true)
    })
  })
})
