// src/views/admin/schemas/userSchema.ts
import * as yup from 'yup'

export const userSchema = yup.object({
  name: yup.string().required('Name is required'),
  employeeId: yup.string().required('Employee ID is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  team: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one team')
    .required('Team is required'),
  role: yup.string().required('Role is required'),
})
