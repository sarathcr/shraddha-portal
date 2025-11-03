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
import type {
  Committee,
  CommitteeFormData,
  CommitteeStringMembers,
  CommitteeUser,
} from '@/types/commitee'
import { committeeRoles, getRolesData, getUsersData, useCommittee } from '../composable/useCommitte'
import { committeeSchema } from '../../schemas/committeeSchema'
import { formatDateForAPI, parseDDMMYYYY } from '@/utils/dateUtils'
import { CommitteeRoles } from '@/constants/committeeRoles.enum'
import type { OptionItem } from '@/types/user'
import CommitteeMemberSkelton from '@/components/Skelton/CommiteeMemberSkelton.vue'
import CommiteeExecutiveSkelton from '@/components/Skelton/CommiteeExecutiveSkelton.vue'
import { isEqual } from 'lodash'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const emit = defineEmits<{
  (e: 'submit', payload: Committee): void
  (e: 'cancel'): void
}>()

const props = defineProps<{
  coremembers: { label: string; value: string }[]
  executivemembers: { label: string; value: string }[]
  committee?: Committee | null
}>()
const isLoadingCoremembers = ref(true)
const isLoadingExecutiveMemebers = ref(true)

const isSubmitted = ref(false)
const roleError = ref<string | null>(null)

const isEditMode = ref(!!props.committee?.id)
const { handleSubmit, errors } = useForm<CommitteeFormData>({
  validationSchema: committeeSchema(isEditMode.value),
})

const { value: year } = useField<string>('year')
const { value: startDate, errorMessage: startDateError } = useField<Date | null>('startDate')
const { value: endDate, errorMessage: endDateError } = useField<Date | null>('endDate')
const { value: isActive } = useField<boolean>('isActive')
const { value: coreMembers, errorMessage: coreMembersError } =
  useField<CommitteeUser[]>('coreMembers')
const { value: executiveMembers, errorMessage: executiveMembersError } =
  useField<CommitteeUser[]>('executiveMembers')
const coreRoles = ref<{ id: string; name: string }[]>([])
const executiveRole = ref<{ id: string; name: string } | null>(null)
const selectedCoreMembers = ref<Record<string, string>>({})
const selectedExecutiveMember = ref<string[]>([])
const userOptions = ref<{ label: string; value: string }[]>([])
const isStatusDisabled = ref(true)

const { addCommittee, handleEdit } = useCommittee()
const originalCommittee = ref<Committee | null>(null)

onMounted(async () => {
  await Promise.all([getRolesData(), getUsersData()])

  userOptions.value = (await getUsersData())
    .filter((u): u is CommitteeUser & { name: string; id: string } => !!u.name && !!u.id)
    .map((u) => ({ label: u.name, value: u.id }))

  const allowedRoles = ['President', 'Secretary', 'Treasurer', 'Assistant Treasurer']
  coreRoles.value = allowedRoles
    .map((roleName) => {
      const role = committeeRoles.value.find((r) => r.label === roleName)
      return role ? { id: role.value, name: role.label } : null
    })
    .filter((r): r is { id: string; name: string } => r !== null)

  const exec = committeeRoles.value.find((r) => r.label === CommitteeRoles.ExecutiveMember)
  executiveRole.value = exec ? { id: exec.value, name: exec.label } : null
  isLoadingCoremembers.value = false
  isLoadingExecutiveMemebers.value = false
})

