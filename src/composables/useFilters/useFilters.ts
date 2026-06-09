import { computed, reactive, toRaw, watch } from 'vue'
import type { Filter } from './filterFactories'
import { useRoute, useRouter } from 'vue-router'

export type FilterValueType<F> = F extends Filter<any, infer V> ? V : never

export type FiltersFromSchema<S extends Record<string, Filter<any>>> = {
  [K in keyof S]: FilterValueType<S[K]>
}

export type FiltersConfig<S extends Record<string, Filter<any>>> = {
  /**
   * If true, filters will not read from or write to the query string.  This can be useful if you want to use the filter's state management and comparison features, but don't want it to affect the URL.
   * Note that this will override any individual filter's `withoutQuery` setting.
   */
  withoutQuery?: boolean
  schema: S
  onChanged?: (filters: FiltersFromSchema<S>) => void
}

export const useFilters = <S extends Record<string, Filter<any>>>(config: FiltersConfig<S>) => {
  const route = useRoute()
  const router = useRouter()

  const getInitialFilters = (withoutQuery?: boolean): FiltersFromSchema<S> => {
    const initialFilters = {} as FiltersFromSchema<S>
    Object.entries(config.schema).forEach(([key, filter]) => {
      // default filters
      let value: FilterValueType<S[typeof key]> = filter.default
      if (!withoutQuery && !filter.withoutQuery && typeof route.query[key] === 'string') {
        value = filter.fromQuery(route.query[key]) ?? value
      }

      initialFilters[key as keyof typeof initialFilters] = value
    })

    return initialFilters
  }

  const isDefaultFilterValue = (key: keyof S) => {
    const filter = config.schema[key]
    if (!filter) return true // if the filter doesn't exist, treat it as default.
    const value = filters[key as keyof typeof filters]
    if (filter.compare) {
      return filter.compare(value, filter.default as FilterValueType<S[typeof key]>)
    }
    return value === filter.default
  }

  const filters = reactive<FiltersFromSchema<S>>(getInitialFilters(config.withoutQuery))

  const updateQuery = () => {
    if (config.withoutQuery) return

    const newQuery = { ...route.query }

    Object.entries(config.schema).forEach(([key, filter]) => {
      if (filter.withoutQuery) return
      if (isDefaultFilterValue(key)) {
        delete newQuery[key]
        return
      }

      const queryValue = filter.toQuery(filters[key as keyof typeof filters])
      if (queryValue === undefined) {
        delete newQuery[key]
        return
      }

      newQuery[key] = queryValue
    })

    router.replace({ query: newQuery })
  }

  watch(filters, () => {
    updateQuery()
    config.onChanged?.(toRaw(filters) as FiltersFromSchema<S>)
  })

  const resetFilters = () => {
    Object.assign(filters, getInitialFilters(true))
  }

  const changedFilters = computed(() => {
    return Object.keys(config.schema).filter((key) => !isDefaultFilterValue(key))
  })

  const haveFiltersChanged = computed(() => changedFilters.value.length > 0)

  return {
    filters,
    resetFilters,
    changedFilters,
    haveFiltersChanged,
  }
}
