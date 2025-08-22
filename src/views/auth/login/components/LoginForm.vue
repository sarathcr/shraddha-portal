<script lang="ts">
import { Button as PrimeButton, FloatLabel, InputText, Password } from 'primevue'
import type { LoginCredentials } from '../../../../types/login.models'
import { defineComponent } from 'vue'
import { useForm, useField } from 'vee-validate'
import { loginSchema } from '../../../admin/schemas/loginSchema'
import { useLogin } from '../composable/useLogin'
export default defineComponent({
  name: 'LoginForm',
  components: {
    FloatLabel,
    InputText,
    Password,
    PrimeButton,
  },
  setup() {
    const { handleLogin, isLoading } = useLogin()

    const { handleSubmit, errors } = useForm<LoginCredentials>({
      validationSchema: loginSchema,
    })

    const { value: email } = useField<string>('email')
    const { value: password } = useField<string>('password')

    const onSubmit = handleSubmit(async (values: LoginCredentials) => {
      await handleLogin(values)
    })

    return {
      email,
      password,
      errors,
      onSubmit,
      isLoading,
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
      <form @submit.prevent="onSubmit">
        <div class="form-group mb-6">
          <FloatLabel variant="on">
            <InputText
              class="w-full"
              id="email"
              inputmode="email"
              v-model="email"
              :class="{ 'p-invalid': errors.email }"
            />
            <label for="email">Username</label>
          </FloatLabel>
          <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
        </div>

        <div class="form-group mb-6">
          <FloatLabel variant="on">
            <Password
              class="w-full"
              input-class="w-full"
              id="password"
              v-model="password"
              toggleMask
              :class="{ 'p-invalid': errors.password }"
            />
            <label for="password">Password</label>
          </FloatLabel>
          <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
        </div>

        <a
          href="/forgot-password"
          class="text-[14px] text-[var(--p-primary-500)] mb-4 block text-right"
        >
          Forgot Password?
        </a>

        <PrimeButton type="submit" class="w-full" label="Login" :loading="isLoading" raised />
      </form>
    </div>
  </div>
</template>
