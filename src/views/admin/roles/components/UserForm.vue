<script setup lang="ts">
import { isLoading } from '@/stores/loader'
import type { OptionItem, User } from '@/types/user'
import { userSchema } from '@/views/admin/schemas/userSchema'
import { FloatLabel } from 'primevue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import { useField, useForm } from 'vee-validate'

const props = defineProps<{
  roles: OptionItem[]
  teams: OptionItem[]
  initialData?: Omit<User, 'id' | 'dob'>
}>()

const emit = defineEmits<{
  (e: 'submit', payload: User): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm } = useForm<User>({
  validationSchema: userSchema,
  initialValues: props.initialData,
})
const { value: name } = useField<string>('name')
const { value: employeeId } = useField<string>('employeeId')
const { value: email } = useField<string>('email')
const { value: team } = useField<string[]>('team')
const { value: role } = useField<string>('role')

defineExpose({
  resetForm,
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
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
        <MultiSelect
          id="team"
          filter
          v-model="team"
          :options="props.teams"
          display="chip"
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

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" :disabled="isLoading" />
      <Button type="submit" label="Save" :loading="isLoading" />
    </div>
  </form>
</template>
