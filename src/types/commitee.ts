import type { RowData } from './baseTable.model'

export interface Committee extends RowData {
  id: string
  year: string
  startDate?: Date
  endDate?: Date
  coreMembers: Members[]
  executiveMembers: Members[]
  status: boolean
}

export interface CommitteeCard {
  title: string
  icon: string
  colorClasses: {
    bg: string
    text: string
  }
  countValue: number
  countLabel: string
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
  moms: Mom[]
  birthdayGift: {
    year: number
    list: {
      month: string
      totalCelebrated: number
    }[]
  }
  tournaments: {
    completed: number
    list: Tournament[]
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
  members: {
    total: number
    newThisYear: number
    active: number
  }
}
export interface Tournament {
  name: string
  startDate: string
  endDate: string
}

export interface Mom {
  date: string
  pdfUrl: string
}

export interface Members {
  id: string
  name: string
  designation: string
  email: string
}
