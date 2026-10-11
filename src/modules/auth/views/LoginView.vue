<script setup lang="ts">
import LoginForm from '@/modules/auth/components/LoginForm.vue'
import AppLogo from '@/shared/components/AppLogo.vue'
import Toast from 'primevue/toast'
import { useLogin } from '@/modules/auth/composables/useLogin'

const { handleLogin } = useLogin()
</script>

<template>
  <div
    class="login min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 relative overflow-hidden"
  >
    <!-- Ambient Background Lighting -->
    <div
      class="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-indigo-500/10 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-emerald-500/10 blur-3xl"
    ></div>

    <!-- Centered Login Card -->
    <div
      class="login__card relative z-10 w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl flex flex-col items-center"
    >
      <!-- Logo Image Directly Above Form -->
      <div class="login__logo-wrapper mb-4 flex justify-center w-full">
        <AppLogo variant="full" />
      </div>

      <div class="w-full">
        <LoginForm @submit="handleLogin" />
        <Toast />
      </div>
    </div>
  </div>
</template>
