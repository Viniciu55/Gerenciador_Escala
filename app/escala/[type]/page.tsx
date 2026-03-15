"use client"

import { useParams } from "next/navigation"
import type { ScheduleType } from "@/lib/types"
import { SCHEDULE_CONFIG } from "@/lib/types"
import { ScheduleBuilder } from "@/components/schedule-builder"
import { GlobalHeader } from "@/components/global-header"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EscalaTypePage() {
  const params = useParams()
  const type = params.type as string

  // Validar se o tipo é válido
  if (!type || !Object.keys(SCHEDULE_CONFIG).includes(type)) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <GlobalHeader />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md space-y-4">
            <h1 className="text-xl font-bold text-foreground">Escala não encontrada</h1>
            <p className="text-sm text-muted-foreground">
              A escala que você procura não existe.
            </p>
            <Link href="/escala">
              <Button variant="outline" className="w-full">
                Voltar para seleção
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScheduleBuilder
      scheduleType={type as ScheduleType}
      onBack={() => window.history.back()}
      showMergedCells={true}
    />
  )
}
