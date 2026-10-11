import { ref, computed } from 'vue'

const _isLoading = ref<boolean>(false)

export const setLoading = (state: boolean): void => {
  _isLoading.value = state
}

export const isLoading = computed<boolean>(() => _isLoading.value)

export async function simulateApiCall<T>(callback: () => Promise<T>): Promise<T> {
  setLoading(true)
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await callback()
  } finally {
    setLoading(false)
  }
}
