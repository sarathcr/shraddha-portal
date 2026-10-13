<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useProfile } from '../composables/useProfile'
import EditProfileDialog from '../components/EditProfileDialog.vue'
import ChangePasswordDialog from '../components/ChangePasswordDialog.vue'

const toast = useToast()
const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarImageError = ref(false)

const {
  profile,
  displayRoles,
  isEditProfileOpen,
  isChangePasswordOpen,
  fetchProfile,
  handleAvatarUpload,
  updateProfile,
  changePassword,
  getParsedDOB,
} = useProfile()

watch(
  () => profile.avatarUrl,
  () => {
    avatarImageError.value = false
  },
)

onMounted(() => {
  void fetchProfile()
})

const triggerAvatarSelect = () => {
  avatarInputRef.value?.click()
}

const onAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const result = await handleAvatarUpload(file)
  if (!result.valid) {
    toast.add({
      severity: 'error',
      summary: 'Upload Error',
      detail: result.error || 'Failed to upload profile picture.',
      life: 4000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Avatar Updated',
      detail: 'Profile picture updated successfully.',
      life: 3000,
    })
  }

  // Reset file input so re-selecting same file triggers change
  target.value = ''
}

const onEditProfileSubmit = async (data: { name: string; phone: string; dob: Date | null }) => {
  await updateProfile(data)
  toast.add({
    severity: 'success',
    summary: 'Profile Updated',
    detail: 'Personal details updated successfully.',
    life: 3000,
  })
}

const onPasswordSubmit = async (payload: {
  currentPass: string
  newPass: string
  confirmPass: string
}) => {
  const result = await changePassword(payload.currentPass, payload.newPass, payload.confirmPass)
  if (!result.success) {
    toast.add({
      severity: 'error',
      summary: 'Password Error',
      detail: result.message,
      life: 4000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: result.message,
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <Toast position="top-right" />

    <!-- Profile Hero Card -->
    <div
      class="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
    >
      <div class="flex items-center gap-4 sm:gap-5">
        <!-- Avatar with Upload Overlay -->
        <div class="relative group">
          <div
            v-if="profile.avatarUrl && !avatarImageError"
            class="size-16 sm:size-20 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-indigo-100 bg-slate-100"
          >
            <img
              :src="profile.avatarUrl"
              alt="Profile Avatar"
              class="w-full h-full object-cover"
              @error="avatarImageError = true"
            />
          </div>
          <div
            v-else
            class="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0 select-none"
          >
            {{ profile.name.slice(0, 2).toUpperCase() }}
          </div>

          <!-- Camera overlay trigger -->
          <button
            type="button"
            @click="triggerAvatarSelect"
            aria-label="Upload profile picture"
            class="absolute inset-0 rounded-2xl bg-slate-900/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer backdrop-blur-[1px]"
          >
            <i class="pi pi-camera text-base sm:text-lg"></i>
            <span class="text-[10px] font-medium mt-0.5">Upload</span>
          </button>

          <input
            ref="avatarInputRef"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            class="hidden"
            @change="onAvatarChange"
          />
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {{ profile.name }}
            </h1>
            <Tag
              v-for="r in displayRoles"
              :key="r"
              :value="r"
              severity="info"
              class="!text-xs font-semibold"
            />
          </div>
          <p class="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
            <i class="pi pi-envelope text-slate-400"></i>
            {{ profile.email }}
          </p>
          <div class="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span class="inline-flex items-center gap-1">
              <span class="size-2 rounded-full bg-emerald-500"></span>
              Active Account
            </span>
            <span>•</span>
            <span>Joined 2025</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="isEditProfileOpen = true"
          class="inline-flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 text-white shadow-xs transition-all duration-150 cursor-pointer"
        >
          <i class="pi pi-user-edit text-xs"></i>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Details -->
      <div
        class="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col gap-5"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div
              class="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm"
            >
              <i class="pi pi-id-card"></i>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800">Personal Information</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Full Name</span>
            <span class="font-semibold text-slate-700">{{ profile.name }}</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Email Address</span>
            <span class="font-semibold text-slate-700">{{ profile.email }}</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Designation / Role</span>
            <span class="font-semibold text-slate-700">{{ profile.role || '—' }}</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Phone Number</span>
            <span class="font-semibold text-slate-700">{{ profile.phone || 'Not provided' }}</span>
          </div>
          <!-- Date of Birth (DOB) Field -->
          <div
            class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2"
          >
            <span class="text-slate-400 font-medium text-xs">Date of Birth (DOB)</span>
            <span class="font-semibold text-slate-700 flex items-center gap-2">
              <i class="pi pi-calendar text-indigo-500 text-xs"></i>
              {{ profile.dob || 'Not set' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Security & Credentials -->
      <div
        class="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col gap-5"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div
              class="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm"
            >
              <i class="pi pi-shield"></i>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800">Security & Credentials</h2>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <!-- Password Card -->
          <div
            class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold text-slate-700">Password</span>
              <span class="text-[11px] text-slate-400">Manage your account password</span>
            </div>
            <button
              type="button"
              @click="isChangePasswordOpen = true"
              class="h-8 px-3 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <EditProfileDialog
      v-model:visible="isEditProfileOpen"
      :initialData="{
        name: profile.name,
        phone: profile.phone,
        dob: getParsedDOB(),
      }"
      @submit="onEditProfileSubmit"
    />

    <!-- Change Password Dialog -->
    <ChangePasswordDialog v-model:visible="isChangePasswordOpen" @submit="onPasswordSubmit" />
  </div>
</template>
