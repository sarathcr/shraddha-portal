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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const validateField = async (field: string, value: unknown, label: string) => {
    try {
      if (field === 'dob') {
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

        await dobSchema.validate(value)
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
