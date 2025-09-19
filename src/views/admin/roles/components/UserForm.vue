<script setup lang="ts">
import { watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import { useForm, useField } from 'vee-validate'
import { userSchema } from '@/views/admin/schemas/userSchema'
import type { OptionItem, User } from '@/types/user'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import ToggleSwitch from 'primevue/toggleswitch'

interface UserFormValues {
  name: string
  employeeId: string
  dob: Date | null
  email: string
  team: string
  role: string
  status: boolean
}

const props = defineProps<{
  roles: OptionItem[]
  teams: OptionItem[]
  initialData?: Omit<User, 'id'>
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: User): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setFieldValue } = useForm<UserFormValues>({
  validationSchema: userSchema,
})

const { value: name } = useField<string>('name')
const { value: employeeId } = useField<string>('employeeId')
const { value: dob } = useField<Date | null>('dob')
const { value: email } = useField<string>('email')
const { value: team } = useField<string>('team')
const { value: role } = useField<string>('role')
const { value: status } = useField<boolean>('status')

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      setFieldValue(
        'dob',
        typeof newVal.dob === 'string' && newVal.dob ? new Date(newVal.dob) : null,
      )

      setFieldValue('name', newVal.name as string)
      setFieldValue('employeeId', newVal.employeeId as string)
      setFieldValue('email', newVal.email as string)
      setFieldValue('team', newVal.team as string)
      setFieldValue('role', newVal.role as string)
      setFieldValue('status', (newVal.status as boolean) ?? true)
    }
  },
  { immediate: true },
)

defineExpose({ resetForm })

const onSubmit = handleSubmit((values) => {
  let dobDate: string | undefined

  if (values.dob) {
    const parsed = new Date(values.dob)
    if (!isNaN(parsed.getTime())) {
      dobDate = parsed.toISOString().split('T')[0]
    }
  }

  const selectedRole = props.roles.find((r) => r.value === values.role)
  const selectedTeam = props.teams.find((t) => t.value === values.team)

  const payload: User = {
    name: values.name?.trim() || '',
    employeeId: values.employeeId?.trim() || '',
    email: values.email?.trim() || '',
    dob: dobDate,
    teamId: selectedTeam ? parseInt(selectedTeam.value) : 0,
    roleId: selectedRole ? parseInt(selectedRole.value) : 0,
    status: values.status,
  }

  emit('submit', payload)
})

const onCancel = (): void => {
  emit('cancel')
  resetForm()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2">
    <div class="relative mb-2.5">
      <FloatLabel variant="on"
        ><InputText
          id="username"
          v-model="name"
          class="w-full"
          :class="{ '!border-red-500': errors.name }"
        />
        <label for="username">User Name</label></FloatLabel
      >

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.name }}</small>
    </div>
    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <DatePicker
          v-model="dob"
          showIcon
          fluid
          iconDisplay="input"
          id="dob"
          class="w-full"
          :class="{
            'w-full [&>input]:border [&>input]:rounded-md [&>input]:!border-red-500': errors.dob,
            'w-full [&>input]:border [&>input]:rounded-md': !errors.dob,
          }"
          dateFormat="yy-mm-dd"
        />

        <label for="dob">Date of birth</label></FloatLabel
      >

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.dob }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on"
        ><InputText
          id="employeeId"
          v-model="employeeId"
          class="w-full"
          :class="{ '!border-red-500': errors.employeeId }"
        />
        <label for="employeeId">Employee ID</label></FloatLabel
      >

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.employeeId }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on"
        ><InputText
          id="email"
          v-model="email"
          class="w-full"
          :class="{ '!border-red-500': errors.email }"
        />

        <label for="email">Email</label></FloatLabel
      >

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.email }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <Select
          id="team"
          filter
          v-model="team"
          :options="props.teams"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          :class="{ '!border-red-500': errors.team }"
        />
        <label for="team" class="font-semibold mb-2">Team</label>
      </FloatLabel>

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.team }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <Select
          id="role"
          v-model="role"
          :options="props.roles"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          :class="{ '!border-red-500': errors.role }"
        /><label for="role">Role</label>
      </FloatLabel>

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.role }}</small>
    </div>

    <div class="relative mb-2.5">
      <div>
        <label for="status">Status</label>
      </div>
      <ToggleSwitch v-model="status" :class="{ 'p-invalid': errors.status }" />
      <small v-if="errors.status" class="left-3 pt-0.5 text-red-500">
        {{ errors.status }}
      </small>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" :disabled="isLoading" />
      <Button type="submit" label="Save" :loading="isLoading" />
    </div>
  </form>
</template>
