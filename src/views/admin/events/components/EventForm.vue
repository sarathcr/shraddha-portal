<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { eventFormSchema } from '@/views/admin/schemas/eventSchema'
import type { EventFormPayload, EventFormData, EventStatus } from '@/types/event'
import { onMounted, type PropType } from 'vue'

import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Editor from 'primevue/editor'
import { DatePicker, Select } from 'primevue'
import { useEventForm } from '../composables/useEventForm'

const props = defineProps({
  initialData: {
    type: Object as PropType<EventFormData | null>,
    default: null,
  },
  eventTypeId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'submit', payload: EventFormPayload): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors } = useForm<EventFormData>({
  validationSchema: eventFormSchema,
  initialValues: props.initialData || {
    name: '',
    description: '',
    committeeId: '',
    eventTypeId: props.eventTypeId,
    startDate: null,
    endDate: null,
    status: '',
  },
})

const { loadCommittees, committees } = useEventForm()
const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')
const { value: committeeId } = useField<string>('committeeId')
const { value: startDate } = useField<Date | null>('startDate')
const { value: endDate } = useField<Date | null>('endDate')
const { value: status } = useField<EventStatus | ''>('status')

const statusOptions = [
  'Pending',
  'Scheduled',
  'Postponed',
  'Cancelled',
  'Ongoing',
  'Completed',
] as EventStatus[]

const onSubmit = handleSubmit((values) => {
  const payload: EventFormPayload = {
    name: values.name,
    description: values.description,
    committeeId: values.committeeId,
    eventTypeId: props.eventTypeId,
    startDate: values.startDate ? values.startDate.toISOString() : '',
    endDate: values.endDate ? values.endDate.toISOString() : '',
    status: values.status as EventStatus,
  }

  emit('submit', payload)
})

onMounted(() => {
  void loadCommittees()
})

defineExpose({
  onSubmit,
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
    <div>
      <FloatLabel variant="on">
        <InputText
          id="name"
          v-model="name"
          class="w-full"
          :class="{ '!border-red-500': errors.name }"
        />
        <label for="name">Event Name</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.name }}</small>
    </div>

    <div>
      <label for="description" class="font-semibold mb-2">Event Description</label>
      <Editor
        id="description"
        v-model="description"
        class="w-full"
        :class="{ '!border-red-500': errors.description }"
        editorStyle="height: 150px"
      />
      <small class="text-red-500">{{ errors.description }}</small>
    </div>

    <div>
      <FloatLabel variant="on">
        <Select
          id="committeeId"
          v-model="committeeId"
          :options="committees"
          optionLabel="name"
          optionValue="id"
          class="w-full"
          :class="{ '!border-red-500': errors.committeeId }"
        />
        <label for="committeeId">Committee</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.committeeId }}</small>
    </div>

    <div>
      <FloatLabel variant="on">
        <DatePicker
          id="startDate"
          v-model="startDate"
          showIcon
          class="w-full"
          :class="{ 'has-error': errors.endDate }"
        />
        <label for="startDate">Start Date</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.startDate }}</small>
    </div>

    <div>
      <FloatLabel variant="on">
        <DatePicker
          id="endDate"
          v-model="endDate"
          showIcon
          class="w-full"
          :class="{ 'has-error': errors.endDate }"
        />
        <label for="endDate">End Date</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.endDate }}</small>
    </div>

    <div>
      <FloatLabel variant="on">
        <Select
          id="status"
          v-model="status"
          :options="statusOptions"
          class="w-full"
          :class="{ '!border-red-500': errors.status }"
        />
        <label for="status">Status</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.status }}</small>
    </div>
  </form>
</template>
