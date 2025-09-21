import * as yup from 'yup'

const today = new Date()
today.setHours(0, 0, 0, 0)

export const committeeSchema = yup.object({
  year: yup
    .string()
    .required('Year is required')
    .matches(/^\d{4}-\d{4}$/, 'Year must be in format YYYY-YYYY')
    .test('is-consecutive', 'Years must be consecutive (e.g. 2021-2022)', (value) => {
      if (!value) return false
      const [start, end] = value.split('-').map(Number)
      if (isNaN(start) || isNaN(end)) return false
      return end === start + 1
    }),

  startDate: yup
    .date()
    .required('Start date is required')
    .min(today, 'Start date must be after today'),

  endDate: yup
    .date()
    .required('End date is required')
    .test(
      'within-one-year',
      'End date must be within 1 year of start date and after start date',
      function (value) {
        const startDate = this.parent.startDate
        if (!startDate || !value) return false
        const maxDate = new Date(startDate)
        maxDate.setFullYear(maxDate.getFullYear() + 1)
        return value > startDate && value <= maxDate
      },
    ),
})
