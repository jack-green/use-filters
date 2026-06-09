import { describe, expect, it } from 'vitest'
import { arrayFilter, booleanFilter, numberFilter, stringFilter } from './filterFactories'

describe('filterFactories', () => {
  describe('stringFilter', () => {
    it('returns the query string from fromQuery', () => {
      const filter = stringFilter({ default: '' })
      expect(filter.fromQuery('hello')).toBe('hello')
    })

    it('returns undefined from toQuery when the value is missing or too short', () => {
      const filter = stringFilter({ default: '', minLength: 3 })
      expect(filter.toQuery(undefined)).toBeUndefined()
      expect(filter.toQuery('')).toBeUndefined()
      expect(filter.toQuery('hi')).toBeUndefined()
      expect(filter.toQuery('hey')).toBe('hey')
    })

    it('returns undefined from toQuery when the value is too long', () => {
      const filter = stringFilter({ default: '', maxLength: 5 })
      expect(filter.toQuery('short')).toBe('short')
      expect(filter.toQuery('toolong')).toBeUndefined()
    })
  })

  describe('numberFilter', () => {
    it('parses integers from query and returns undefined for invalid input', () => {
      const filter = numberFilter({ default: 0 })
      expect(filter.fromQuery('42')).toBe(42)
      expect(filter.fromQuery('abc')).toBeUndefined()
    })

    it('clamps values using min and max', () => {
      const filter = numberFilter({ default: 3, min: 2, max: 4 })
      expect(filter.fromQuery('1')).toBe(2)
      expect(filter.fromQuery('10')).toBe(4)
      expect(filter.toQuery(3)).toBe('3')
      expect(filter.toQuery(0)).toBe('2')
      expect(filter.toQuery(100)).toBe('4')
    })

    it('parses floating point values when float is true', () => {
      const filter = numberFilter({ default: 0, float: true })
      expect(filter.fromQuery('1.5')).toBe(1.5)
      expect(filter.toQuery(2.75)).toBe('2.75')
    })
  })

  describe('booleanFilter', () => {
    it('returns false for false-like query values', () => {
      const filter = booleanFilter({ default: false })
      expect(filter.fromQuery('false')).toBe(false)
      expect(filter.fromQuery('0')).toBe(false)
      expect(filter.fromQuery('no')).toBe(false)
      expect(filter.fromQuery('f')).toBe(false)
      expect(filter.fromQuery('n')).toBe(false)
      expect(filter.fromQuery('FALSE')).toBe(false)
    })

    it('returns true for non-false query values', () => {
      const filter = booleanFilter({ default: false })
      expect(filter.fromQuery('true')).toBe(true)
      expect(filter.fromQuery('yes')).toBe(true)
      expect(filter.fromQuery('anything')).toBe(true)
    })

    it('serializes true to query and omits false', () => {
      const filter = booleanFilter({ default: false })
      expect(filter.toQuery(true)).toBe('true')
      expect(filter.toQuery(false)).toBeUndefined()
    })
  })

  describe('arrayFilter', () => {
    it('returns undefined for an empty query', () => {
      const filter = arrayFilter({ default: [] })
      expect(filter.fromQuery('')).toBeUndefined()
    })

    it('splits comma-separated values and serializes arrays', () => {
      const filter = arrayFilter({ default: [] })
      expect(filter.fromQuery('a,b,c')).toEqual(['a', 'b', 'c'])
      expect(filter.toQuery(['a', 'b', 'c'])).toBe('a,b,c')
    })

    it('filters invalid values and limits the number of values', () => {
      const filter = arrayFilter({
        default: ['red'],
        validValues: ['red', 'green', 'blue'],
        maxValues: 2,
      })
      expect(filter.fromQuery('red,orange,blue')).toEqual(['red', 'blue'])
      expect(filter.toQuery(['red', 'orange', 'blue'])).toBe('red,blue')
    })

    it('returns undefined for empty arrays when serializing', () => {
      const filter = arrayFilter({ default: [] })
      expect(filter.toQuery([])).toBeUndefined()
    })
  })
})
