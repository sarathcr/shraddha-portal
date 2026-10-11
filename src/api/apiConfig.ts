/**
 * API & Gateway Configuration
 *
 * Resolves endpoint URLs dynamically using Vite environment variables.
 * In production/dev, all microservice traffic flows through the API Gateway.
 */

const normalizeUrl = (url?: string): string => {
  if (!url) return ''
  return url.trim().replace(/\/+$/, '')
}

const buildApiUrl = (baseUrl?: string): string => {
  const clean = normalizeUrl(baseUrl)
  if (!clean) return ''
  return clean.endsWith('/api') ? clean : `${clean}/api`
}

// 1. Gateway Base URL & Gateway /api endpoint
const rawGateway = import.meta.env.VITE_API_GATEWAY_URL
export const GATEWAY_BASE_URL =
  normalizeUrl(rawGateway) || 'https://dev-shraddhaportal-gateway.runasp.net'
export const GATEWAY_API_URL = buildApiUrl(GATEWAY_BASE_URL)

// 2. Security API Endpoint
export const SECURITY_API_BASE_URL = rawGateway
  ? GATEWAY_API_URL
  : buildApiUrl(import.meta.env.VITE_SECURITY_API_URL) ||
    'https://dev-shraddhaportal-security.runasp.net/api'

// 3. Committee API Endpoint
export const COMMITTEE_API_BASE_URL = rawGateway
  ? GATEWAY_API_URL
  : buildApiUrl(import.meta.env.VITE_COMMITTEE_API_URL) ||
    'https://dev-shraddhaportal-committee.runasp.net/api'
