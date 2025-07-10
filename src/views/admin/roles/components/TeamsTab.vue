<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const teamName = ref('')
const teamDescription = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <h3 class="font-semibold text-lg mb-2">Add New Team</h3>
    <InputText v-model="teamName" placeholder="New Team Name" class="w-full" />
    <Textarea
      v-model="teamDescription"
      rows="5"
      cols="30"
      placeholder="Team Description (Optional)"
      class="w-full"
    />
    <Button label="Save Team" icon="pi pi-save" class="mt-4" />
  </div>
</template>
