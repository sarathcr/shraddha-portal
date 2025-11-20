<script setup lang="ts">
import { watch } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import { useForm, useField } from 'vee-validate'
import { eventTypeSchema } from '@/views/admin/schemas/eventTypeSchema'
import type { EventType } from '@/types/eventType.model'
import { useEventType } from '../composables/useEventType'

const props = defineProps<{
  initialData?: EventType
}>()

const { addEventType } = useEventType()

const emit = defineEmits<{
  (e: 'submit', payload: EventType): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setValues } = useForm<EventType>({
  validationSchema: eventTypeSchema,
  initialValues: props.initialData || {
    eventTypeName: '',
    description: '',
  },
})

const { value: eventTypeName } = useField<string>('eventTypeName')
const { value: description } = useField<string>('description')

defineExpose({
  resetForm,
  setFormValues: setValues,
})

const onSubmit = handleSubmit(async (values) => {
  const payload: EventType = {
    id: props.initialData?.id ?? '',
    eventTypeName: values.eventTypeName,
    description: values.description,
  }

  const response = await addEventType(payload)

  if (response) {
    emit('submit', payload)
  }
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
    <div class="mb-2">
      <FloatLabel variant="on">
        <InputText
          id="eventTypeName"
          v-model="eventTypeName"
          class="w-full"
          :class="{ '!border-red-500': errors.eventTypeName }"
        />
        <label for="eventTypeName">EventType Name</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.eventTypeName }}</small>
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
        <label for="description">EventType Description</label>
      </FloatLabel>
      <small class="text-red-500 leading-none">{{ errors.description }}</small>
    </div>
    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>
