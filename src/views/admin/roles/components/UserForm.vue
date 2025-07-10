<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { userSchema } from '@/views/admin/schemas/userSchema'
import type { User, OptionItem } from '@/types/user'
import { isLoading } from '@/stores/loader'
const props = defineProps<{
  roles: OptionItem[]
  teams: OptionItem[]
  initialData?: Omit<User, 'id' | 'dob'>
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Omit<User, 'id' | 'dob'>): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setValues } = useForm<Omit<User, 'id' | 'dob'>>({
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
  setValues,
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
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
    <div>
      <label for="username" class="font-semibold mb-2">Username</label>
      <InputText id="username" v-model="name" class="w-full" placeholder="Name" />
      <small class="text-red-500">{{ errors.name }}</small>
    </div>
    <div>
      <label for="employeeId" class="font-semibold mb-2">Employee ID</label>
      <InputText id="employeeId" v-model="employeeId" class="w-full" placeholder="Employee Id" />
      <small class="text-red-500">{{ errors.employeeId }}</small>
    </div>
    <div>
      <label for="email" class="font-semibold mb-2">Email</label>
      <InputText id="email" v-model="email" class="w-full" placeholder="Email Id" />
      <small class="text-red-500">{{ errors.email }}</small>
    </div>
    <div>
      <label for="team" class="font-semibold mb-2">Team</label>
      <MultiSelect
        id="team"
        filter
        v-model="team"
        :options="props.teams"
        display="chip"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Team(s)"
        class="w-full"
      />
      <small class="text-red-500">{{ errors.team }}</small>
    </div>
    <div>
      <label for="role" class="font-semibold mb-2">Role</label>
      <Select
        id="role"
        v-model="role"
        :options="props.roles"
        optionLabel="label"
        optionValue="value"
        placeholder="Select a Role"
        class="w-full"
      />
      <small class="text-red-500">{{ errors.role }}</small>
    </div>
    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" :disabled="isLoading.valueOf" />
      <Button type="submit" label="Save" :loading="isLoading.valueOf" />
    </div>
  </form>
</template>
