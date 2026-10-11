import { ref, computed, type Ref, type ComputedRef } from 'vue'
import * as yup from 'yup'

interface ValidationComposable {
  validationErrors: Ref<Record<string, string>>
  validateField: (field: string, value: unknown, label: string) => void
  resetValidation: () => void
  isSaveDisabled: ComputedRef<boolean>
}

export const useValidation = (): ValidationComposable => {
  const validationErrors = ref<Record<string, string>>({})

  const validateField = (field: string, value: unknown, label: string): void => {
    try {
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)

      if (isEmpty) {
        validationErrors.value[field] = `${label} is required`
        return
      }

      // Email validation
      if (field === 'email' && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          validationErrors.value[field] = `Please enter a valid ${label}`
          return
        }
      }

      // Date of Birth validation (>=18 years)
      if (field === 'dob' && value instanceof Date) {
        const dobSchema = yup
          .date()
          .required(`${label} is required`)
          .typeError(`${label} must be a valid date`)
          .test('age', 'User must be at least 18 years old', (value) => {
            if (!value) return false
            const today = new Date()
            let age = today.getFullYear() - value.getFullYear()
            const monthDiff = today.getMonth() - value.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
              age--
            }
            return age >= 18
          })

        dobSchema.validateSync(value)
      }

      delete validationErrors.value[field]
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        validationErrors.value[field] = err.message
      } else {
        validationErrors.value[field] = 'Validation failed'
      }
    }
  }

  const resetValidation = (): void => {
    validationErrors.value = {}
  }

  const isSaveDisabled = computed(() => Object.keys(validationErrors.value).length > 0)

  return {
    validationErrors,
    validateField,
    resetValidation,
    isSaveDisabled,
  }
}
