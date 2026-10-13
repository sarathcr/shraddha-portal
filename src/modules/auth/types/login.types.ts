export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  userPermissions?: any[]
  avatarUrl?: string | null
  name?: string
  email?: string
  employeeId?: string
}
