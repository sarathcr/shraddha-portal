import { describe, it, expect } from 'vitest'
import { useValidation } from './useValidation'

describe('useValidation Composable', () => {
  it('initializes with empty errors and isSaveDisabled as false', () => {
    const { validationErrors, isSaveDisabled } = useValidation()
    expect(validationErrors.value).toEqual({})
    expect(isSaveDisabled.value).toBe(false)
  })

  it('validates required fields', () => {
    const { validateField, validationErrors, isSaveDisabled } = useValidation()
    validateField('name', '', 'Name')
    expect(validationErrors.value.name).toBe('Name is required')
    expect(isSaveDisabled.value).toBe(true)

    validateField('name', 'John', 'Name')
    expect(validationErrors.value.name).toBeUndefined()
    expect(isSaveDisabled.value).toBe(false)
  })

  it('validates email format', () => {
    const { validateField, validationErrors } = useValidation()
    validateField('email', 'invalid-email', 'Email')
    expect(validationErrors.value.email).toBe('Please enter a valid Email')

    validateField('email', 'test@example.com', 'Email')
    expect(validationErrors.value.email).toBeUndefined()
  })

  it('validates date of birth >= 18 years old', () => {
    const { validateField, validationErrors } = useValidation()
    const under18 = new Date()
    under18.setFullYear(under18.getFullYear() - 10)
    validateField('dob', under18, 'Date of Birth')
    expect(validationErrors.value.dob).toBe('User must be at least 18 years old')

    const over18 = new Date()
    over18.setFullYear(over18.getFullYear() - 25)
    validateField('dob', over18, 'Date of Birth')
    expect(validationErrors.value.dob).toBeUndefined()
  })

  it('resets validation errors', () => {
    const { validateField, resetValidation, validationErrors, isSaveDisabled } = useValidation()
    validateField('name', '', 'Name')
    expect(isSaveDisabled.value).toBe(true)

    resetValidation()
    expect(validationErrors.value).toEqual({})
    expect(isSaveDisabled.value).toBe(false)
  })
})
