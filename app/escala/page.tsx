"use client"

import { useState } from "react"
import type { ScheduleType } from "@/lib/types"
import { SCHEDULE_CONFIG } from "@/lib/types"
import { ScheduleBuilder } from "@/components/schedule-builder"
import { GlobalHeader } from "@/components/global-header"
import { ChevronRight, Blocks } from "lucide-react"


const SCHEDULE_ICONS: Record<ScheduleType, string> = {
  louvor: "🎵",
  sonoplastia: "🎚️",
  midia: "💻",
}

const SCHEDULE_COLORS: Record<ScheduleType, { bg: string; text: string; border: string; hover: string }> = {
  louvor: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
  },
  sonoplastia: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    hover: "hover:bg-sky-100 dark:hover:bg-sky-900/40",
  },
  midia: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    hover: "hover:bg-violet-100 dark:hover:bg-violet-900/40",
  },
}

export default function EscalaPage() {
  const [selectedType, setSelectedType] = useState<ScheduleType | null>(null)

  if (selectedType) {
    return (
      <ScheduleBuilder
        scheduleType={selectedType}
        onBack={() => setSelectedType(null)}
        showMergedCells={true}
      />
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <GlobalHeader />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="absolute top-20 right-4">
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary">
              <Blocks className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance text-center">
              Montar Escala
            </h1>
            <p className="text-sm text-muted-foreground text-center text-pretty">
              Selecione qual escala deseja montar
            </p>
          </div>

          <div className="space-y-3">
            {(Object.keys(SCHEDULE_CONFIG) as ScheduleType[]).map((type) => {
              const config = SCHEDULE_CONFIG[type]
              const colors = SCHEDULE_COLORS[type]
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-4 w-full rounded-xl border px-4 py-4 transition-all active:scale-[0.98] ${colors.bg} ${colors.border} ${colors.hover}`}
                >
                  <span
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-lg text-2xl ${colors.bg}`}
                  >
                    {SCHEDULE_ICONS[type]}
                  </span>
                  <div className="flex flex-col items-start text-left">
                    <span className={`font-semibold text-base ${colors.text}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                  </div>
                  <ChevronRight className={`ml-auto h-5 w-5 ${colors.text} opacity-50`} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
