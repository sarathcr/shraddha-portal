import * as yup from 'yup'

export const roleSchema = yup.object({
  roleName: yup
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Role can only contain letters, numbers and spaces')
    .required('Role name is required'),
  description: yup
    .string()
    .trim()
    .min(2, 'Description must be at least 2 characters')
    .required('Description is required'),
  permissions: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one permission must be selected')

    .required('Permissions are required'),
  isActive: yup.boolean().required('Status is required'),
})
