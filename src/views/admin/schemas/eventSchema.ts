import * as yup from 'yup'

export const eventFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Event name is required')
    .min(2, 'Event name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Event name can only contain letters, numbers and spaces'),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .min(2, 'Description must be at least 10 characters'),
  committeeId: yup.string().required('Select a committee'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date cannot be before start date'),
  status: yup.string().required('Select a status'),
})
