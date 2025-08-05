export interface IProduct {
  id?: string
  code: string
  name: string
  category: string
  quantity: number
}

export interface APIError {
  error?: {
    businessError?: number
    message: string
    errorValue?: string
    type?: string
  }
  message: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  succeeded: boolean
  errors: string[] | null
  pageNumber: number
  pageSize: number
  totalPages: number
  totalRecords: number
}
