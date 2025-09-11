<script setup lang="ts">
import { committeeUsers } from '../composable/useCommitte'
import type { Committee, Members } from '@/types/commitee'
import { useField, useForm } from 'vee-validate'
import MultiSelect from 'primevue/multiselect'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { committeeSchema } from '@/views/admin/schemas/committeeSchema'
import Calendar from 'primevue/calendar'

const emit = defineEmits<{
  (e: 'submit', payload: Committee): void
  (e: 'cancel'): void
}>()
const { handleSubmit, errors, resetForm } = useForm<Committee>({
  validationSchema: committeeSchema,
})

const { value: year } = useField<string>('year')
const { value: startDate } = useField<Date>('startDate')
const { value: endDate } = useField<Date>('endDate')
const { value: coreMembers } = useField<Members[]>('coreMembers')
const { value: executiveMembers } = useField<Members[]>('executiveMembers')
const { value: status } = useField<boolean>('status')

defineExpose({ resetForm })

const onSubmit = handleSubmit((values) => {
  const committeePayload: Committee = {
    ...values,
    coreMembers: values.coreMembers,
    executiveMembers: values.executiveMembers,
  }
  emit('submit', committeePayload)
})

const onCancel = (): void => {
  emit('cancel')
  resetForm()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2 commiteeForm">
    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <InputText id="year" v-model="year" :class="{ 'p-invalid': errors.year }" class="w-full" />
        <label for="year">Committee Year</label>
      </FloatLabel>
      <small v-if="errors.year" class="absolute left-3 pt-0.5 text-red-500">
        {{ errors.year }}
      </small>
    </div>

    <div class="flex justify-between w-full gap-3">
      <div class="relative mb-2.5 w-1/2">
        <FloatLabel variant="on">
          <Calendar v-model="startDate" />
          <label for="year">Start Date</label>
        </FloatLabel>
      </div>
      <div class="relative mb-2.5 w-1/2">
        <FloatLabel variant="on">
          <Calendar v-model="endDate" />
          <label for="year">End Date</label>
        </FloatLabel>
      </div>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <MultiSelect
          id="coreMembers"
          v-model="coreMembers"
          :options="committeeUsers"
          optionLabel="label"
          optionValue="value"
          display="chip"
          filter
          :class="{ 'p-invalid': errors.coreMembers }"
          class="w-full"
        />
        <label for="coreMembers">Core Members</label>
      </FloatLabel>
      <small v-if="errors.coreMembers" class="absolute left-3 pt-0.5 text-red-500">
        {{ errors.coreMembers }}
      </small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <MultiSelect
          id="executiveMembers"
          v-model="executiveMembers"
          :options="committeeUsers"
          optionLabel="label"
          optionValue="value"
          display="chip"
          filter
          :class="{ 'p-invalid': errors.executiveMembers }"
          class="w-full"
        />
        <label for="executiveMembers">Executive Members</label>
      </FloatLabel>
      <small v-if="errors.executiveMembers" class="absolute left-3 pt-0.5 text-red-500">
        {{ errors.executiveMembers }}
      </small>
    </div>

    <div class="relative mb-2.5">
      <ToggleSwitch v-model="status" :class="{ 'p-invalid': errors.status }" />
      <small v-if="errors.status" class="absolute left-3 pt-0.5 text-red-500">
        {{ errors.status }}
      </small>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>

<style>
.p-multiselect-label {
  flex-wrap: wrap;
}
.p-dialog {
  margin: 16px !important;
}
.commiteeForm .p-inputwrapper {
  width: 100%;
}
</style>
