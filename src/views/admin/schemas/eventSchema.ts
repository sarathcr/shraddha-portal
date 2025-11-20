import * as yup from 'yup'
import type { EventStatus } from '@/types/event'

const statuses: EventStatus[] = [
  'Pending',
  'Scheduled',
  'Postponed',
  'Cancelled',
  'Ongoing',
  'Completed',
]

export const eventFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Event name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Event name can only contain letters, numbers and spaces')
    .required('Event name is required'),
  committeeId: yup.string().required('Select a committee'),
  startDate: yup.date().required('Start date is required').typeError('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .typeError('End date is required')
    .min(yup.ref('startDate'), 'End date cannot be before start date'),
  status: yup
    .mixed<EventStatus>()
    .oneOf(statuses as EventStatus[], 'Invalid status')
    .required('Select status'),
})
