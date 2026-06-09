import { difference, intersection } from 'lodash'

export interface Filter<TQuery, TValue = TQuery> {
  type: 'string' | 'number' | 'boolean' | 'array'
  default?: TQuery
  withoutQuery?: boolean
  compare?: (a: TValue, b: TValue) => boolean
  fromQuery: (query: string) => TQuery | undefined
  toQuery: (value?: TQuery) => string | undefined
}

type ValueFromFilterConfig<T, C> = 'default' extends keyof C
  ? undefined extends C['default']
    ? T | undefined
    : T
  : T | undefined

type BaseFilterConfig = {
  /**
   * If true, this filter will not read from or write to the query string.  This can be useful if you want to use the filter's state management and comparison features, but don't want it to affect the URL.
   */
  withoutQuery?: boolean
}

type StringFilterConfig = BaseFilterConfig & {
  default?: string
  minLength?: number
  maxLength?: number
}

const mapBaseConfig = (config: BaseFilterConfig) => ({
  withoutQuery: config.withoutQuery,
})

export const stringFilter = <C extends StringFilterConfig>(
  config: C,
): Filter<string, ValueFromFilterConfig<string, C>> => ({
  type: 'string',
  default: config.default,
  ...mapBaseConfig(config),
  fromQuery: (query) => query,
  toQuery: (value) => {
    if (!value) return undefined
    if (config.minLength && value.length < config.minLength) return undefined
    // todo: should we truncate rather than omit?
    if (config.maxLength && value.length > config.maxLength) return undefined
    return value
  },
})

type NumberFilterConfig = BaseFilterConfig & {
  default?: number
  min?: number
  max?: number
  float?: boolean
}

export const numberFilter = <C extends NumberFilterConfig>(
  config: C,
): Filter<number, ValueFromFilterConfig<number, C>> => {
  const clampValue = (value: number) => {
    if (config.min !== undefined && value < config.min) return config.min
    if (config.max !== undefined && value > config.max) return config.max
    return value
  }

  return {
    type: 'number',
    default: config.default,
    ...mapBaseConfig(config),
    fromQuery: (query) => {
      const value = config.float ? parseFloat(query) : parseInt(query)
      if (Number.isNaN(value)) return undefined
      return clampValue(value)
    },
    toQuery: (value) => {
      if (value === undefined) return undefined
      return clampValue(value).toString()
    },
  }
}

type BooleanFilterConfig = BaseFilterConfig & {
  default?: boolean
}

export const booleanFilter = <C extends BooleanFilterConfig>(
  config: C,
): Filter<boolean, ValueFromFilterConfig<boolean, C>> => ({
  type: 'boolean',
  default: config.default,
  ...mapBaseConfig(config),
  fromQuery: (query) => {
    if (['false', '0', 'no', 'f', 'n'].includes(query.toLowerCase())) {
      return false
    }
    return true
  },
  toQuery: (value) => {
    return value ? 'true' : undefined
  },
})

type ArrayFilterConfig = BaseFilterConfig & {
  default?: string[]
  validValues?: string[]
  maxValues?: number
}

export const arrayFilter = <C extends ArrayFilterConfig>(
  config: C,
): Filter<string[], ValueFromFilterConfig<string[], C>> => {
  const constrainValues = (values: string[]): string[] => {
    // filter out invalid values
    if (config.validValues) {
      values = intersection(values, config.validValues)
    }

    // truncate to max values
    // todo: do we need to do this when READING the query?
    // todo: should we omit rather than truncate?
    if (config.maxValues !== undefined) {
      values = values.slice(0, config.maxValues)
    }

    return values
  }

  return {
    type: 'array',
    default: config.default,
    ...mapBaseConfig(config),
    compare: (a, b) => {
      return difference(a, b ?? []).length === 0 && difference(b, a ?? []).length === 0
    },
    fromQuery: (query) => {
      if (!query) return undefined
      return constrainValues(query.split(','))
    },
    toQuery: (value) => {
      if (!value || value.length == 0) return undefined
      // todo: escape commas?
      return constrainValues(value).join(',')
    },
  }
}
