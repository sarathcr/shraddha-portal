import { describe, it, expect } from 'vitest'
import {
  mapMatchModeToOperator,
  buildFilterMap,
  buildPaginationPayload,
  buildBackendFilters,
} from './filterUtils'
import { FilterMatchMode } from '@primevue/core/api'

describe('filterUtils', () => {
  describe('mapMatchModeToOperator', () => {
    it('maps correctly to uppercase operators', () => {
      expect(mapMatchModeToOperator(FilterMatchMode.EQUALS)).toBe('EQUALS')
      expect(mapMatchModeToOperator(FilterMatchMode.CONTAINS)).toBe('CONTAINS')
      expect(mapMatchModeToOperator(FilterMatchMode.STARTS_WITH)).toBe('STARTS_WITH')
      expect(mapMatchModeToOperator(FilterMatchMode.ENDS_WITH)).toBe('ENDS_WITH')
      expect(mapMatchModeToOperator('unknown')).toBe('EQUALS')
    })
  })

  describe('buildFilterMap', () => {
    it('returns empty object when filters is null or empty', () => {
      expect(buildFilterMap(null)).toEqual({})
      expect(buildFilterMap({})).toEqual({})
    })

    it('processes single constraint correctly', () => {
      const filters = {
        name: {
          operator: 'and',
          constraints: [{ value: 'John', matchMode: FilterMatchMode.CONTAINS }],
        },
      }
      expect(buildFilterMap(filters)).toEqual({
        name: 'CONTAINS',
      })
    })

    it('processes multiple constraints with operator', () => {
      const filters = {
        name: {
          operator: 'or',
          constraints: [
            { value: 'John', matchMode: FilterMatchMode.STARTS_WITH },
            { value: 'Doe', matchMode: FilterMatchMode.ENDS_WITH },
          ],
        },
      }
      expect(buildFilterMap(filters)).toEqual({
        name: 'STARTS_WITH OR ENDS_WITH',
      })
    })
  })

  describe('buildPaginationPayload', () => {
    it('creates default pagination payload', () => {
      const event = {
        page: 0,
        rows: 25,
      }
      const payload = buildPaginationPayload(event)
      expect(payload.pageNumber).toBe(1)
      expect(payload.pageSize).toBe(25)
      expect(payload.multiSortedColumns).toEqual([])
      expect(payload.filterMap).toEqual({})
    })

    it('includes mapped sort fields', () => {
      const event = {
        page: 1,
        rows: 10,
        sortField: 'userName',
        sortOrder: 1,
      }
      const sortMap = { userName: 'user_name' }
      const payload = buildPaginationPayload(event, sortMap)
      expect(payload.pageNumber).toBe(2)
      expect(payload.multiSortedColumns).toEqual([{ active: 'user_name', direction: 'asc' }])
    })

    it('handles descending sort', () => {
      const event = {
        sortField: 'role',
        sortOrder: -1,
      }
      const payload = buildPaginationPayload(event)
      expect(payload.multiSortedColumns).toEqual([{ active: 'role', direction: 'desc' }])
    })
  })

  describe('buildBackendFilters', () => {
    it('handles constraint arrays and single values', () => {
      const filters = {
        status: {
          constraints: [{ value: 'Active' }],
        },
        search: {
          value: 'Query',
        },
      } as any
      const result = buildBackendFilters(filters)
      expect(result).toEqual({
        status: 'Active',
        search: 'Query',
      })
    })
  })
})
