<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import FloatLabel from 'primevue/floatlabel'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import DatePicker from 'primevue/datepicker'

import type { Committee, CommitteeStringMembers, CommitteeUser } from '@/types/commitee'
import { committeeRoles, getRolesData, getUsersData, useCommittee } from '../composable/useCommitte'
import { committeeSchema } from '../../schemas/committeeSchema'
import { formatDateForAPI } from '@/utils/dateUtils'
import { CommitteeRoles } from '@/constants/committeeRoles.enum'

const emit = defineEmits<{
  (e: 'submit', payload: Committee): void
  (e: 'cancel'): void
}>()

const props = defineProps<{
  coremembers: { label: string; value: string }[]
  executivemembers: { label: string; value: string }[]
  committee?: Committee | null
}>()

interface CommitteeForm {
  year: string
  startDate?: Date | null
  endDate?: Date | null
  isActive: boolean
  coreMembers: CommitteeUser[]
  executiveMembers: CommitteeUser[]
}

const { handleSubmit, errors, resetForm } = useForm<CommitteeForm>({
  validationSchema: committeeSchema,
  validateOnMount: false,
})

const { value: year } = useField<string>('year')
const { value: startDate, errorMessage: startDateError } = useField<Date | null>('startDate')
const { value: endDate, errorMessage: endDateError } = useField<Date | null>('endDate')
const { value: isActive } = useField<boolean>('isActive')
const { value: coreMembers } = useField<CommitteeUser[]>('coreMembers')
const { value: executiveMembers } = useField<CommitteeUser[]>('executiveMembers')
isActive.value = false

const coreRoles = ref<{ id: string; name: string }[]>([])
const executiveRole = ref<{ id: string; name: string } | null>(null)
const usersByRole = ref<Record<string, { userId: string; fullName: string; roleId: string }[]>>({})

const selectedCoreMembers = ref<Record<string, string>>({})
const selectedExecutiveMember = ref<string[]>([])

const { addCommittee, handleEdit } = useCommittee()

onMounted(async () => {
  await Promise.all([getRolesData(), getUsersData()])
  const allowedRoles = ['President', 'Secretary', 'Treasurer', 'Assistant Treasurer']
  coreRoles.value = committeeRoles.value
    .filter((r) => allowedRoles.includes(r.label) && r.label !== 'Executive Committee Member')
    .map((r) => ({ id: r.value, name: r.label }))
  const exec = committeeRoles.value.find((r) => r.label === CommitteeRoles.ExecutiveMember)
  executiveRole.value = exec ? { id: exec.value, name: exec.label } : null
})

watch(
  selectedCoreMembers,
  (val) => {
    coreMembers.value = Object.entries(val).map(([roleId, userId]) => ({ roleId, userId }))
  },
  { deep: true },
)

watch(selectedExecutiveMember, (val) => {
  executiveMembers.value = val.map((userId) => ({
    userId,
    roleId: executiveRole.value?.id ?? '',
  }))
})

const onSubmit = handleSubmit(async (values) => {
  const apiPayload = {
    id: props.committee?.id ?? '',
    year: values.year,
    startDate: values.startDate ? formatDateForAPI(values.startDate) : null,
    endDate: values.endDate ? formatDateForAPI(values.endDate) : null,
    isActive: values.isActive,
    coreMembers: values.coreMembers,
    executiveMembers: values.executiveMembers,
  }

  if (props.committee?.id) {
    const result = await handleEdit(apiPayload, props.committee)
    if (result?.success) emit('submit', result.committee)
  } else {
    const response = await addCommittee(apiPayload)
    if (response.succeeded && response.data) emit('submit', response.data)
  }
})

