<script setup lang="ts">
import { watch } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import FloatLabel from 'primevue/floatlabel'
import { useForm, useField } from 'vee-validate'
import { teamSchema } from '@/views/admin/schemas/teamSchema'
import type { Team } from '@/types/team'

const props = defineProps<{
  initialData?: Omit<Team, 'id'>
  teams: Team[]
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Omit<Team, 'id'>): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setValues } = useForm<Omit<Team, 'id'>>({
  validationSchema: teamSchema,
  initialValues: props.initialData || {
    teamName: '',
    description: '',
    isActive: false,
  },
})

const { value: teamName } = useField<string>('teamName')
const { value: description } = useField<string>('description')
const { value: isActive } = useField<boolean>('isActive')

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    ...values,
    teamName: (values.teamName as string)?.trim() || '',
  })
})

defineExpose({
  resetForm,
  setFormValues: setValues,
  onSubmit,
})

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) setValues(newVal)
    else resetForm()
  },
  { deep: true },
)
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2">
    <div class="mb-2">
      <FloatLabel variant="on">
        <InputText
          id="teamName"
          v-model="teamName"
          class="w-full"
          :class="{ '!border-red-500': errors.teamName }"
        />
        <label for="teamName">Team Name</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.teamName }}</small>
    </div>

    <div class="mb-2">
      <FloatLabel variant="on">
        <Textarea
          id="description"
          v-model="description"
          rows="4"
          class="w-full"
          :class="{ '!border-red-500': errors.description }"
        />
        <label for="description">Team Description</label>
      </FloatLabel>
      <small class="text-red-500 leading-none">
        {{ errors.description }}
      </small>
    </div>

    <div class="mb-2">
      <div>
        <label for="isActive">Status</label>
      </div>
      <ToggleSwitch v-model="isActive" :class="{ 'p-invalid': errors.isActive }" />
      <small v-if="errors.isActive" class="text-red-500">
        {{ errors.isActive }}
      </small>
    </div>
  </form>
</template>
