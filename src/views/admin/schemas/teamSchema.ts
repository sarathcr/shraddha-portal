import * as yup from 'yup'

export const teamSchema = yup.object({
  teamName: yup.string().trim().required('Team name is required'),
  description: yup.string().trim().required('Description is required'),
})
