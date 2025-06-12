<script setup lang="ts">
import AppLogo from '../../../components/AppLogo.vue'
import LoginForm from './components/LoginForm.vue'
import type { LoginCredentials } from './models/login.models'

const handleLogin = (credentials: LoginCredentials): void => {
  console.log('Received login data:', credentials)
}
</script>

<template>
  <div class="login flex flex-col p-[30px] h-screen gap-4 lg:flex-row">
    <div class="flex flex-col align-center basis-1 lg:basis-1/2 grow-1 lg:grow-0">
      <AppLogo />
      <div class="login__form-wrapper grow-1">
        <LoginForm @submit="handleLogin" />
      </div>
    </div>
    <figure class="login__coverImage basis-1/2 rounded-xl overflow-hidden hidden lg:block">
      <img src="@/assets/cover.png" alt="Login Cover" class="w-full h-full object-cover" />
    </figure>
  </div>
</template>
