import type { RowData } from './baseTable.model'

export interface Committee extends RowData {
  id: string
  year: string
  coreMembers: string[]
  executiveMembers: string[]
  status: boolean
  createdAt: string
}

export interface CommitteeDashboard {
  id: string
  year: string
  finance: {
    balance: number
    graph: {
      labels: string[]
      values: number[]
    }
  }
  moms: {
    date: string
    pdfUrl: string
  }[]
  birthdayGift: {
    totalCelebrated: number
    year: number
  }
  tournaments: {
    completed: number
    list: {
      name: string
      date: string
    }[]
  }
  events: {
    year: number
    totalEvents: number
    eventsList: {
      name: string
      date: string
    }[]
  }
  charity: {
    count: number
    latest: string
    activities: {
      date: string
      title: string
    }[]
  }
}
