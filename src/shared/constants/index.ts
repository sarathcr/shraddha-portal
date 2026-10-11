import { createApi } from './api'
import { SECURITY_API_BASE_URL, COMMITTEE_API_BASE_URL } from '@/api/apiConfig'

// Security microservice / gateway
export const api = createApi(SECURITY_API_BASE_URL)

// Committee microservice / gateway
export const committeeApi = createApi(COMMITTEE_API_BASE_URL)
