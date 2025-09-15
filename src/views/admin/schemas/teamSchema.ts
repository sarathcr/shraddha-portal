import * as yup from 'yup'

export const teamSchema = yup.object({
  teamName: yup
    .string()
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'team can only contain letters, numbers, and spaces')
    .required('User name is required'),
  description: yup
    .string()
    .trim()
    .min(2, 'Description must be at least 2 characters')
    .required('Description is required'),
})
