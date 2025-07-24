import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface ValidationComposable {
  validationErrors: Ref<Record<string, string>>
  validateField: (field: string, value: unknown, label: string) => void
  resetValidation: () => void
  isSaveDisabled: ComputedRef<boolean>
}

export const useValidation = (): ValidationComposable => {
  const validationErrors = ref<Record<string, string>>({})

  const validateField = (field: string, value: unknown, label: string): void => {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)

    if (isEmpty) {
      validationErrors.value[field] = `${label} is required`
      return
    }

    if (field === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        validationErrors.value[field] = `Please enter a valid ${label}`
        return
      }
    }

    delete validationErrors.value[field]
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
