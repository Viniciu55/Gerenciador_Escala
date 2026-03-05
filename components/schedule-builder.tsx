"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  X,
  Check,
  HelpCircle,
  Minus,
  Download,
  Calendar,
  CalendarDays,
  UserRound,
} from "lucide-react"
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  startOfWeek,
  endOfWeek,
  isSameWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ScheduleType, ScheduleStatus } from "@/lib/types"
import { SCHEDULE_CONFIG } from "@/lib/types"
import {
  type MemberAvailability,
  type BuiltScheduleEntry,
  type RoleType,
  getRolesForScheduleType,
} from "@/lib/schedule-builder-api"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"



const STATUS_STYLES: Record<
  ScheduleStatus,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  disponivel: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: <Check className="h-3 w-3" />,
    label: "Disponivel",
  },
  nao_sei: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-800 dark:text-amber-300",
    icon: <HelpCircle className="h-3 w-3" />,
    label: "Nao sei",
  },
  indisponivel: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    icon: <X className="h-3 w-3" />,
    label: "Indisponivel",
  },
}

type ViewMode = "month" | "week"

interface ScheduleBuilderProps {
  scheduleType: ScheduleType
  onBack: () => void
}

function getScheduleDays(
  monthDate: Date,
  sundaysOnly: boolean,
  viewMode: ViewMode,
  selectedWeekDate?: Date
): Date[] {
  if (viewMode === "week" && selectedWeekDate) {
    const weekStart = startOfWeek(selectedWeekDate, { weekStartsOn: 4 }) // Start from Thursday
    const weekEnd = endOfWeek(selectedWeekDate, { weekStartsOn: 4 }) // End on Sunday
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    return allDays.filter((day) => {
      const dow = getDay(day)
      if (sundaysOnly) return dow === 0
      return dow === 4 || dow === 0
    })
  }
  
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)
  let allDays = eachDayOfInterval({ start, end })
  
  // For non-Sunday-only schedules, we need to adjust the date range
  if (!sundaysOnly) {
    // If the month doesn't start on Thursday, find the first Thursday
    const firstDay = allDays[0]
    const firstDayOfWeek = getDay(firstDay)
    
    // If month starts after Thursday, include the Thursday from the previous week
    if (firstDayOfWeek > 4) {
      const daysToGoBack = firstDayOfWeek - 4
      const newStart = new Date(firstDay)
      newStart.setDate(newStart.getDate() - daysToGoBack)
      allDays = [new Date(newStart), ...allDays]
    } else if (firstDayOfWeek < 4) {
      const daysToGoBack = firstDayOfWeek + 3 // Go back to Thursday of previous week
      const newStart = new Date(firstDay)
      newStart.setDate(newStart.getDate() - daysToGoBack)
      allDays = [new Date(newStart), ...allDays]
    }
    
    // If the month doesn't end on Sunday, extend to the next Sunday
    const lastDay = allDays[allDays.length - 1]
    const lastDayOfWeek = getDay(lastDay)
    if (lastDayOfWeek !== 0) {
      const daysToAdd = 7 - lastDayOfWeek
      const newEnd = new Date(lastDay)
      newEnd.setDate(newEnd.getDate() + daysToAdd)
      allDays = [...allDays, new Date(newEnd)]
    }
  }
  
  return allDays.filter((day) => {
    const dow = getDay(day)
    if (sundaysOnly) return dow === 0
    return dow === 4 || dow === 0
  })
}

const EVENT_LABELS: Record<number, string> = { 4: "Ensaio", 0: "Culto" }
const WEEKDAY_LABELS: Record<number, string> = { 4: "quinta", 0: "domingo" }

