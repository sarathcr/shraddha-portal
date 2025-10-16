<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import DatePicker from 'primevue/datepicker'

import type { Committee, CommitteeStringMembers, CommitteeUser } from '@/types/commitee'
import { committeeRoles, getRolesData, getUsersData, useCommittee } from '../composable/useCommitte'
import { committeeSchema } from '../../schemas/committeeSchema'
import { formatDateForAPI, parseDDMMYYYY } from '@/utils/dateUtils'
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

const { handleSubmit, errors } = useForm<CommitteeForm>({
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

const selectedCoreMembers = ref<Record<string, string>>({})
const selectedExecutiveMember = ref<string[]>([])

const { addCommittee } = useCommittee()
const userOptions = ref<{ label: string; value: string }[]>([])
const isStatusDisabled = ref(true)

onMounted(async () => {
  const [, users] = await Promise.all([getRolesData(), getUsersData()])
  userOptions.value = users
    .filter(
      (user): user is CommitteeUser & { name: string; roleId: string } =>
        !!user.name && !!user.roleId,
    )
    .map((user) => ({
      label: user.name,
      value: user.roleId,
    }))
  const allowedRoles = ['President', 'Secretary', 'Treasurer', 'Assistant Treasurer']
  coreRoles.value = allowedRoles
    .map((roleName) => {
      const role = committeeRoles.value.find((r) => r.label === roleName)
      return role ? { id: role.value, name: role.label } : null
    })
    .filter((r): r is { id: string; name: string } => r !== null)

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

watch(
  () => props.committee,
  (newVal) => {
    isStatusDisabled.value = !newVal
  },
  { immediate: true },
)

watch(
  () => props.committee,
  (newCommittee) => {
    if (!newCommittee) {
      year.value = ''
      startDate.value = null
      endDate.value = null
      isActive.value = false
      selectedCoreMembers.value = {}
      selectedExecutiveMember.value = []
      return
    }

    year.value = newCommittee.year
    startDate.value = parseDDMMYYYY(newCommittee.startDate ?? undefined)
    endDate.value = parseDDMMYYYY(newCommittee.endDate ?? undefined)
    isActive.value = newCommittee.isActive ?? false
    selectedCoreMembers.value = {}
    const committeeData = newCommittee as unknown as CommitteeStringMembers
    if (committeeData.coreMembers) {
      const coreNames = committeeData.coreMembers.split(',').map((n) => n.trim())
      coreRoles.value.forEach((role, index) => {
        const userName = coreNames[index]
        const matchUser = userOptions.value.find((u) => u.label === userName)
        if (matchUser) {
          selectedCoreMembers.value[role.id] = matchUser.value
        }
      })
    }
    selectedExecutiveMember.value = []
    if (committeeData.executiveMembers) {
      const execNames = committeeData.executiveMembers.split(',').map((n) => n.trim())
      selectedExecutiveMember.value = userOptions.value
        .filter((u) => execNames.includes(u.label))
        .map((u) => u.value)
    }
  },
  { immediate: true },
)

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
    // const result = await handleEdit(apiPayload)
    // if (result?.success) emit('submit', result.committee)
  } else {
    const response = await addCommittee(apiPayload)
    if (response.succeeded && response.data) emit('submit', response.data)
  }
})

const onCancel = (): void => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2 commiteeForm">
    <div class="mb-2">
      <FloatLabel variant="on">
        <InputText id="year" v-model="year" :class="{ 'p-invalid': errors.year }" class="w-full" />
        <label for="year">Committee Year</label>
      </FloatLabel>
      <small v-if="errors.year" class="text-red-500">{{ errors.year }}</small>
    </div>

    <div class="flex gap-3 w-full">
      <div class="w-1/2">
        <FloatLabel variant="on" class="w-full">
          <DatePicker
            v-model="startDate"
            showIcon
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
            showIcon
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
          <Select
            :modelValue="role.id"
            :options="[role]"
            optionLabel="name"
            optionValue="id"
            disabled
            class="w-full"
          />
        </div>
        <div class="w-1/2">
          <Select
            filter
            v-model="selectedCoreMembers[role.id]"
            :options="userOptions"
            optionLabel="label"
            optionValue="value"
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
          <Select
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
            :options="userOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Users"
            filter
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

    <div class="mb-2">
      <h4 class="font-semibold mb-2">Status</h4>
      <ToggleSwitch v-model="isActive" :disabled="isStatusDisabled" />
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button type="submit" label="Save" />
    </div>
  </form>
</template>
