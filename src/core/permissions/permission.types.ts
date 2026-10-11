export type ModuleName =
  | 'Dashboard'
  | 'RolesAndAccess'
  | 'Events'
  | 'Committee'
  | 'Approvals'
  | 'Finance'
  | 'BirthdayGifts'
  | 'Charity'
  | 'Tournaments'
  | 'Feedbacks'
  | 'MeetingMinutes'
  | 'Settings'

export type Permission = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'

export interface UserPermission {
  role: string
  module: ModuleName
  permissions: Permission[]
}
