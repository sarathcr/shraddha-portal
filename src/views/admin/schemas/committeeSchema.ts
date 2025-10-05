import * as yup from 'yup'

const today = new Date()
today.setHours(0, 0, 0, 0)

// List of all required core roles
const requiredCoreRoles = ['President', 'Secretary', 'Treasurer', 'Assistant Treasurer']

export const committeeSchema = yup.object({
  year: yup
    .string()
    .required('Year is required')
    .matches(/^\d{4}-\d{4}$/, 'Year must be in format YYYY-YYYY')
    .test('is-consecutive', 'Years must be consecutive (e.g. 2021-2022)', (value) => {
      if (!value) return false
      const [start, end] = value.split('-').map(Number)
      return end === start + 1
    }),

  startDate: yup
    .date()
    .required('Start date is required')
    .min(today, 'Start date must be after today'),

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
    ),

  coreMembers: yup
    .array()
    .of(
      yup.object({
        userId: yup.string().required(),
        roleId: yup.string().required(),
      }),
    )
    .test(
      'all-core-roles-selected',
      '*Please select all core members: President, Secretary, Treasurer, Assistant Treasurer',
      function (members) {
        if (!members) return false
        const roleIdToName: Record<string, string> = this.options.context?.roleIdToName || {}
        const selectedRoles = members.map((m) => roleIdToName[m.roleId]).filter(Boolean)
        return requiredCoreRoles.every((role) => selectedRoles.includes(role))
      },
    ),

  executiveMembers: yup
    .array()
    .of(
      yup.object({
        userId: yup.string().required(),
        roleId: yup.string().required(),
      }),
    )
    .min(1, 'At least one Executive Member is required'),
})
