<script setup lang="ts">
import { isLoading } from '@/stores/loader'
import type { Committee } from '@/types/commitee'
import type { OptionItem, User } from '@/types/user'
import { userSchema } from '@/views/admin/schemas/userSchema'
import { FloatLabel } from 'primevue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import { useField, useForm } from 'vee-validate'

const props = defineProps<{
  coremembers: OptionItem[]
  executivemembers: OptionItem[]
  initialData?: Omit<User, 'id' | 'dob'>
}>()

const emit = defineEmits<{
  (e: 'submit', payload: User): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm } = useForm<Committee>({
  validationSchema: userSchema,
  initialValues: props.initialData,
})

const { value: year } = useField<string>('committeeYear')
const { value: coreMembers } = useField<string>('coreMembers')
const { value: executiveMembers } = useField<string>('executiveMembers')
const { value: status } = useField<boolean>('status')
defineExpose({
  resetForm,
})

const onSubmit = handleSubmit(() => {
  //   emit('submit', values)
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
        ><InputText id="committeeYear" v-model="year" class="w-full" />
        <label for="committeeYear">Committee Year</label></FloatLabel
      >

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.year }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <MultiSelect
          id="coreMembers"
          v-model="coreMembers"
          optionLabel="label"
          optionValue="value"
          display="chip"
          class="w-full"
        />
        <label for="coreMembers">CoreMembers</label>
      </FloatLabel>

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.coreMembers }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <MultiSelect
          id="executiveMembers"
          v-model="executiveMembers"
          optionLabel="label"
          optionValue="value"
          display="chip"
          class="w-full"
        />
        <label for="coreMembers">ExecutiveMembers</label>
      </FloatLabel>

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.executiveMembers }}</small>
    </div>

    <div class="relative mb-2.5">
      <FloatLabel variant="on">
        <InputSwitch
          id="status"
          v-model="status"
          true-value="1"
          false-value="0"
          class="align-middle"
        />
        <label for="status" class="ml-2 font-semibold">Status</label>
      </FloatLabel>

      <small class="absolute left-3 pt-0.5 text-red-500">{{ errors.status }}</small>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" :disabled="isLoading" />
      <Button type="submit" label="Save" :loading="isLoading" />
    </div>
  </form>
</template>
