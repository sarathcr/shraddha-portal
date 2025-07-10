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
  errors: string | null
  message: string
  pageNumber?: number
  pageSize?: number
  succeeded: boolean
  totalPages?: number
  totalRecords?: number
}
