import { createClient } from '@/lib/supabase/client'
import type { Member, ScheduleEntry, ScheduleStatus, ScheduleType, ConflictInfo } from '@/lib/types'
import { SCHEDULE_CONFIG } from '@/lib/types'

function getClient() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in the browser')
  }
  return createClient()
}

export async function lookupMember(email: string, scheduleType: ScheduleType): Promise<Member | null> {
  const supabase = getClient()
  const table = SCHEDULE_CONFIG[scheduleType].membersTable
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data) return null
  return data
}

export async function registerMember(email: string, name: string, scheduleType: ScheduleType): Promise<Member> {
  const supabase = getClient()
  const table = SCHEDULE_CONFIG[scheduleType].membersTable
  const { data, error } = await supabase
    .from(table)
    .insert({ email: email.toLowerCase().trim(), name: name.trim() })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getAllMembers(scheduleType: ScheduleType): Promise<Member[]> {
  const supabase = getClient()
  const table = SCHEDULE_CONFIG[scheduleType].membersTable
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getScheduleEntries(startDate: string, endDate: string, scheduleType: ScheduleType): Promise<ScheduleEntry[]> {
  const supabase = getClient()
  const table = SCHEDULE_CONFIG[scheduleType].entriesTable
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)

  if (error) throw new Error(error.message)
  return data || []
}

export async function upsertScheduleEntry(
  memberId: string,
  scheduleDate: string,
  status: ScheduleStatus,
  scheduleType: ScheduleType
): Promise<ScheduleEntry> {
  const supabase = getClient()
  const table = SCHEDULE_CONFIG[scheduleType].entriesTable
  const { data, error } = await supabase
    .from(table)
    .upsert(
      { member_id: memberId, schedule_date: scheduleDate, status },
      { onConflict: 'member_id,schedule_date' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Check conflicts: find dates where a person (by email) is marked as "disponivel" in other schedules
export async function getConflicts(
  email: string,
  currentScheduleType: ScheduleType,
  startDate: string,
  endDate: string
): Promise<ConflictInfo[]> {
  const supabase = getClient()
  const otherTypes = (Object.keys(SCHEDULE_CONFIG) as ScheduleType[]).filter(
    (t) => t !== currentScheduleType
  )

  const conflictMap: Record<string, ScheduleType[]> = {}

  for (const type of otherTypes) {
    const membersTable = SCHEDULE_CONFIG[type].membersTable
    const entriesTable = SCHEDULE_CONFIG[type].entriesTable

    // First look up if this email exists in this schedule's members
    const { data: memberData } = await supabase
      .from(membersTable)
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!memberData) continue

    // Then get their entries that are "disponivel"
    const { data: entriesData } = await supabase
      .from(entriesTable)
      .select('schedule_date')
      .eq('member_id', memberData.id)
      .eq('status', 'disponivel')
      .gte('schedule_date', startDate)
      .lte('schedule_date', endDate)

    if (entriesData) {
      for (const entry of entriesData) {
        if (!conflictMap[entry.schedule_date]) {
          conflictMap[entry.schedule_date] = []
        }
        conflictMap[entry.schedule_date].push(type)
      }
    }
  }

  return Object.entries(conflictMap).map(([date, schedules]) => ({
    date,
    schedules,
  }))
}
