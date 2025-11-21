<script setup lang="ts">
import BaseTable from '@/components/baseTable.vue'
import type { RowData } from '@/types/baseTable.model'

import Button from 'primevue/button'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { onMounted, ref } from 'vue'
import * as yup from 'yup'
import { useValidation } from '../roles/composables/useValidation'
import type { EventType } from '@/types/eventType.model'
import EventTypeForm from './components/EventTypeForm.vue'
import { useEventType } from './composables/useEventType'
import { useModulePermissions } from '@/composables/useModulePermissions'
import { useToast } from 'primevue'
import { isEqual } from 'lodash'

const MODULE_NAME: string = 'Settings'
const toast = useToast()
const { canUpdate, canDelete } = useModulePermissions(MODULE_NAME)

const {
  isLoading,
  columns,
  eventTypes,
  editingRows,
  fetchInitialData,
  deleteEventType,
  handleeditEventType,
  totalRecords,
  pageSize,
  onLazyLoad,
} = useEventType()

const { isSaveDisabled, resetValidation } = useValidation()
const userFormDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const eventTypeToDelete = ref<EventType | null>(null)
const formMode = ref<'create' | 'edit'>('create')
const selectedEventType = ref<EventType | null>(null)
const originalEventType = ref<EventType | null>(null)
const editableEventType = ref<EventType | null>(null)

const openCreateEventTypeDialog = (): void => {
  formMode.value = 'create'
  selectedEventType.value = null
  userFormDialogVisible.value = true
}

const handlEventTypeFormSubmit = async (): Promise<void> => {
  userFormDialogVisible.value = false
  await fetchInitialData()
}

const handleEventTypeFormCancel = (): void => {
  userFormDialogVisible.value = false
}
const handleDeleteConfirmation = (row: RowData): void => {
  eventTypeToDelete.value = row as EventType
  deleteDialogVisible.value = true
}

const onDeleteEventType = async (): Promise<void> => {
  if (eventTypeToDelete.value) {
    const success = await deleteEventType(eventTypeToDelete.value)
    if (success) {
      deleteDialogVisible.value = false
      eventTypeToDelete.value = null
    }
  }
}

const onEditEvent = (row: EventType): void => {
  originalEventType.value = JSON.parse(JSON.stringify(row))
  editableEventType.value = JSON.parse(JSON.stringify(row))
  editingRows.value = [row as EventType]
}
const onSaveEventType = async (newData: RowData): Promise<void> => {
  if (!editableEventType.value || !originalEventType.value) return
  const originalDataToCompare = {
    eventTypeName: originalEventType.value.eventTypeName,
    description: originalEventType.value.description,
  }
  const newDataToCompare = {
    eventTypeName: newData.eventTypeName,
    description: newData.description,
  }
  if (isEqual(originalDataToCompare, newDataToCompare)) {
    toast.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No modifications were made.',
      life: 3000,
    })
    editingRows.value = []
    editableEventType.value = null
    originalEventType.value = null
    resetValidation()
    return
  }
  try {
    await handleeditEventType(newData as EventType)
    editingRows.value = []
    editableEventType.value = null
    originalEventType.value = null
    resetValidation()
  } catch (validationError) {
    if (validationError instanceof yup.ValidationError) {
      validationError.inner.forEach((err) => {
        toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: `${err.message}`,
          life: 5000,
        })
      })
    }
  }
}

const onCancelEdit = (): void => {
  if (originalEventType.value) {
    const index = eventTypes.value.findIndex((e) => e.id === originalEventType.value!.id)
    if (index !== -1) {
      eventTypes.value[index] = originalEventType.value
    }
  }

  editingRows.value = []
  originalEventType.value = null
  editableEventType.value = null
  resetValidation()
}

onMounted(() => {
  void fetchInitialData()
})
</script>

<template>
  <div class="space-y-4 h-full">
    <div class="h-full bg-white">
      <ConfirmPopup class="mx-4" />
      <Toast />
      <Dialog
        class="m-4"
        v-model:visible="userFormDialogVisible"
        :header="formMode === 'create' ? 'Create EventType' : 'Edit EventType'"
        :style="{ width: '50rem' }"
        modal
        @hide="handleEventTypeFormCancel"
      >
        <EventTypeForm @cancel="handleEventTypeFormCancel" @submit="handlEventTypeFormSubmit" />
      </Dialog>
      <Dialog
        v-model:visible="deleteDialogVisible"
        header="Confirm Deletion"
        :style="{ width: '30rem' }"
        modal
      >
        <div class="flex items-center gap-4">
          <i class="pi pi-exclamation-triangle text-red-600 text-3xl" />
          <span>Are you sure you want to delete this EventType?</span>
        </div>
        <template #footer>
          <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
          <Button label="Delete" severity="danger" @click="onDeleteEventType" />
        </template>
      </Dialog>
      <BaseTable
        :columns="columns"
        :rows="eventTypes"
        :totalRecords="totalRecords"
        :rowsPerPage="pageSize"
        :editableRow="editingRows[0] as RowData"
        :loading="isLoading"
        @save="onSaveEventType"
        @cancel="onCancelEdit"
        @lazy:load="onLazyLoad"
        :paginator="true"
        :saveDisabled="isSaveDisabled"
      >
        <template #table-header>
          <Button
            label="New Event Type"
            icon="pi pi-plus"
            severity="help"
            @click="openCreateEventTypeDialog"
          />
        </template>
        <template #actions="{ row }">
          <button class="p-2 rounded hover:bg-gray-200 transition cursor-pointer">
            <i class="pi pi-history"></i>
          </button>
          <button
            v-if="canUpdate"
            @click="onEditEvent(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-pencil text-slate-700 text-base"></i>
          </button>
          <button
            v-if="canDelete"
            @click="handleDeleteConfirmation(row)"
            class="p-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <i class="pi pi-trash text-red-600 text-base"></i>
          </button>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
