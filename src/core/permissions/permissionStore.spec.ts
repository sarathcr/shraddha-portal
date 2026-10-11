import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionStore } from '@/core/permissions/permissionStore'

describe('Permission Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('normalizes nested modulePermissions from login response correctly', () => {
    const store = usePermissionStore()
    const nestedData = [
      {
        roleId: '1',
        role: 'Admin',
        modulePermissions: [
          {
            moduleId: 'm1',
            module: 'Dashboard',
            permissions: [{ permissionId: 'p1', permission: 'READ' }],
          },
          {
            moduleId: 'm2',
            module: 'Events',
            permissions: [
              { permissionId: 'p2', permission: 'READ' },
              { permissionId: 'p3', permission: 'CREATE' },
            ],
          },
        ],
      },
    ]

    store.setPermissions(nestedData)

    expect(store.userPermissions).toHaveLength(2)
    expect(store.userPermissions[0]).toEqual({
      role: 'Admin',
      module: 'Dashboard',
      permissions: ['READ'],
    })
    expect(store.userPermissions[1]).toEqual({
      role: 'Admin',
      module: 'Events',
      permissions: ['READ', 'CREATE'],
    })
  })

  it('sets flat UserPermission array correctly', () => {
    const store = usePermissionStore()
    const flatData = [
      {
        role: 'Admin',
        module: 'Finance',
        permissions: ['READ'],
      },
    ]

    store.setPermissions(flatData as any)

    expect(store.userPermissions).toEqual([
      {
        role: 'Admin',
        module: 'Finance',
        permissions: ['READ'],
      },
    ])
  })

  it('normalizes menu item booleans correctly', () => {
    const store = usePermissionStore()
    const menuData = [
      {
        roleId: '1',
        role: 'Staff',
        moduleId: 'm1',
        module: 'Committee',
        read: true,
        create: false,
        update: true,
        delete: false,
      },
    ]

    store.setPermissions(menuData)

    expect(store.userPermissions).toEqual([
      {
        role: 'Staff',
        module: 'Committee',
        permissions: ['READ', 'UPDATE'],
      },
    ])
  })

  it('clears permissions correctly', () => {
    const store = usePermissionStore()
    store.setPermissions([
      {
        role: 'Admin',
        module: 'Dashboard',
        permissions: ['READ'],
      },
    ] as any)

    expect(store.userPermissions).toHaveLength(1)
    store.clearPermissions()
    expect(store.userPermissions).toHaveLength(0)
  })

  it('stores availableModules and computes moduleIdToNameMap correctly', () => {
    const store = usePermissionStore()
    expect(store.moduleIdToNameMap).toEqual({})

    store.setAvailableModules([
      { id: 'mod-1', module: 'RolesAndAccess' },
      { id: 'mod-2', module: 'Events' },
    ])

    expect(store.availableModules).toHaveLength(2)
    expect(store.moduleIdToNameMap).toEqual({
      'mod-1': 'RolesAndAccess',
      'mod-2': 'Events',
    })

    store.clearPermissions()
    expect(store.availableModules).toHaveLength(0)
    expect(store.moduleIdToNameMap).toEqual({})
  })
})
