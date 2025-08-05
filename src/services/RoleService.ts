import type { Role, PermissionOptions } from '@/types/role'

export const roles: Role[] = [
  {
    id: 'role1',
    roleName: 'Admin',
    description: 'Full system access',
    permissions: ['read', 'write', 'update', 'delete'],
  },
  {
    id: 'role2',
    roleName: 'Editor',
    description: 'Can create and edit content',
    permissions: ['read', 'write', 'update'],
  },
  {
    id: 'role3',
    roleName: 'Viewer',
    description: 'Read-only access',
    permissions: ['read'],
  },
  {
    id: 'role4',
    roleName: 'Manager',
    description: 'Manage teams and reports',
    permissions: ['read', 'update'],
  },
  {
    id: 'role5',
    roleName: 'Contributor',
    description: 'Write and update assigned sections',
    permissions: ['write', 'update'],
  },
]

export const permissions: PermissionOptions[] = [
  { label: 'Read', value: 'read' },
  { label: 'Write', value: 'write' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
]