const initializeForm = (): void => {
  if (!props.committee) return

  year.value = props.committee.year
  startDate.value = props.committee.startDate ? new Date(props.committee.startDate) : null
  endDate.value = props.committee.endDate ? new Date(props.committee.endDate) : null
  isActive.value = props.committee.isActive ?? false

  selectedCoreMembers.value = {}
  const committeeData = props.committee as unknown as CommitteeStringMembers

  if (committeeData.coreMembers) {
    const coreNames = committeeData.coreMembers.split(',').map((n) => n.trim())
    coreRoles.value.forEach((role) => {
      const roleUsers = usersByRole.value[role.id] || []
      const match = roleUsers.find((u) => coreNames.includes(u.fullName))
      if (match) selectedCoreMembers.value[role.id] = match.userId
    })
  }

  selectedExecutiveMember.value = []
  if (committeeData.executiveMembers) {
    const execNames = committeeData.executiveMembers.split(',').map((n) => n.trim())
    const execRoleId = executiveRole.value?.id
    if (execRoleId) {
      const execUsers = usersByRole.value[execRoleId] || []
      selectedExecutiveMember.value = execUsers
        .filter((u) => execNames.includes(u.fullName))
        .map((u) => u.userId)
    }
  }
}

const isDataReady = computed(
  () => executiveRole.value !== null && Object.keys(usersByRole.value).length > 0,
)

watch(
  [(): Committee | null | undefined => props.committee, isDataReady],
  ([committee, ready]): void => {
    if (committee && ready) {
      initializeForm()
    }
  },
  { immediate: true },
)

resetForm({
  values: {
    year: year.value,
    startDate: startDate.value ?? null,
    endDate: endDate.value ?? null,
    isActive: isActive.value,
    coreMembers: [],
    executiveMembers: [],
  },
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
      <small v-if="errors.year" class="absolute left-3 pt-0.5 text-red-500">{{
        errors.year
      }}</small>
    </div>

    <div class="flex gap-3 w-full">
      <div class="w-1/2">
        <FloatLabel variant="on" class="w-full">
          <DatePicker
            v-model="startDate"
            :inputClass="{ 'p-invalid': startDateError }"
            class="w-full"
            dateFormat="dd-mm-yy"
          />
          <label>Start Date</label>
        </FloatLabel>
        <small v-if="startDateError" class="text-red-500">{{ startDateError }}</small>
      </div>

      <div class="w-1/2">
        <FloatLabel variant="on" class="w-full">
          <DatePicker
            v-model="endDate"
            :inputClass="{ 'p-invalid': endDateError }"
            class="w-full"
            dateFormat="dd-mm-yy"
          />
          <label>End Date</label>
        </FloatLabel>
        <small v-if="endDateError" class="text-red-500">{{ endDateError }}</small>
      </div>
    </div>

    <div>
      <h4 class="font-semibold mb-2">Core Members</h4>
      <div v-for="role in coreRoles" :key="role.id" class="flex gap-3 mb-2">
        <div class="w-1/2">
          <Dropdown
            :modelValue="role.id"
            :options="[role]"
            optionLabel="name"
            optionValue="id"
            disabled
            class="w-full"
          />
        </div>
        <div class="w-1/2">
          <Dropdown
            v-model="selectedCoreMembers[role.id]"
            :options="usersByRole[role.id] || []"
            optionLabel="fullName"
            optionValue="userId"
            placeholder="Select User"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div>
      <h4 class="font-semibold mb-2">Executive Members</h4>
      <div v-if="executiveRole" class="flex gap-3 mb-2">
        <div class="w-1/2">
          <Dropdown
            :modelValue="executiveRole.id"
            :options="[executiveRole]"
            optionLabel="name"
            optionValue="id"
            disabled
            class="w-full"
          />
        </div>
        <div class="w-1/2">
          <MultiSelect
            v-model="selectedExecutiveMember"
            :options="usersByRole[executiveRole.id] || []"
            optionLabel="fullName"
            optionValue="userId"
            placeholder="Select Users"
            class="w-full"
            display="chip"
            :inputClass="{ 'p-invalid': errors.executiveMembers }"
          />
        </div>
      </div>
      <small v-if="errors.executiveMembers" class="text-red-500">{{
        errors.executiveMembers
      }}</small>
    </div>

    <div class="relative mb-2.5">
      <h4 class="font-semibold mb-2">Status</h4>
      <ToggleSwitch v-model="isActive" />
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>
