import { describe, it, expect } from 'vitest'
import { normalizeUrl, buildApiUrl, resolveGatewayBaseUrl } from './apiConfig'

describe('apiConfig utility', () => {
  it('normalizes URLs correctly by removing trailing slashes', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
    expect(normalizeUrl('https://example.com///')).toBe('https://example.com')
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl(undefined)).toBe('')
  })

  it('builds /api endpoint correctly', () => {
    expect(buildApiUrl('https://example.com')).toBe('https://example.com/api')
    expect(buildApiUrl('https://example.com/api')).toBe('https://example.com/api')
    expect(buildApiUrl('https://example.com/api/')).toBe('https://example.com/api')
    expect(buildApiUrl('')).toBe('')
  })

  it('resolves pre-production gateway when hostname contains pre- or staging', () => {
    expect(resolveGatewayBaseUrl('pre-shraddha-portal.vercel.app')).toBe(
      'https://pre-shraddhaportal-gateway.runasp.net',
    )
    expect(resolveGatewayBaseUrl('staging.shraddha.com')).toBe(
      'https://pre-shraddhaportal-gateway.runasp.net',
    )
    expect(resolveGatewayBaseUrl('pre.shraddha-portal.com')).toBe(
      'https://pre-shraddhaportal-gateway.runasp.net',
    )
  })

  it('resolves dev gateway when hostname contains dev-', () => {
    expect(resolveGatewayBaseUrl('dev-shraddha-portal.vercel.app')).toBe(
      'https://dev-shraddhaportal-gateway.runasp.net',
    )
    expect(resolveGatewayBaseUrl('dev.shraddha.com')).toBe(
      'https://dev-shraddhaportal-gateway.runasp.net',
    )
  })

  it('resolves production gateway for production hostnames', () => {
    expect(resolveGatewayBaseUrl('shraddha-portal.vercel.app')).toBe(
      'https://shraddhaportal-gateway.runasp.net',
    )
    expect(resolveGatewayBaseUrl('portal.shraddha.com')).toBe(
      'https://shraddhaportal-gateway.runasp.net',
    )
  })

  it('resolves localhost to dev gateway by default', () => {
    expect(resolveGatewayBaseUrl('localhost')).toBe('https://dev-shraddhaportal-gateway.runasp.net')
    expect(resolveGatewayBaseUrl('127.0.0.1')).toBe('https://dev-shraddhaportal-gateway.runasp.net')
  })
})
