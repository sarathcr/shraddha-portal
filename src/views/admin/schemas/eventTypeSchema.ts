import * as yup from 'yup'

export const eventTypeSchema = yup.object({
  eventTypeName: yup
    .string()
    .trim()
    .min(2, 'Event Type Name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'EventType can only contain letters, numbers and spaces')
    .required('Event Type Name is required'),
  description: yup
    .string()
    .trim()
    .min(2, 'Description must be at least 2 characters')
    .required('Description is required'),
})
