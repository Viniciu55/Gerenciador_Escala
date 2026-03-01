export type ScheduleStatus = 'disponivel' | 'indisponivel' | 'nao_sei'

export type ScheduleType = 'louvor' | 'sonoplastia' | 'midia'

export interface Member {
  id: string
  email: string
  name: string
  created_at: string
}

export interface ScheduleEntry {
  id: string
  member_id: string
  schedule_date: string
  status: ScheduleStatus
  created_at: string
}

export interface ScheduleWithMember extends ScheduleEntry {
  members: Pick<Member, 'name' | 'email'>
}

export interface ConflictInfo {
  date: string
  schedules: ScheduleType[]
}

export const SCHEDULE_CONFIG: Record<ScheduleType, {
  label: string
  membersTable: string
  entriesTable: string
  description: string
  sundaysOnly: boolean
}> = {
  louvor: {
    label: 'Louvor',
    membersTable: 'members_louvor',
    entriesTable: 'schedule_entries_louvor',
    description: 'Escala do Louvor',
    sundaysOnly: false,
  },
  sonoplastia: {
    label: 'Sonoplastia',
    membersTable: 'members_sonoplastia',
    entriesTable: 'schedule_entries_sonoplastia',
    description: 'Escala da Sonoplastia',
    sundaysOnly: false,
  },
  midia: {
    label: 'Midia',
    membersTable: 'members_midia',
    entriesTable: 'schedule_entries_midia',
    description: 'Escala da Midia',
    sundaysOnly: true,
  },
}
