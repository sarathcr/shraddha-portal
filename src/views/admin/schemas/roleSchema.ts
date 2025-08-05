import * as yup from 'yup'

export const roleSchema = yup.object({
  roleName: yup.string().trim().required('Role name is required'),
  description: yup.string().trim().required('Description is required'),
  permissions: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one permission must be selected')
    .required('Permissions are required'),
})
