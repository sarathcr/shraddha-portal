import axios, { type AxiosInstance } from 'axios'
import { setupInterceptors } from '../Interceptors/interceptors'

export const createApi = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  setupInterceptors(instance)

  return instance
}
