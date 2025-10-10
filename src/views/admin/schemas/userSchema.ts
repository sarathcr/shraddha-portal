import * as yup from 'yup'

export const userSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Username can only contain letters, numbers and spaces')
    .required('User name is required'),
  employeeId: yup
    .string()
    .required('Employee ID is required')
    .matches(
      /^(IN|TR)\d{1,4}$/,
      'Employee ID must start with "IN" or "TR" and be followed by 1 to 4 digits',
    ),
  dob: yup
    .date()
    .required('Dob is required')
    .typeError('Dob must be a valid date')
    .test('age', 'User must be at least 18 years old', (value) => {
      if (!value) return false
      const today = new Date()
      const age = today.getFullYear() - value.getFullYear()
      const m = today.getMonth() - value.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
        return age - 1 >= 18
      }
      return age >= 18
    }),
  email: yup
    .string()
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format. Must include "@" and "."'),
  team: yup.string().required('Team is required'),
  role: yup.string().required('Role is required'),
})