function MemberPickerDialog({
  open,
  onClose,
  members,
  role,
  date,
  onSelect,
  onRemove,
  currentMemberEmail,
}: {
  open: boolean
  onClose: () => void
  members: MemberAvailability[]
  role: RoleType
  date: string
  onSelect: (member: MemberAvailability) => void
  onRemove: () => void
  currentMemberEmail: string | null
}) {
  // Sort: disponivel first, then nao_sei, then indisponivel, then null
  const sorted = [...members].sort((a, b) => {
    const order: Record<string, number> = {
      disponivel: 0,
      nao_sei: 1,
      indisponivel: 2,
    }
    const aOrder = a.status ? order[a.status] ?? 3 : 3
    const bOrder = b.status ? order[b.status] ?? 3 : 3
    return aOrder - bOrder
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{role.icon}</span>
            <span>
              {role.label} - {format(new Date(date + "T12:00:00"), "dd/MM", { locale: ptBR })}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
          {currentMemberEmail && (
            <button
              onClick={onRemove}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-destructive/10 text-destructive"
            >
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-destructive/10">
                <Minus className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium">Remover membro</span>
            </button>
          )}
          {sorted.map((member) => {
            const statusStyle = member.status
              ? STATUS_STYLES[member.status]
              : null
            const isSelected = member.email === currentMemberEmail
            return (
              <button
                key={member.id}
                onClick={() => onSelect(member)}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-accent/50"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${
                    statusStyle
                      ? `${statusStyle.bg} ${statusStyle.text}`
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {statusStyle ? statusStyle.icon : <Minus className="h-3 w-3" />}
                </span>
                <div className="flex flex-col items-start text-left min-w-0">
                  <span
                    className={`font-medium truncate w-full ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {member.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    {statusStyle ? statusStyle.label : "Sem resposta"}
                  </span>
                </div>
                {isSelected && (
                  <Check className="ml-auto h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            )
          })}
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum membro encontrado nesta escala.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ScheduleBuilder({ scheduleType, onBack }: ScheduleBuilderProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(new Date())
  const [builtEntries, setBuiltEntries] = useState<BuiltScheduleEntry[]>([])
  const [membersCache, setMembersCache] = useState<
    Record<string, MemberAvailability[]>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState<{
    role: RoleType
    date: string
  } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const config = SCHEDULE_CONFIG[scheduleType]
  const currentMonthDate = addMonths(new Date(), monthOffset)
  const scheduleDays = getScheduleDays(
    currentMonthDate,
    config.sundaysOnly,
    viewMode,
    selectedWeekDate
  )
  const monthStart = format(startOfMonth(currentMonthDate), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(currentMonthDate), "yyyy-MM-dd")

  // Get distinct weeks in the current month for the week selector
  const weeksInMonth = (() => {
    const days = getScheduleDays(currentMonthDate, config.sundaysOnly, "month")
    const weeks: Date[] = []
    const seen = new Set<string>()
    for (const day of days) {
      const weekKey = format(
        startOfWeek(day, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      )
      if (!seen.has(weekKey)) {
        seen.add(weekKey)
        weeks.push(day)
      }
    }
    return weeks
  })()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { getBuiltScheduleEntries } = await import(
        "@/lib/schedule-builder-api"
      )
      const entries = await getBuiltScheduleEntries(
        scheduleType,
        monthStart,
        monthEnd
      )
      setBuiltEntries(entries)
    } catch (err) {
      console.error("Erro ao carregar escalas montadas:", err)
    } finally {
      setIsLoading(false)
    }
  }, [scheduleType, monthStart, monthEnd])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load members for a specific date on demand
  async function loadMembersForDate(date: string) {
    if (membersCache[date]) return membersCache[date]
    try {
      const { getMembersWithAvailability } = await import(
        "@/lib/schedule-builder-api"
      )
      const members = await getMembersWithAvailability(scheduleType, date)
      setMembersCache((prev) => ({ ...prev, [date]: members }))
      return members
    } catch (err) {
      console.error("Erro ao carregar membros:", err)
      return []
    }
  }

  function getAssignment(date: string, role: string): BuiltScheduleEntry | null {
    return (
      builtEntries.find(
        (e) => e.schedule_date === date && e.role === role
      ) ?? null
    )
  }

  async function handleOpenPicker(
    role: RoleType,
    date: string
  ) {
    await loadMembersForDate(date)
    setPickerOpen({ role, date })
  }

  async function handleAssignMember(member: MemberAvailability) {
    if (!pickerOpen) return
    const { role, date } = pickerOpen

    // Optimistic update
    setBuiltEntries((prev) => {
      const filtered = prev.filter(
        (e) => !(e.schedule_date === date && e.role === role.key)
      )
      return [
        ...filtered,
        {
          id: crypto.randomUUID(),
          schedule_type: scheduleType,
          schedule_date: date,
          role: role.key,
          member_name: member.name,
          member_email: member.email,
        },
      ]
    })
    setPickerOpen(null)

    try {
      const { upsertBuiltScheduleEntry } = await import(
        "@/lib/schedule-builder-api"
      )
      await upsertBuiltScheduleEntry(
        scheduleType,
        date,
        role.key,
        member.name,
        member.email
      )
    } catch (err) {
      console.error("Erro ao salvar:", err)
      loadData()
    }
  }

  async function handleRemoveMember() {
    if (!pickerOpen) return
    const { role, date } = pickerOpen

    setBuiltEntries((prev) =>
      prev.filter(
        (e) => !(e.schedule_date === date && e.role === role.key)
      )
    )
    setPickerOpen(null)

    try {
      const { removeBuiltScheduleEntry } = await import(
        "@/lib/schedule-builder-api"
      )
      await removeBuiltScheduleEntry(scheduleType, date, role.key)
    } catch (err) {
      console.error("Erro ao remover:", err)
      loadData()
    }
  }

  async function handleExport() {
    if (!exportRef.current) return
    setIsExporting(true)
    try {
      const { toPng } = await import("html-to-image")
      
      // Get the current element's scroll dimensions
      const element = exportRef.current
      const scrollHeight = element.scrollHeight
      const scrollWidth = element.scrollWidth
      
      // Create a wrapper with fixed dimensions to ensure consistent export
      const wrapper = document.createElement("div")
      wrapper.style.position = "fixed"
      wrapper.style.top = "0"
      wrapper.style.left = "0"
      wrapper.style.width = scrollWidth + "px"
      wrapper.style.height = scrollHeight + "px"
      wrapper.style.backgroundColor = document.documentElement.classList.contains("dark") ? "#1a1a2e" : "#ffffff"
      wrapper.style.overflow = "hidden"
      wrapper.style.zIndex = "-9999"
      
      // Clone the export element
      const clone = element.cloneNode(true) as HTMLElement
      wrapper.appendChild(clone)
      document.body.appendChild(wrapper)
      
      // Export with fixed dimensions
      const dataUrl = await toPng(wrapper, {
        backgroundColor: document.documentElement.classList.contains("dark") ? "#1a1a2e" : "#ffffff",
        pixelRatio: 2,
        width: scrollWidth,
        height: scrollHeight,
      })
      
      // Clean up
      document.body.removeChild(wrapper)
      
      // Download
      const link = document.createElement("a")
      link.download = `escala-${config.label.toLowerCase()}-${format(currentMonthDate, "yyyy-MM")}${viewMode === "week" ? "-semana" : ""}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Erro ao exportar:", err)
    } finally {
      setIsExporting(false)
    }
  }

  const monthLabel = format(currentMonthDate, "MMMM yyyy", { locale: ptBR })

  // Display days is the same as schedule days (no backend changes)
  const displayDays = scheduleDays

  const pickerMembers = pickerOpen
    ? membersCache[pickerOpen.date] ?? []
    : []
  const pickerCurrentEmail = pickerOpen
    ? getAssignment(pickerOpen.date, pickerOpen.role.key)?.member_email ?? null
    : null

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Montar Escala - {config.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              Selecione os membros para cada funcao
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="Inicio">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 pb-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMonthOffset((m) => m - 1)}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground capitalize">
            {monthLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMonthOffset((m) => m + 1)}
            aria-label="Proximo mes"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View mode toggle + week selector + export */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Mensal
            </button>
            <button
              onClick={() => {
                setViewMode("week")
                if (weeksInMonth.length > 0) {
                  setSelectedWeekDate(weeksInMonth[0])
                }
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Semanal
            </button>
          </div>

          {viewMode === "week" && (
            <div className="flex items-center gap-1 overflow-x-auto">
              {weeksInMonth.map((weekDate, index) => {
                const isActive = isSameWeek(weekDate, selectedWeekDate, {
                  weekStartsOn: 0,
                })
                return (
                  <button
                    key={weekDate.toISOString()}
                    onClick={() => setSelectedWeekDate(weekDate)}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Sem {index + 1}
                  </button>
                )
              })}
            </div>
          )}



          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-muted/30">
        {(Object.keys(STATUS_STYLES) as ScheduleStatus[]).map((status) => {
          const style = STATUS_STYLES[status]
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded ${style.bg} ${style.text}`}
              >
                {style.icon}
              </span>
              <span className="text-xs text-muted-foreground">
                {style.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Main table */}
      <main className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Carregando escala...
              </p>
            </div>
          </div>
        ) : scheduleDays.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">
              Nenhum dia disponivel neste periodo.
            </p>
          </div>
        ) : (
          <div ref={exportRef} className="bg-background p-1">
            {/* Header with logo and text */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold text-foreground">Reviver</p>
                    <h2 className="text-sm font-bold text-foreground capitalize">
                      Escala {config.label} - {monthLabel}
                      {viewMode === "week" ? " (Semanal)" : ""}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-[5] bg-muted/60 backdrop-blur px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[130px] min-w-[130px] max-w-[130px] border-r">
                    Funcao
                  </th>
                  {displayDays.map((day) => {
                    const isToday =
                      format(day, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd")
                    const eventLabel = EVENT_LABELS[getDay(day)] ?? ""
                    const weekdayLabel = WEEKDAY_LABELS[getDay(day)] ?? ""
                    
                    return (
                      <th
                        key={day.toISOString()}
                        className={`px-2 py-2.5 text-center text-xs font-semibold min-w-[110px] ${
                          isToday
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] font-bold tracking-wide opacity-70">
                            {eventLabel}
                          </span>
                          <span className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                            {format(day, "dd/MM")}
                          </span>
                          <span className="text-[10px] font-normal normal-case tracking-normal opacity-50">
                            ({weekdayLabel})
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {getRolesForScheduleType(scheduleType).map((role) => (
                  <tr key={role.key} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-[5] bg-background px-3 py-2.5 w-[130px] min-w-[130px] max-w-[130px] border-r">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary shrink-0 text-lg">
                          {role.icon}
                        </span>
                        <span className="font-medium text-xs text-foreground truncate">
                          {role.label}
                        </span>
                      </div>
                    </td>
                    {scheduleType === 'louvor' ? (
                      // For louvor, merge Thursday/Sunday cells visually
                      displayDays.filter((_, i) => i % 2 === 0).map((thursday, weekIndex) => {
                        const sunday = displayDays[weekIndex * 2 + 1]
                        const thursdayStr = format(thursday, "yyyy-MM-dd")
                        const sundayStr = sunday ? format(sunday, "yyyy-MM-dd") : thursdayStr
                        
                        // Use the same person for both days (or the Thursday assignment)
                        const assignment = getAssignment(thursdayStr, role.key) || getAssignment(sundayStr, role.key)
                        
                        return (
                          <td
                            key={thursdayStr}
                            colSpan={2}
                            className="px-2 py-2 text-center min-w-[110px]"
                          >
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleOpenPicker(role, thursdayStr)}
                                    className={`w-full rounded-lg border px-2 py-2 text-xs transition-all hover:ring-2 hover:ring-primary/30 active:scale-95 min-h-[40px] flex items-center justify-center gap-1.5 ${
                                      assignment?.member_name
                                        ? "bg-primary/5 border-primary/20 text-foreground"
                                        : "bg-muted/30 border-dashed border-muted-foreground/20 text-muted-foreground"
                                    }`}
                                  >
                                    {assignment?.member_name ? (
                                      <>
                                        <UserRound className="h-3 w-3 text-primary shrink-0" />
                                        <span className="font-medium truncate">
                                          {assignment.member_name}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground/50">
                                        --
                                      </span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">
                                    {assignment?.member_name
                                      ? `${role.label}: ${assignment.member_name}`
                                      : `Clique para escalar ${role.label}`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        )
                      })
                    ) : (
                      // For other schedule types, render cells normally
                      displayDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd")
                        const assignment = getAssignment(dateStr, role.key)
                        return (
                          <td
                            key={dateStr}
                            className="px-2 py-2 text-center min-w-[110px]"
                          >
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleOpenPicker(role, dateStr)}
                                    className={`w-full rounded-lg border px-2 py-2 text-xs transition-all hover:ring-2 hover:ring-primary/30 active:scale-95 min-h-[40px] flex items-center justify-center gap-1.5 ${
                                      assignment?.member_name
                                        ? "bg-primary/5 border-primary/20 text-foreground"
                                        : "bg-muted/30 border-dashed border-muted-foreground/20 text-muted-foreground"
                                    }`}
                                  >
                                    {assignment?.member_name ? (
                                      <>
                                        <UserRound className="h-3 w-3 text-primary shrink-0" />
                                        <span className="font-medium truncate">
                                          {assignment.member_name}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground/50">
                                        --
                                      </span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">
                                    {assignment?.member_name
                                      ? `${role.label}: ${assignment.member_name}`
                                      : `Clique para escalar ${role.label}`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        )
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-3 bg-muted/20">
        <p className="text-xs text-center text-muted-foreground">
          Toque em uma celula para escalar um membro
        </p>
      </footer>

      {/* Member picker dialog */}
      {pickerOpen && (
        <MemberPickerDialog
          open={!!pickerOpen}
          onClose={() => setPickerOpen(null)}
          members={pickerMembers}
          role={pickerOpen.role}
          date={pickerOpen.date}
          onSelect={handleAssignMember}
          onRemove={handleRemoveMember}
          currentMemberEmail={pickerCurrentEmail}
        />
      )}
    </div>
  )
}
