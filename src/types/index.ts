export interface IProduct {
  id?: string
  code: string
  name: string
  category: string
  quantity: number
}
export interface APIError {
  error?: { message?: string }
  message?: string
}
