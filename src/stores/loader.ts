import { ref, computed } from 'vue'

const _isLoading = ref<boolean>(false)

export const setLoading = (state: boolean): void => {
  _isLoading.value = state
}

export const isLoading = computed<boolean>(() => _isLoading.value)
