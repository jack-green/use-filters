import { numberFilter, stringFilter, type Filter } from './filterFactories'
import { useFilters, type FiltersConfig } from './useFilters'

export const usePaginatedFilters = <S extends Record<string, Filter<any>>>(
  config: FiltersConfig<S>,
) => {
  config.schema = {
    ...config.schema,
    page: numberFilter({ default: 1, min: 1 }),
    pageSize: numberFilter({
      default: 30,
      min: 1,
      max: 100,
      withoutQuery: true,
    }),
    sort: stringFilter({ default: '' }),
  }

  return useFilters(config)
}
