import { FilterMatchMode } from '@primevue/core/api'
import type { DataTableFilterMeta } from 'primevue/datatable'

export function buildBackendFilters(filters: DataTableFilterMeta): Record<string, string> {
  const result: Record<string, string> = {}

  Object.keys(filters).forEach((key) => {
    const filterObj = filters[key]
    if (
      filterObj &&
      typeof filterObj === 'object' &&
      'constraints' in filterObj &&
      Array.isArray((filterObj as any).constraints)
    ) {
      const val = (filterObj as any).constraints[0]?.value
      if (val !== null && val !== undefined && val !== '') {
        result[key] = String(val)
      }
    } else if (filterObj && typeof filterObj === 'object' && 'value' in filterObj) {
      const val = (filterObj as any).value
      if (val !== null && val !== undefined && val !== '') {
        result[key] = String(val)
      }
    }
  })

  return result
}

export function mapMatchModeToOperator(matchMode?: string): string {
  switch (matchMode) {
    case FilterMatchMode.EQUALS:
      return 'EQUALS'
    case FilterMatchMode.CONTAINS:
      return 'CONTAINS'
    case FilterMatchMode.STARTS_WITH:
      return 'STARTS_WITH'
    case FilterMatchMode.ENDS_WITH:
      return 'ENDS_WITH'
    default:
      return 'EQUALS'
  }
}

export interface PaginationSortColumn {
  active: string
  direction: 'asc' | 'desc'
}

export interface PaginationPayload {
  pageNumber: number
  pageSize: number
  multiSortedColumns: PaginationSortColumn[]
  filterMap: Record<string, string>
}

export interface LazyTableEvent {
  page?: number
  rows?: number
  sortField?: string | string[]
  sortOrder?: number
  filters?: Record<string, unknown>
}

export function buildFilterMap(
  filters?: Record<string, unknown> | null,
  transformValue?: (field: string, val: unknown) => unknown,
): Record<string, string> {
  const filterMap: Record<string, string> = {}
  if (!filters) return filterMap

  Object.entries(filters).forEach(([field, filterMeta]) => {
    const filter = filterMeta as {
      operator?: string
      constraints?: { value: unknown; matchMode: string }[]
    }
    if (filter?.constraints && filter.constraints.length > 0) {
      const validConstraints = filter.constraints.filter(
        (c) => c.value !== null && c.value !== undefined && c.value !== '',
      )
      if (validConstraints.length > 0) {
        const filterString = validConstraints
          .map((constraint, index) => {
            const operator =
              index === 0 ? '' : filter.operator?.toUpperCase() === 'OR' ? 'OR' : 'AND'
            const condition = mapMatchModeToOperator(constraint.matchMode)
            if (transformValue) {
              transformValue(field, constraint.value)
            }
            return `${operator} ${condition}`.trim()
          })
          .join(' ')

        filterMap[field] = filterString
      }
    }
  })

  return filterMap
}

export function buildPaginationPayload(
  event: LazyTableEvent,
  sortFieldMap: Record<string, string> = {},
  transformValue?: (field: string, val: unknown) => unknown,
): PaginationPayload {
  const payload: PaginationPayload = {
    pageNumber: event.page !== undefined ? event.page + 1 : 1,
    pageSize: event.rows || 10,
    multiSortedColumns: [],
    filterMap: buildFilterMap(event.filters, transformValue),
  }

  if (event.sortField) {
    const sortFieldStr = String(event.sortField)
    const mappedSortField = sortFieldMap[sortFieldStr] || sortFieldStr
    payload.multiSortedColumns.push({
      active: mappedSortField,
      direction: event.sortOrder === 1 ? 'asc' : 'desc',
    })
  }

  return payload
}
