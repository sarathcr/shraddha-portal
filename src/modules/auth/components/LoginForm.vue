<script lang="ts">
import { FloatLabel, InputText, Password } from 'primevue'
import AppButton from '@/shared/components/AppButton.vue'
import type { LoginCredentials } from '@/modules/auth/types/login.types'
import { defineComponent } from 'vue'
import { useForm, useField } from 'vee-validate'
import { loginSchema } from '@/modules/auth/schemas/loginSchema'
import { useLogin } from '@/modules/auth/composables/useLogin'

export default defineComponent({
  name: 'LoginForm',
  components: {
    FloatLabel,
    InputText,
    Password,
    AppButton,
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
  <div class="login-form flex items-center justify-center w-full">
    <div class="login-form__content w-full">
      <h2 class="text-xl sm:text-2xl font-extrabold mb-1 text-center text-slate-800">
        Welcome Back 👋
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 mb-6 text-center">
        Today is a new day. It's your day. You shape it.
      </p>
      <form @submit.prevent="onSubmit">
        <div class="flex flex-col gap-2">
          <div class="form-group mb-4">
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
            <small v-if="errors.email" class="text-red-500 absolute">{{ errors.email }}</small>
          </div>

          <div class="form-group mb-4">
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
            <small v-if="errors.password" class="text-red-500 absolute">{{
              errors.password
            }}</small>
          </div>
        </div>

        <a
          href="/forgot-password"
          class="text-[14px] text-[var(--p-primary-500)] mb-4 block text-right"
        >
          Forgot Password?
        </a>

        <AppButton type="submit" class="w-full" label="Login" :loading="isLoading" />
      </form>
    </div>
  </div>
</template>
