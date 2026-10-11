<script setup lang="ts">
import BaseTable from '@/shared/components/BaseTable.vue'
import type { RowData } from '@/shared/types/baseTable.model'

import AppButton from '@/shared/components/AppButton.vue'
import ActionButton from '@/shared/components/ActionButton.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { onMounted, ref } from 'vue'
import * as yup from 'yup'
import { useValidation } from '@/shared/composables/useValidation'
import type { EventType } from '@/modules/events/types/eventType.model'
import EventTypeForm from '../components/EventTypeForm.vue'
import { useEventType } from '../composables/useEventType'
import { useModulePermissions } from '@/shared/composables/useModulePermissions'
import { useToast } from 'primevue'
import isEqual from 'lodash/isEqual'

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
    const index = eventTypes.value.findIndex((e: EventType) => e.id === originalEventType.value!.id)
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
      <ConfirmDialog
        v-model:visible="deleteDialogVisible"
        message="Are you sure you want to delete this EventType?"
        @confirm="onDeleteEventType"
      />
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
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-800">Event Types</span>
              <span class="text-xs font-medium text-slate-400">({{ totalRecords }} total)</span>
            </div>
            <AppButton
              label="New Event Type"
              icon="pi pi-plus"
              @click="openCreateEventTypeDialog"
            />
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-1">
            <ActionButton icon="pi pi-history" title="View History" />
            <ActionButton
              v-if="canUpdate"
              icon="pi pi-pencil"
              title="Edit Event Type"
              @click="onEditEvent(row)"
            />
            <ActionButton
              v-if="canDelete"
              icon="pi pi-trash"
              title="Delete Event Type"
              variant="danger"
              @click="handleDeleteConfirmation(row)"
            />
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
