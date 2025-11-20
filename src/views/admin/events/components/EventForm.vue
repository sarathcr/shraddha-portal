<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { eventFormSchema } from '@/views/admin/schemas/eventSchema'
import type { EventFormPayload, EventFormUI, Committee, EventStatus } from '@/types/event'
import type { PropType } from 'vue'

import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Editor from 'primevue/editor'
import { DatePicker, Select } from 'primevue'

const props = defineProps({
  initialData: {
    type: Object as PropType<EventFormUI | null>,
    default: null,
  },
  committees: {
    type: Array as PropType<Committee[]>,
    required: true,
  },
  eventTypeId: {
    type: String,
    required: true,
  },
})

/* Emits */
const emit = defineEmits<{
  (e: 'submit', payload: EventFormPayload): void
  (e: 'cancel'): void
}>()

/* Vee Validate */
const { handleSubmit, errors } = useForm<EventFormUI>({
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

const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')
const { value: committeeId } = useField<string>('committeeId')
const { value: startDate } = useField<Date | null>('startDate')
const { value: endDate } = useField<Date | null>('endDate')
const { value: status } = useField<EventStatus | ''>('status')

/* Status dropdown list */
const statusOptions = [
  'Pending',
  'Scheduled',
  'Postponed',
  'Cancelled',
  'Ongoing',
  'Completed',
] as EventStatus[]

/* Convert UI → Payload */
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

defineExpose({
  onSubmit,
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
    <!-- NAME -->
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

    <!-- DESCRIPTION -->
    <div>
      <label for="description" class="text-gray-500">Event Description</label>
      <Editor
        id="description"
        v-model="description"
        class="w-full"
        :class="{ '!border-red-500': errors.description }"
        editorStyle="height: 150px"
      />
    </div>

    <small class="text-red-500">{{ errors.description }}</small>

    <!-- COMMITTEE -->
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

    <!-- START DATE -->
    <FloatLabel variant="on">
      <DatePicker
        id="startDate"
        v-model="startDate"
        showIcon
        class="w-full"
        :class="{ '!border-red-500': errors.startDate }"
      />
      <label for="startDate">Start Date</label>
    </FloatLabel>
    <small class="text-red-500">{{ errors.startDate }}</small>

    <!-- END DATE -->
    <FloatLabel variant="on">
      <DatePicker
        id="endDate"
        v-model="endDate"
        showIcon
        class="w-full"
        :class="{ '!border-red-500': errors.endDate }"
      />
      <label for="endDate">End Date</label>
    </FloatLabel>
    <small class="text-red-500">{{ errors.endDate }}</small>

    <!-- STATUS -->
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
  </form>
</template>
