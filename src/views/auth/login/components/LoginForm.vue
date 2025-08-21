<script lang="ts">
import { Button as PrimeButton, FloatLabel, InputText, Password } from 'primevue'
import type { LoginCredentials } from '../../../../types/login.models'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'LoginForm',
  components: {
    FloatLabel,
    InputText,
    Password,
    PrimeButton,
  },
  emits: ['submit'],
  setup(
    props: Record<string, unknown>,
    { emit }: { emit: (event: 'submit', payload: LoginCredentials) => void },
  ) {
    const email = ref('')
    const password = ref('')

    const handleSubmit = (event: Event): void => {
      event.preventDefault()
      const credentials: LoginCredentials = {
        email: email.value,
        password: password.value,
      }
      emit('submit', credentials)
      email.value = ''
      password.value = ''
    }

    return {
      email,
      password,
      handleSubmit,
    }
  },
})
</script>

<template>
  <div class="login-form flex items-center justify-center grow-1 h-full pb-[40px]">
    <div class="login-form__content">
      <h2 class="text-[20px] md:text-[30px] font-extrabold mb-3 text-center md:text-left">
        Welcome Back 👋
      </h2>
      <p class="text-[16px] md:text-[20px] mb-7 text-center md:text-left">
        Today is a new day. It's your day. You shape it.
      </p>
      <form @submit.prevent="handleSubmit">
        <div class="form-group mb-6">
          <FloatLabel variant="on">
            <InputText class="w-full" id="email" inputmode="email" v-model="email" required />
            <label for="email">Username</label>
          </FloatLabel>
        </div>
        <div class="form-group mb-6">
          <FloatLabel variant="on">
            <Password
              class="w-full"
              input-class="w-full"
              id="password"
              v-model="password"
              toggleMask
              required
            />
            <label for="username">Password</label>
          </FloatLabel>
        </div>
        <a
          href="/forgot-password"
          class="text-[14px] text-[var(--p-primary-500)] mb-4 block text-right"
          >Forgot Password?</a
        >
        <PrimeButton type="submit" class="w-full" label="Login" :loading="false" raised />
      </form>
    </div>
  </div>
</template>
