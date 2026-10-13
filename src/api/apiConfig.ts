/**
 * API & Gateway Configuration
 *
 * Resolves endpoint URLs dynamically with intelligent runtime environment detection:
 * - Pre-production / Staging (e.g. pre-shraddha-portal.vercel.app) -> pre-shraddhaportal-gateway
 * - Dev Preview / Localhost -> dev-shraddhaportal-gateway
 * - Production -> shraddhaportal-gateway
 */

export const normalizeUrl = (url?: string): string => {
  if (!url) return ''
  return url.trim().replace(/\/+$/, '')
}

export const buildApiUrl = (baseUrl?: string): string => {
  const clean = normalizeUrl(baseUrl)
  if (!clean) return ''
  return clean.endsWith('/api') ? clean : `${clean}/api`
}

export function resolveGatewayBaseUrl(hostname?: string): string {
  const currentHost = (
    hostname ||
    (typeof window !== 'undefined' ? window.location?.hostname : '') ||
    ''
  ).toLowerCase()

  // 1. Staging / Pre-production domain detection (e.g. pre-shraddha-portal.vercel.app)
  if (
    currentHost.includes('pre-') ||
    currentHost.includes('staging') ||
    currentHost.includes('pre.')
  ) {
    return 'https://pre-shraddhaportal-gateway.runasp.net'
  }

  // 2. Dev preview domain detection (e.g. dev-shraddha-portal.vercel.app)
  if (currentHost.includes('dev-') || currentHost.includes('dev.')) {
    return 'https://dev-shraddhaportal-gateway.runasp.net'
  }

  // 3. Localhost development
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const rawLocal = import.meta.env.VITE_API_GATEWAY_URL
    return normalizeUrl(rawLocal) || 'https://dev-shraddhaportal-gateway.runasp.net'
  }

  // 4. Explicit production domains (e.g. shraddha-portal.vercel.app)
  if (
    currentHost.includes('shraddha-portal.vercel.app') ||
    currentHost.includes('portal.shraddha.com')
  ) {
    return 'https://shraddhaportal-gateway.runasp.net'
  }

  // 5. Fallback from environment variables
  const rawGateway = import.meta.env.VITE_API_GATEWAY_URL
  return normalizeUrl(rawGateway) || 'https://shraddhaportal-gateway.runasp.net'
}

export function resolveSecurityServiceUrl(hostname?: string): string {
  const currentHost = (
    hostname ||
    (typeof window !== 'undefined' ? window.location?.hostname : '') ||
    ''
  ).toLowerCase()

  // 1. Staging / Pre-production domain detection
  if (
    currentHost.includes('pre-') ||
    currentHost.includes('staging') ||
    currentHost.includes('pre.')
  ) {
    return 'https://pre-shraddhaportal-security.runasp.net'
  }

  // 2. Dev preview domain detection
  if (currentHost.includes('dev-') || currentHost.includes('dev.')) {
    return 'https://dev-shraddhaportal-security.runasp.net'
  }

  // 3. Localhost development
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const rawLocal = import.meta.env.VITE_SECURITY_API_URL
    return normalizeUrl(rawLocal) || 'https://dev-shraddhaportal-security.runasp.net'
  }

  // 4. Explicit production domains
  if (
    currentHost.includes('shraddha-portal.vercel.app') ||
    currentHost.includes('portal.shraddha.com')
  ) {
    return 'https://shraddhaportal-security.runasp.net'
  }

  // 5. Fallback from environment variables
  const rawSecurity = import.meta.env.VITE_SECURITY_API_URL
  return normalizeUrl(rawSecurity) || 'https://shraddhaportal-security.runasp.net'
}

// 1. Gateway Base URL & Gateway /api endpoint
export const GATEWAY_BASE_URL = resolveGatewayBaseUrl()
export const GATEWAY_API_URL = buildApiUrl(GATEWAY_BASE_URL)

// 2. Direct Security Microservice Base URL (for static uploads / media assets)
export const SECURITY_SERVICE_BASE_URL = resolveSecurityServiceUrl()

// 3. Security API Endpoint
export const SECURITY_API_BASE_URL = GATEWAY_API_URL

// 4. Committee API Endpoint
export const COMMITTEE_API_BASE_URL = GATEWAY_API_URL
