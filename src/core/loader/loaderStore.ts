import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoaderStore = defineStore('loader', () => {
  const isLoading = ref<boolean>(false)

  function startLoading(): void {
    isLoading.value = true
  }

  function stopLoading(): void {
    isLoading.value = false
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
})

export async function simulateApiCall<T>(fn: () => Promise<T>, delay = 300): Promise<T> {
  const store = useLoaderStore()
  store.startLoading()
  try {
    if (delay > 0) await new Promise((res) => setTimeout(res, delay))
    return await fn()
  } finally {
    store.stopLoading()
  }
}
