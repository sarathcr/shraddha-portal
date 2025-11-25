<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import FloatLabel from 'primevue/floatlabel'
import ToggleSwitch from 'primevue/toggleswitch'
import MultiSelect from 'primevue/multiselect'
import { useForm, useField } from 'vee-validate'
import { roleSchema } from '@/views/admin/schemas/roleSchema'
import type { Role } from '@/types/role'
import { fetchAvailableModules } from '@/views/auth/services/module.service'
import type { ModuleApiData } from '@/types/module'

const props = defineProps<{
  initialData?: Role | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Role): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, resetForm, setValues, setFieldValue } = useForm<Role>({
  validationSchema: roleSchema,
  initialValues: {
    id: '',
    roleName: '',
    description: '',
    modulePermissions: [],
    isActive: false,
  },
  validateOnMount: false,
})

const { value: roleName } = useField<string>('roleName')
const { value: description } = useField<string>('description')
const selectedModules = ref<string[]>([])
const modulePermissions = ref<Record<string, string[]>>({})
const { value: isActive } = useField<boolean>('isActive')
const isSubmitted = ref(false)

const modules = ref<{ id: string; name: string }[]>([])
const loadingModules = ref(true)

function loadPermissionsForEdit(roleData: Role): void {
  const selected: string[] = []
  const permissionsRecord: Record<string, string[]> = {}

  if (roleData.modulePermissions) {
    roleData.modulePermissions.forEach((mp) => {
      const moduleId = String(mp.moduleId)
      selected.push(moduleId)
      permissionsRecord[moduleId] = mp.permissions.map((p) => p.toLowerCase())
    })
  }

  selectedModules.value = selected
  modulePermissions.value = permissionsRecord
  setValues(roleData)
}

async function loadModules(): Promise<void> {
  loadingModules.value = true
  try {
    const apiData = (await fetchAvailableModules()) as ModuleApiData[]

    modules.value = apiData.map((item) => ({
      id: item.id,
      name: item.module,
    }))
  } catch (error) {
    console.error('Failed to load modules:', error)
  } finally {
    loadingModules.value = false
  }
}
onMounted(() => {
  loadModules().catch((err) => console.error(err))
})
watch(selectedModules, (newModules) => {
  newModules.forEach((id) => {
    if (!modulePermissions.value[id]) {
      modulePermissions.value[id] = []
    }
  })

  Object.keys(modulePermissions.value).forEach((id) => {
    if (!newModules.includes(id)) {
      delete modulePermissions.value[id]
    }
  })
})

watch(
  modulePermissions,
  (newVal) => {
    const formatted = Object.entries(newVal).map(([moduleId, perms]) => ({
      moduleId,
      permissions: perms.map((p) => p.toUpperCase()),
    }))
    setFieldValue('modulePermissions', formatted)
  },
  { deep: true },
)

const onSubmit = handleSubmit(
  (values) => {
    isSubmitted.value = true
    emit('submit', values)
  },
  (errors) => {
    isSubmitted.value = true
    console.error('Validation failed:', errors)
  },
)

const customResetForm = (): void => {
  resetForm()
  selectedModules.value = []
  modulePermissions.value = {}
}

defineExpose({
  resetForm: customResetForm,
  onSubmit,
})

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      loadPermissionsForEdit(newVal)
    } else {
      customResetForm()
    }
  },
  { deep: true, immediate: true },
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
      <small class="text-red-500">{{ errors.description }}</small>
    </div>
    <div>
      <h3 class="font-semibold text-sm mb-2">Modules & Permissions</h3>
      <MultiSelect
        v-if="!loadingModules"
        v-model="selectedModules"
        :options="modules"
        optionLabel="name"
        optionValue="id"
        placeholder="Select Modules"
        filter
        class="w-full"
        display="chip"
        :maxSelectedLabels="3"
      />
    </div>
    <div
      v-if="selectedModules.length"
      class="flex flex-col gap-3 mt-2 border border-gray-300 rounded-lg"
    >
      <div
        v-for="moduleId in selectedModules"
        :key="moduleId"
        class="flex flex-wrap md:flex-nowrap items-start gap-6 p-3 rounded-lg"
      >
        <!-- Module Name -->
        <div class="flex-1">
          <InputText
            :value="modules.find((m) => m.id === moduleId)?.name"
            disabled
            class="w-full bg-gray-100"
          />
        </div>

        <!-- Permissions -->
        <div class="flex flex-wrap gap-4 flex-1">
          <div
            v-for="permissions in [
              'read',
              'create',
              'update',
              'delete',
              'manage',
              'approve reject',
            ]"
            :key="permissions"
            class="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox :value="permissions" v-model="modulePermissions[moduleId]" />
            <span class="capitalize">{{ permissions }}</span>
          </div>
        </div>
      </div>
    </div>
    <small v-if="errors.modulePermissions && isSubmitted" class="text-red-500">{{
      errors.modulePermissions
    }}</small>
    <div class="mb-2">
      <div>
        <label for="isActive">Status</label>
      </div>
      <ToggleSwitch v-model="isActive" :class="{ 'p-invalid': errors.isActive }" />
      <small v-if="errors.isActive" class="left-3 pt-0.5 text-red-500">
        {{ errors.isActive }}
      </small>
    </div>
  </form>
</template>
<style></style>
