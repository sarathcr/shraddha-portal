import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatDateForAPI,
  parseDDMMYYYY,
  formatDateDDMMYYYY,
  formatLongDate,
} from './dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('returns N/A for null or undefined', () => {
      expect(formatDate(null)).toBe('N/A')
      expect(formatDate(undefined)).toBe('N/A')
      expect(formatDate('')).toBe('N/A')
    })

    it('returns N/A for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('N/A')
    })

    it('formats valid date correctly', () => {
      const formatted = formatDate('2026-10-11T12:00:00Z')
      expect(formatted).toContain('2026')
      expect(formatted).toContain('Oct')
    })
  })

  describe('formatDateTime', () => {
    it('returns N/A for null or invalid date', () => {
      expect(formatDateTime(null)).toBe('N/A')
      expect(formatDateTime('invalid')).toBe('N/A')
    })

    it('formats valid date with time', () => {
      const formatted = formatDateTime('2026-10-11T12:30:00Z')
      expect(formatted).toContain('2026')
    })
  })

  describe('formatDateForAPI', () => {
    it('returns empty string for null or invalid date', () => {
      expect(formatDateForAPI(null)).toBe('')
      expect(formatDateForAPI('invalid')).toBe('')
    })

    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 9, 11) // Month is 0-indexed: 9 = Oct
      expect(formatDateForAPI(date)).toBe('2026-10-11')
    })
  })

  describe('parseDDMMYYYY', () => {
    it('returns null for empty string or null', () => {
      expect(parseDDMMYYYY(null)).toBeNull()
      expect(parseDDMMYYYY('')).toBeNull()
    })

    it('parses DD/MM/YYYY string correctly', () => {
      const parsed = parseDDMMYYYY('11/10/2026')
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed?.getFullYear()).toBe(2026)
      expect(parsed?.getMonth()).toBe(9)
      expect(parsed?.getDate()).toBe(11)
    })

    it('parses standard ISO date string', () => {
      const parsed = parseDDMMYYYY('2026-10-11')
      expect(parsed).toBeInstanceOf(Date)
    })
  })

  describe('formatDateDDMMYYYY', () => {
    it('returns empty string for null', () => {
      expect(formatDateDDMMYYYY(null)).toBe('')
    })

    it('returns raw string for invalid date', () => {
      expect(formatDateDDMMYYYY('invalid')).toBe('invalid')
    })

    it('formats as DD/MM/YYYY', () => {
      const date = new Date(2026, 9, 11)
      expect(formatDateDDMMYYYY(date)).toBe('11/10/2026')
    })
  })

  describe('formatLongDate', () => {
    it('returns empty string for invalid date', () => {
      expect(formatLongDate('invalid-date')).toBe('')
    })

    it('formats full long date', () => {
      const date = new Date(2026, 9, 11)
      const formatted = formatLongDate(date)
      expect(formatted).toContain('October')
      expect(formatted).toContain('2026')
    })
  })
})
