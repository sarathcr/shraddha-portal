import * as yup from 'yup'

const today = new Date()
today.setHours(0, 0, 0, 0)

export interface CommitteeFormData {
  year: string
  startDate: Date | null
  endDate: Date | null
  coreMembers: { userId: string; roleId: string }[]
  executiveMembers: { userId: string; roleId: string }[]
}

export const committeeSchema = (isEdit = false): yup.ObjectSchema<CommitteeFormData> =>
  yup
    .object({
      year: yup
        .string()
        .required('Year is required')
        .matches(/^\d{4}-\d{4}$/, 'Year must be in format YYYY-YYYY')
        .test('is-consecutive', 'Years must be consecutive (e.g. 2021-2022)', (value) => {
          if (!value) return false
          const [start, end] = value.split('-').map(Number)
          return end === start + 1
        })
        .defined(),
      startDate: isEdit
        ? yup.date().nullable().defined()
        : yup
            .date()
            .required('Start date is required')
            .min(
              new Date(new Date().setHours(0, 0, 0, 0)),
              'Start date cannot be in the past — it must be today or later',
            )
            .defined(),
      endDate: yup
        .date()
        .required('End date is required')
        .test(
          'minimum-one-year',
          'End date must be at least 1 year after start date',
          function (value) {
            const startDate = this.parent.startDate
            if (!startDate || !value) return false
            const minDate = new Date(startDate)
            minDate.setFullYear(minDate.getFullYear() + 1)
            return value >= minDate
          },
        )
        .defined(),

      coreMembers: yup
        .array()
        .of(
          yup.object({
            userId: yup.string().required('User is required').defined(),
            roleId: yup.string().required('Role is required').defined(),
          }),
        )
        .min(4, 'Please select a user for all core roles')
        .defined(),

      executiveMembers: yup
        .array()
        .of(
          yup.object({
            userId: yup.string().required('User is required').defined(),
            roleId: yup.string().required('Role is required').defined(),
          }),
        )
        .min(1, 'At least one Executive Member is required')
        .defined(),
    })
    .defined()
