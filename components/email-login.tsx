"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarDays, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ScheduleType } from "@/lib/types"
import { SCHEDULE_CONFIG } from "@/lib/types"

interface EmailLoginProps {
  onMemberFound: (memberId: string, email: string) => void
  onMemberNotFound: (email: string) => void
  isLoading: boolean
  scheduleType: ScheduleType
}

export function EmailLogin({ onMemberFound, onMemberNotFound, isLoading, scheduleType }: EmailLoginProps) {
  const [email, setEmail] = useState("")
  const config = SCHEDULE_CONFIG[scheduleType]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    const lookupEmail = email.toLowerCase().trim()

    import("@/lib/schedule-api").then(({ lookupMember }) => {
      lookupMember(lookupEmail, scheduleType).then((member) => {
        if (member) {
          onMemberFound(member.id, member.email)
        } else {
          onMemberNotFound(lookupEmail)
        }
      })
    })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance text-center">
            {config.description}
          </h1>
          <p className="text-sm text-muted-foreground text-center text-pretty">
            Digite seu e-mail para acessar a escala ou criar sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="h-12 text-base"
            />
          </div>
          <Button type="submit" className="h-12 text-base" disabled={isLoading || !email.trim()}>
            {isLoading ? "Verificando..." : "Continuar"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
