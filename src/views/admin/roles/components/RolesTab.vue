<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

const roleName = ref('')
const permissions = ref<string[]>([])
const description = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="font-semibold text-lg mb-2">Permissions for New Role</h3>
    <div class="flex flex-wrap gap-4">
      <div
        class="flex items-center gap-2"
        v-for="perm in ['read', 'write', 'update', 'delete']"
        :key="perm"
      >
        <Checkbox v-model="permissions" :inputId="perm" :value="perm" />
        <label :for="perm" class="cursor-pointer">{{
          perm.charAt(0).toUpperCase() + perm.slice(1)
        }}</label>
      </div>
    </div>
    <InputText v-model="roleName" placeholder="New Role Name" class="w-full mt-4" />
    <Textarea
      v-model="description"
      rows="5"
      cols="30"
      placeholder="Role Description"
      class="w-full"
    />
    <Button label="Save Role" icon="pi pi-save" class="mt-4" />
  </div>
</template>
