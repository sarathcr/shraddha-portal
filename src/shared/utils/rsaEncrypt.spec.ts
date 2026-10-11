import { describe, it, expect, vi } from 'vitest'
import { encryptPassword } from './rsaEncrypt'
import JSEncrypt from 'jsencrypt'

describe('rsaEncrypt utility', () => {
  it('encrypts plaintext into base64 string', () => {
    const plaintext = 'Admin@1234'
    const encrypted = encryptPassword(plaintext)

    expect(encrypted).toBeDefined()
    expect(typeof encrypted).toBe('string')
    expect(encrypted).not.toBe(plaintext)
    // 2048-bit RSA produces 344 base64 chars
    expect(encrypted.length).toBeGreaterThan(100)
    // Verify valid base64 pattern
    expect(() => atob(encrypted)).not.toThrow()
  })

  it('generates different ciphertexts for the same plaintext due to random padding', () => {
    const enc1 = encryptPassword('Secret123')
    const enc2 = encryptPassword('Secret123')

    expect(enc1).not.toBe(enc2)
  })

  it('throws error when encryption fails', () => {
    vi.spyOn(JSEncrypt.prototype, 'encrypt').mockReturnValueOnce(false)
    expect(() => encryptPassword('test')).toThrow(
      'Password encryption failed. Please verify public key configuration.',
    )
  })
})
