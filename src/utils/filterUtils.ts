import { FilterMatchMode } from '@primevue/core/api'

export const mapMatchModeToOperator = (matchMode: string, value: unknown): string => {
  switch (matchMode) {
    case FilterMatchMode.CONTAINS:
      return `like %${value}%`
    case FilterMatchMode.NOT_CONTAINS:
      return `not like %${value}%`
    case FilterMatchMode.STARTS_WITH:
      return `like ${value}%`
    case FilterMatchMode.ENDS_WITH:
      return `like %${value}`
    case FilterMatchMode.EQUALS:
      if (typeof value === 'boolean') {
        return `= ${value}`
      }
      return `= ${value}`
    case FilterMatchMode.NOT_EQUALS:
      return `!= ${value}`
    case FilterMatchMode.LESS_THAN:
      return `< ${value}`
    case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
      return `<= ${value}`
    case FilterMatchMode.GREATER_THAN:
      return `> ${value}`
    case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
      return `>= ${value}`
    case FilterMatchMode.DATE_IS:
      return `= ${value}`
    case FilterMatchMode.DATE_IS_NOT:
      return `!= ${value}`
    case FilterMatchMode.DATE_BEFORE:
      return `< ${value}`
    case FilterMatchMode.DATE_AFTER:
      return `> ${value}`
    default:
      return `= ${value}`
  }
}
