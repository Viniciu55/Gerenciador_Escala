import { createClient } from '@/lib/supabase/client'
import type { ScheduleType, ScheduleStatus } from '@/lib/types'
import { SCHEDULE_CONFIG } from '@/lib/types'

const supabase = createClient()

export interface MemberAvailability {
  id: string
  name: string
  email: string
  status: ScheduleStatus | null
}

export interface BuiltScheduleEntry {
  id: string
  schedule_type: ScheduleType
  schedule_date: string
  role: string
  member_name: string | null
  member_email: string | null
}

export const BAND_ROLES = [
  { key: 'ministro', label: 'Ministro', icon: 'Mic' },
  { key: 'voz1', label: 'Voz 1', icon: 'MicVocal' },
  { key: 'voz2', label: 'Voz 2', icon: 'MicVocal' },
  { key: 'violao', label: 'Violao', icon: 'Guitar' },
  { key: 'teclado', label: 'Teclado', icon: 'Piano' },
  { key: 'guitarra', label: 'Guitarra', icon: 'Guitar' },
  { key: 'baixo', label: 'Baixo', icon: 'Guitar' },
  { key: 'bateria', label: 'Bateria', icon: 'Drum' },
] as const

export type BandRole = typeof BAND_ROLES[number]['key']

// Get all members with their availability for a specific date
export async function getMembersWithAvailability(
  scheduleType: ScheduleType,
  date: string
): Promise<MemberAvailability[]> {
  const config = SCHEDULE_CONFIG[scheduleType]
  const { data: members, error: membersError } = await supabase
    .from(config.membersTable)
    .select('*')
    .order('name')

  if (membersError) throw new Error(membersError.message)
  if (!members || members.length === 0) return []

  const { data: entries, error: entriesError } = await supabase
    .from(config.entriesTable)
    .select('*')
    .eq('schedule_date', date)

  if (entriesError) throw new Error(entriesError.message)

  return members.map((member) => {
    const entry = entries?.find((e: { member_id: string }) => e.member_id === member.id)
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      status: entry?.status ?? null,
    }
  })
}

// Get built schedule entries for a date range
export async function getBuiltScheduleEntries(
  scheduleType: ScheduleType,
  startDate: string,
  endDate: string
): Promise<BuiltScheduleEntry[]> {
  const { data, error } = await supabase
    .from('built_schedules')
    .select('*')
    .eq('schedule_type', scheduleType)
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)

  if (error) throw new Error(error.message)
  return data || []
}

// Upsert a built schedule entry (assign a member to a role on a date)
export async function upsertBuiltScheduleEntry(
  scheduleType: ScheduleType,
  scheduleDate: string,
  role: string,
  memberName: string | null,
  memberEmail: string | null
): Promise<BuiltScheduleEntry> {
  const { data, error } = await supabase
    .from('built_schedules')
    .upsert(
      {
        schedule_type: scheduleType,
        schedule_date: scheduleDate,
        role,
        member_name: memberName,
        member_email: memberEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'schedule_type,schedule_date,role' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Remove a member from a role on a date
export async function removeBuiltScheduleEntry(
  scheduleType: ScheduleType,
  scheduleDate: string,
  role: string
): Promise<void> {
  const { error } = await supabase
    .from('built_schedules')
    .delete()
    .eq('schedule_type', scheduleType)
    .eq('schedule_date', scheduleDate)
    .eq('role', role)

  if (error) throw new Error(error.message)
}
