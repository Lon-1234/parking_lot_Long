import { ref, shallowRef } from 'vue'

export function useAsyncState<T>(loader: () => Promise<T>) {
  const data = shallowRef<T>()
  const loading = ref(false)
  const error = ref('')

  async function execute() {
    loading.value = true
    error.value = ''
    try {
      const result = await loader()
      data.value = result
      return result
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '请求失败'
      throw reason
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
