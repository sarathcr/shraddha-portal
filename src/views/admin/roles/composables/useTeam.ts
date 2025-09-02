import { ref, type Ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import type { Team } from '@/types/team'
import type { ApiResponse } from '@/types/index'
import api from '@/constants/api'
import { TeamService } from '@/services/TeamService'
import { useAuthStore } from '@/stores/auth'

export const useTeams = (): {
  teams: Ref<Team[]>
  isLoading: Ref<boolean>
  totalRecords: Ref<number>
  pageNumber: Ref<number>
  pageSize: Ref<number>
  editingRows: Ref<Team[]>
  fetchInitialData: () => Promise<void>
  fetchTeams: (page: number, size: number) => Promise<void>
  createTeam: (team: Omit<Team, 'id'>) => Promise<boolean>
  editTeam: (team: Team) => Promise<void>
  deleteTeam: (team: Team, event?: Event) => void
} => {
  const confirm = useConfirm()
  const toast = useToast()
  const authStore = useAuthStore()

  const teams = ref<Team[]>([])
  const isLoading = ref<boolean>(false)
  const totalRecords = ref<number>(0)
  const pageNumber = ref<number>(1)
  const pageSize = ref<number>(20)
  const editingRows = ref<Team[]>([])

  const fetchTeams = async (page: number, size: number): Promise<void> => {
    isLoading.value = true
    try {
      const response = await TeamService.getTeamsData(page, size)
      if (response.succeeded) {
        teams.value = response.data
        totalRecords.value = response.totalRecords
        pageNumber.value = response.pageNumber
        pageSize.value = response.pageSize
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Failed to load team data.',
          life: 3000,
        })
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while fetching teams.',
        life: 3000,
      })
      console.error('API call failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchInitialData = async (): Promise<void> => {
    await fetchTeams(pageNumber.value, pageSize.value)
  }

  const createTeam = async (team: Omit<Team, 'id'>): Promise<boolean> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.post<ApiResponse<Team>>('/authorization/Departments', team, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team created successfully.',
        life: 3000,
      })
      await fetchTeams(pageNumber.value, pageSize.value)
      return true
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create team.',
        life: 3000,
      })
      console.error('Error creating team:', error)
      return false
    }
  }

  const editTeam = async (team: Team): Promise<void> => {
    try {
      const accessToken = authStore.accessToken
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      await api.put<ApiResponse<Team>>(`/authorization/Departments/${team.id}`, team, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Team updated successfully.',
        life: 3000,
      })
      await fetchTeams(pageNumber.value, pageSize.value)
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update team.',
        life: 3000,
      })
      console.error('Error updating team:', error)
    }
  }

  const deleteTeam = (team: Team, event?: Event): void => {
    confirm.require({
      target: event?.currentTarget as HTMLElement,
      message: 'Do you want to delete this team?',
      icon: 'pi pi-info-circle',
      acceptClass: 'p-button-danger',

      accept: async () => {
        try {
          const accessToken = authStore.accessToken
          if (!accessToken) {
            throw new Error('Authentication token not found. Please log in again.')
          }
          await api.delete(`/authorization/Departments/${team.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Team deleted successfully.',
            life: 3000,
          })
          await fetchTeams(pageNumber.value, pageSize.value)
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete team.',
            life: 3000,
          })
          console.error('Error deleting team:', error)
        }
      },
    })
  }

  return {
    teams,
    isLoading,
    totalRecords,
    pageNumber,
    pageSize,
    editingRows,
    fetchInitialData,
    fetchTeams,
    createTeam,
    editTeam,
    deleteTeam,
  }
}
