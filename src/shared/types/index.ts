export * from './baseTable.types'
export * from './history.types'

export interface ApiResponse<T = any> {
  success?: boolean
  succeeded?: boolean
  message?: string
  data?: T
  statusCode?: number
  pageNumber?: number
  pageSize?: number
  totalRecords?: number
  totalPages?: number
  errors?: string[] | null
}

export interface APIError {
  message: string
  error?: string
  code?: string | number
  status?: number
}
