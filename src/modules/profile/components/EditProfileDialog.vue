<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import DialogFooter from '@/components/DialogFooter.vue'

interface ProfileData {
  name: string
  phone: string
  dob: Date | null
}

const props = defineProps<{
  visible: boolean
  initialData: ProfileData
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: ProfileData): void
  (e: 'cancel'): void
}>()

const name = ref('')
const phone = ref('')
const dob = ref<Date | null>(null)
const nameError = ref('')

const maxDate = new Date()

watch(
  () => props.visible,
  (isOpen) => {
    if (isOpen) {
      name.value = props.initialData.name || ''
      phone.value = props.initialData.phone || ''
      dob.value = props.initialData.dob || null
      nameError.value = ''
    }
  },
  { immediate: true },
)

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleSubmit = () => {
  if (!name.value.trim()) {
    nameError.value = 'Full name is required.'
    return
  }

  nameError.value = ''
  emit('submit', {
    name: name.value,
    phone: phone.value,
    dob: dob.value,
  })
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    header="Edit Profile Information"
    :modal="true"
    :style="{ width: '32rem' }"
    :closable="true"
    @hide="handleCancel"
  >
    <div class="flex flex-col gap-4 py-2">
      <!-- Full Name -->
      <div class="flex flex-col gap-1.5">
        <label for="profile-name" class="text-xs font-semibold text-slate-700">
          Full Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="profile-name"
          v-model="name"
          placeholder="Enter full name"
          class="w-full text-sm"
          :class="{ '!border-red-500': !!nameError }"
        />
        <small v-if="nameError" class="text-xs text-red-500">{{ nameError }}</small>
      </div>

      <!-- Phone Number -->
      <div class="flex flex-col gap-1.5">
        <label for="profile-phone" class="text-xs font-semibold text-slate-700">
          Phone Number
        </label>
        <InputText
          id="profile-phone"
          v-model="phone"
          placeholder="Enter phone number"
          class="w-full text-sm"
        />
      </div>

      <!-- Date of Birth -->
      <div class="flex flex-col gap-1.5">
        <label for="profile-dob" class="text-xs font-semibold text-slate-700">
          Date of Birth
        </label>
        <DatePicker
          id="profile-dob"
          v-model="dob"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="dd-mm-yy"
          :maxDate="maxDate"
          placeholder="Select date of birth"
          class="w-full text-sm"
        />
      </div>
    </div>

    <template #footer>
      <DialogFooter @cancel="handleCancel" @submit="handleSubmit" />
    </template>
  </Dialog>
</template>
