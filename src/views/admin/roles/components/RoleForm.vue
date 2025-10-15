<script setup lang="ts">
import { watch } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import ToggleSwitch from 'primevue/toggleswitch' // Import ToggleSwitch
import { useForm, useField } from 'vee-validate'
import { roleSchema } from '@/views/admin/schemas/roleSchema'
import type { Role } from '@/types/role'

const props = defineProps<{
  initialData?: Omit<Role, 'id'>
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Role): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setValues } = useForm<Role>({
  validationSchema: roleSchema,
  initialValues: props.initialData || {
    roleName: '',
    description: '',
    permissions: [],
    isActive: false,
  },
})

const { value: roleName } = useField<string>('roleName')
const { value: description } = useField<string>('description')
const { value: permissions } = useField<string[]>('permissions')
const { value: isActive } = useField<boolean>('isActive')

defineExpose({
  resetForm,
  setFormValues: setValues,
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
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
          id="roleName"
          v-model="roleName"
          class="w-full"
          :class="{ '!border-red-500': errors.roleName }"
        />
        <label for="roleName">Role Name</label>
      </FloatLabel>
      <small class="text-red-500">{{ errors.roleName }}</small>
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
        <label for="description">Role Description</label>
      </FloatLabel>
      <small class="text-red-500 leading-none">{{ errors.description }}</small>
    </div>

    <div class="mb-2">
      <p class="font-medium mb-2">Permissions</p>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="perm in ['read', 'create', 'update', 'delete']"
          :key="perm"
          class="flex items-center gap-2"
        >
          <Checkbox v-model="permissions" :inputId="perm" :value="perm" />
          <label :for="perm" class="cursor-pointer capitalize">{{ perm }}</label>
        </div>
      </div>
      <small class="text-red-500">{{ errors.permissions }}</small>
    </div>

    <div class="mb-2">
      <div>
        <label for="isActive">Status</label>
      </div>
      <ToggleSwitch v-model="isActive" :class="{ 'p-invalid': errors.isActive }" />
      <small v-if="errors.isActive" class="left-3 pt-0.5 text-red-500">
        {{ errors.isActive }}
      </small>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>
