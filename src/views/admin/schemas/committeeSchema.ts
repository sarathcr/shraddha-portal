import * as yup from 'yup'

export const committeeSchema = yup.object({
  year: yup
    .string()
    .required('Year is required')
    .matches(/^\d{4}-\d{4}$/, 'Year must be in format YYYY-YYYY')
    .test('is-consecutive', 'Years must be consecutive (e.g. 2022-2023)', (value) => {
      if (!value) return false
      const [start, end] = value.split('-').map(Number)
      return end === start + 1
    }),

  coreMembers: yup
    .array()
    .of(yup.string().required('Each core member must be a valid ID'))
    .min(1, 'At least one core member is required')
    .required('Core members are required'),

  executiveMembers: yup
    .array()
    .of(yup.string().required('Each executive member must be a valid ID'))
    .min(1, 'At least one executive member is required')
    .required('Executive members are required'),
})
