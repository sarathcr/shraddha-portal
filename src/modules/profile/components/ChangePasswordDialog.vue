<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import DialogFooter from '@/components/DialogFooter.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: { currentPass: string; newPass: string; confirmPass: string }): void
  (e: 'cancel'): void
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

watch(
  () => props.visible,
  (isOpen) => {
    if (isOpen) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      errorMessage.value = ''
    }
  },
)

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleSubmit = () => {
  if (!currentPassword.value.trim()) {
    errorMessage.value = 'Current password is required.'
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = 'New password must be at least 6 characters long.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New password and confirm password do not match.'
    return
  }

  errorMessage.value = ''
  emit('submit', {
    currentPass: currentPassword.value,
    newPass: newPassword.value,
    confirmPass: confirmPassword.value,
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    header="Update Password"
    :modal="true"
    :style="{ width: '28rem' }"
    :closable="true"
    @hide="handleCancel"
  >
    <div class="flex flex-col gap-4 py-2">
      <div
        v-if="errorMessage"
        class="p-3 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100"
      >
        {{ errorMessage }}
      </div>

      <!-- Current Password -->
      <div class="flex flex-col gap-1.5">
        <label for="current-password" class="text-xs font-semibold text-slate-700">
          Current Password <span class="text-red-500">*</span>
        </label>
        <Password
          id="current-password"
          v-model="currentPassword"
          :feedback="false"
          toggleMask
          fluid
          class="w-full text-sm"
          inputClass="w-full"
          placeholder="Enter current password"
        />
      </div>

      <!-- New Password -->
      <div class="flex flex-col gap-1.5">
        <label for="new-password" class="text-xs font-semibold text-slate-700">
          New Password <span class="text-red-500">*</span>
        </label>
        <Password
          id="new-password"
          v-model="newPassword"
          toggleMask
          fluid
          class="w-full text-sm"
          inputClass="w-full"
          placeholder="Enter new password (min. 6 chars)"
        />
      </div>

      <!-- Confirm New Password -->
      <div class="flex flex-col gap-1.5">
        <label for="confirm-password" class="text-xs font-semibold text-slate-700">
          Confirm New Password <span class="text-red-500">*</span>
        </label>
        <Password
          id="confirm-password"
          v-model="confirmPassword"
          :feedback="false"
          toggleMask
          fluid
          class="w-full text-sm"
          inputClass="w-full"
          placeholder="Re-enter new password"
        />
      </div>
    </div>

    <template #footer>
      <DialogFooter @cancel="handleCancel" @submit="handleSubmit" />
    </template>
  </Dialog>
</template>
