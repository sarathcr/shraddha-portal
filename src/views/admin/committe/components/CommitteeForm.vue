<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import FloatLabel from 'primevue/floatlabel'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import DatePicker from 'primevue/datepicker'
import type { Committee } from '@/types/commitee'
import {
  committeeRoles,
  committeeUsers,
  getRolesData,
  getUsersData,
  useCommittee,
} from '../composable/useCommitte'
import { committeeSchema } from '../../schemas/committeeSchema'

const emit = defineEmits<{
  (e: 'submit', payload: Committee): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm } = useForm<Committee>({
  validationSchema: committeeSchema,
})

const { value: year } = useField<string>('year')
const { value: startDate, errorMessage: startDateError } = useField<Date | null>('startDate')
const { value: endDate, errorMessage: endDateError } = useField<Date | null>('endDate')
const { value: isActive } = useField<boolean>('isActive')
isActive.value = false
const coreRoles = ref<{ id: string; name: string }[]>([])
const executiveRole = ref<{ id: string; name: string } | null>(null)
const usersByRole = ref<Record<string, { id: string; fullName: string }[]>>({})

const selectedCoreMembers = ref<Record<string, string>>({})
const selectedExecutiveMember = ref<string | null>(null)
const { addCommittee } = useCommittee()

onMounted(async () => {
  await Promise.all([getRolesData(), getUsersData()])

  const allowedRoles = ['Treasurer', 'admin', 'Super Admin', 'Test HR']
  coreRoles.value = committeeRoles.value
    .filter((r) => allowedRoles.includes(r.label) && r.label !== 'Executive Committee Member')
    .map((r) => ({ id: r.value, name: r.label }))
  const exec = committeeRoles.value.find((r) => r.label === 'Executive Committee Member')
  executiveRole.value = exec ? { id: exec.value, name: exec.label } : null
  coreRoles.value.forEach((role) => {
    const roleUsers = committeeUsers.value
      .filter((u) => u.roleId === role.id && u.value && u.label)
      .map((u) => ({
        id: u.value ?? '',
        fullName: u.label ?? '',
      }))

    usersByRole.value[role.id] = roleUsers
    if (roleUsers.length === 1) {
      selectedCoreMembers.value[role.id] = roleUsers[0].id
    }
  })

  if (executiveRole.value) {
    const execUsers = committeeUsers.value
      .filter((u) => u.roleId === executiveRole.value!.id && u.userId && u.label)
      .map((u) => ({
        id: u.userId ?? '',
        fullName: u.label ?? '',
      }))

    usersByRole.value[executiveRole.value.id] = execUsers

    if (execUsers.length === 1) {
      selectedExecutiveMember.value = execUsers[0].id
    }
  }
})

const onSubmit = handleSubmit(async () => {
  const committeePayload: Committee = {
    year: year.value,
    startDate: startDate.value ? startDate.value.toISOString().split('T')[0] : undefined,
    endDate: endDate.value ? endDate.value.toISOString().split('T')[0] : undefined,
    isActive: isActive.value,
    coreMembers: Object.entries(selectedCoreMembers.value).map(([roleId, userId]) => ({
      userId: userId,
      roleId: roleId.toString(),
    })),
    executiveMembers:
      executiveRole.value && selectedExecutiveMember.value
        ? [
            {
              value: selectedExecutiveMember.value,
              roleId: executiveRole.value.id.toString(),
            },
          ]
        : [],
  }

  const response = await addCommittee(committeePayload)
  if (response.succeeded && response.data) {
    emit('submit', response.data)
    resetForm()
  }
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
      <FloatLabel variant="on" class="w-1/2">
        <DatePicker v-model="startDate" dateFormat="yy-mm-dd" />
        <label>Start Date</label>
        <small v-if="startDateError" class="text-red-500">{{ startDateError }}</small>
      </FloatLabel>

      <FloatLabel variant="on" class="w-1/2">
        <DatePicker v-model="endDate" dateFormat="yy-mm-dd" />
        <label>End Date</label>
        <small v-if="endDateError" class="text-red-500">{{ endDateError }}</small>
      </FloatLabel>
    </div>
    <div>
      <h4 class="font-semibold mb-2">Core Members</h4>
      <div v-for="role in coreRoles" :key="role.id" class="flex gap-3 mb-2">
        <Dropdown
          :modelValue="role.id"
          :options="[role]"
          optionLabel="name"
          optionValue="id"
          disabled
        />
        <Dropdown
          v-model="selectedCoreMembers[role.id]"
          :options="usersByRole[role.id] || []"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Select User"
        />
      </div>
    </div>
    <div>
      <h4 class="font-semibold mb-2">Executive Members</h4>
      <div v-if="executiveRole" class="flex gap-3 mb-2">
        <Dropdown
          :modelValue="executiveRole.id"
          :options="[executiveRole]"
          optionLabel="name"
          optionValue="id"
          disabled
        />
        <Dropdown
          v-model="selectedExecutiveMember"
          :options="usersByRole[executiveRole.id] || []"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Select User"
        />
      </div>
    </div>

    <div class="relative mb-2.5">
      <h4 class="font-semibold mb-2">Status</h4>
      <ToggleSwitch v-model="isActive" :class="{ 'p-invalid': errors.status }" />
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