watch(
  selectedCoreMembers,
  (val) => {
    coreMembers.value = Object.entries(val)
      .filter(([userId]) => userId)
      .map(([roleId, userId]) => ({ roleId, userId }))
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
  [selectedCoreMembers, selectedExecutiveMember],
  () => {
    const selectedUsers = new Set<string>()
    let duplicateFound = false

    for (const userId of Object.values(selectedCoreMembers.value)) {
      if (!userId) continue
      if (selectedUsers.has(userId)) {
        duplicateFound = true
        break
      }
      selectedUsers.add(userId)
    }

    for (const userId of selectedExecutiveMember.value) {
      if (!userId) continue
      if (selectedUsers.has(userId)) {
        duplicateFound = true
        break
      }
      selectedUsers.add(userId)
    }

    roleError.value = duplicateFound ? 'A user cannot be assigned to multiple roles.' : null
  },
  { deep: true },
)

watch(
  () => props.committee,
  (newVal) => {
    if (!newVal) {
      isStatusDisabled.value = true
    } else {
      isStatusDisabled.value = !!newVal.id
    }
  },
  { immediate: true },
)

const getInitialCommitteeData = (): CommitteeFormData => ({
  year: '',
  startDate: null,
  endDate: null,
  isActive: false,
  coreMembers: [],
  executiveMembers: [],
  selectedCoreMembers: {},
  selectedExecutiveMember: [],
})
watch(
  [(): Committee | null | undefined => props.committee, (): number => userOptions.value.length],
  ([newCommittee, userCount]: [Committee | null | undefined, number]): void => {
    if (!newCommittee || userCount === 0) {
      originalCommittee.value = JSON.parse(JSON.stringify(newCommittee))
      const initial = getInitialCommitteeData()
      year.value = initial.year
      startDate.value = initial.startDate
      endDate.value = initial.endDate
      isActive.value = initial.isActive
      selectedCoreMembers.value = initial.selectedCoreMembers
      selectedExecutiveMember.value = initial.selectedExecutiveMember
      return
    }
    year.value = newCommittee.year
    startDate.value = parseDDMMYYYY(newCommittee.startDate ?? undefined)
    endDate.value = parseDDMMYYYY(newCommittee.endDate ?? undefined)
    isActive.value = newCommittee.isActive ?? false

    const committeeData = newCommittee as unknown as CommitteeStringMembers

    selectedCoreMembers.value = {}
    if (committeeData.coreMembers) {
      const coreNames = committeeData.coreMembers.split(',').map((n) => n.trim())
      coreRoles.value.forEach((role, index) => {
        const matchUser = userOptions.value.find(
          (u) => u.label.trim().toLowerCase() === coreNames[index]?.toLowerCase(),
        )
        if (matchUser) selectedCoreMembers.value[role.id] = matchUser.value
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

const getAvailableUsers = (currentRoleId?: string): OptionItem[] => {
  const selectedIds = new Set([
    ...Object.entries(selectedCoreMembers.value)
      .filter(([roleId]) => roleId !== currentRoleId)
      .map(([, userId]) => userId),
    ...selectedExecutiveMember.value,
  ])

  return userOptions.value.filter(
    (u) =>
      !selectedIds.has(u.value) ||
      (currentRoleId
        ? selectedCoreMembers.value[currentRoleId] === u.value
        : selectedExecutiveMember.value.includes(u.value)),
  )
}

const isCommitteeChanged = (): boolean => {
  if (!props.committee || !originalCommittee.value) return true

  const extractMemberNames = (members: string | CommitteeUser[]): string[] => {
    if (typeof members === 'string') {
      return members.split(',').map((s) => s.trim())
    } else if (Array.isArray(members)) {
      return members.map((m) => m.userName?.trim() || m.name?.trim() || '')
    }
    return []
  }

  const originalData = {
    year: originalCommittee.value.year,
    startDate: originalCommittee.value.startDate,
    endDate: originalCommittee.value.endDate,
    isActive: originalCommittee.value.isActive,
    coreMembers: extractMemberNames(originalCommittee.value.coreMembers),
    executiveMembers: extractMemberNames(originalCommittee.value.executiveMembers),
  }

  const currentData = {
    year: year.value,
    startDate: startDate.value ? formatDateForAPI(startDate.value) : null,
    endDate: endDate.value ? formatDateForAPI(endDate.value) : null,
    isActive: isActive.value,
    coreMembers: Object.entries(selectedCoreMembers.value).map(([, userId]) => {
      const user = userOptions.value.find((u) => u.value === userId)
      return user?.label ?? ''
    }),
    executiveMembers: selectedExecutiveMember.value.map(
      (id) => userOptions.value.find((u) => u.value === id)?.label ?? '',
    ),
  }

  return !isEqual(originalData, currentData)
}

const onSubmit = async (): Promise<void> => {
  isSubmitted.value = true

  const isValid = await handleSubmit(() => true)()
  if (!isValid || roleError.value) return

  if (isEditMode.value && !isCommitteeChanged()) {
    toast.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No modifications were made.',
      life: 3000,
    })
    return
  }

  const apiPayload = {
    id: props.committee?.id ?? '',
    year: year.value,
    startDate: startDate.value ? formatDateForAPI(startDate.value) : null,
    endDate: endDate.value ? formatDateForAPI(endDate.value) : null,
    isActive: isActive.value,
    coreMembers: coreMembers.value,
    executiveMembers: executiveMembers.value,
  }

  const result = props.committee?.id
    ? await handleEdit(apiPayload)
    : await (
        await addCommittee(apiPayload)
      )?.data

  if (result) emit('submit', result)
}

const onCancel = (): void => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2 commiteeForm">
    <div class="mb-2">
      <FloatLabel variant="on">
        <InputText
          id="year"
          v-model="year"
          class="w-full"
          :class="{ '!border-red-500': isSubmitted && errors.year }"
        />
        <label for="year">Committee Year</label>
      </FloatLabel>
      <small v-if="isSubmitted && errors.year" class="text-red-500">{{ errors.year }}</small>
    </div>

    <div class="flex gap-3 w-full">
      <div class="w-1/2">
        <FloatLabel variant="on" class="w-full">
          <DatePicker
            v-model="startDate"
            showIcon
            id="startDate"
            dateFormat="dd-mm-yy"
            :inputClass="{ '!border-red-500': isSubmitted && startDateError }"
            class="w-full"
          />
          <label>Start Date</label>
        </FloatLabel>
        <small v-if="isSubmitted && startDateError" class="text-red-500">{{
          startDateError
        }}</small>
      </div>

      <div class="w-1/2">
        <FloatLabel variant="on" class="w-full">
          <DatePicker
            v-model="endDate"
            showIcon
            dateFormat="dd-mm-yy"
            :inputClass="{ '!border-red-500': isSubmitted && endDateError }"
            class="w-full"
          />
          <label>End Date</label>
        </FloatLabel>
        <small v-if="isSubmitted && endDateError" class="text-red-500">{{ endDateError }}</small>
      </div>
    </div>
    <div>
      <h4 class="font-semibold mb-2">Core Members</h4>
      <div v-if="isLoadingCoremembers">
        <CommitteeMemberSkelton :key="'exec-skel'" />
      </div>

      <div v-else>
        <div v-for="role in coreRoles" :key="role.id" class="flex flex-col md:flex-row gap-3 mb-2">
          <div class="w-full md:w-1/2">
            <Select
              :modelValue="role.id"
              :options="[role]"
              optionLabel="name"
              optionValue="id"
              disabled
              class="w-full"
            />
          </div>
          <div class="w-full md:w-1/2">
            <Select
              filter
              v-model="selectedCoreMembers[role.id]"
              :options="getAvailableUsers(role.id)"
              optionLabel="label"
              optionValue="value"
              placeholder="Select User"
              class="w-full"
            />
          </div>
        </div>
        <small v-if="isSubmitted && coreMembersError" class="text-red-500">{{
          coreMembersError
        }}</small>
      </div>
    </div>
    <div>
      <h4 class="font-semibold mb-2">Executive Members</h4>
      <div v-if="isLoadingExecutiveMemebers">
        <CommiteeExecutiveSkelton :key="'exec-skel'" />
      </div>

      <div v-else>
        <div v-if="executiveRole" class="flex flex-col md:flex-row gap-3 mb-2">
          <div class="w-full md:w-1/2">
            <Select
              :modelValue="executiveRole.id"
              :options="[executiveRole]"
              optionLabel="name"
              optionValue="id"
              disabled
              class="w-full"
            />
          </div>
          <div class="w-full md:w-1/2">
            <MultiSelect
              v-model="selectedExecutiveMember"
              :options="getAvailableUsers()"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Users"
              filter
              class="w-full"
              display="chip"
            />
          </div>
        </div>
        <small v-if="roleError" class="text-red-500">{{ roleError }}</small>
        <small v-if="isSubmitted && executiveMembersError" class="text-red-500">{{
          executiveMembersError
        }}</small>
      </div>
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
