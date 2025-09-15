import * as yup from 'yup'

export const teamSchema = yup.object({
  teamName: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Username can only contain letters, numbers, and spaces')
    .required('User name is required'),
  description: yup.string().trim().required('Description is required'),
})
