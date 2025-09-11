import { createApi } from './api'

// Security microservice
export const api = createApi('https://shraddhaportalsecurity.azurewebsites.net/api')

// Committee microservice
export const committeeApi = createApi('https://shraddhaportalcommittee.azurewebsites.net/api')
