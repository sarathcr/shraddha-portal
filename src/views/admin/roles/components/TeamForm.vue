<script setup lang="ts">
import { watch } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
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
  },
})

const { value: teamName } = useField<string>('teamName')
const { value: description } = useField<string>('description')

defineExpose({
  resetForm,
  setFormValues: setValues,
})

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    ...values,
    teamName: (values.teamName as string)?.trim() || '',
  })
})

const onCancel = (): void => {
  emit('cancel')
  resetForm()
}

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
    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <InputText
          id="teamName"
          v-model="teamName"
          class="w-full"
          :class="{ '!border-red-500': errors.teamName }"
        />
        <label for="teamName">Team Name</label>
      </FloatLabel>
      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.teamName }}</small>
    </div>

    <div class="relative mb-2.5">
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
      <small class="absolute left-3 pt-0.5 text-red-500 leading-none">{{
        errors.description
      }}</small>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>
