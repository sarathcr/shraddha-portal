import * as yup from 'yup'

export const committeeSchema = yup.object({
  year: yup.string().required('Year is required'),

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
