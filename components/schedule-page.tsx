"use client"

import { useState } from "react"
import { EmailLogin } from "@/components/email-login"
import { RegisterForm } from "@/components/register-form"
import { ScheduleTable } from "@/components/schedule-table"
import { GlobalHeader } from "@/components/global-header"
import type { ScheduleType } from "@/lib/types"

type AppView = "login" | "register" | "schedule"

interface SchedulePageProps {
  scheduleType: ScheduleType
}

export function SchedulePage({ scheduleType }: SchedulePageProps) {
  const [view, setView] = useState<AppView>("login")
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  function handleMemberFound(memberId: string, email: string) {
    setCurrentMemberId(memberId)
    setCurrentEmail(email)
    setView("schedule")
    setIsLoading(false)
  }

  function handleMemberNotFound(email: string) {
    setPendingEmail(email)
    setView("register")
    setIsLoading(false)
  }

  function handleRegistered(memberId: string) {
    setCurrentMemberId(memberId)
    setCurrentEmail(pendingEmail)
    setView("schedule")
  }

  function handleLogout() {
    setCurrentMemberId(null)
    setCurrentEmail("")
    setPendingEmail("")
    setView("login")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <GlobalHeader />
      <div className="flex-1">
        {view === "login" && (
          <EmailLogin
            scheduleType={scheduleType}
            onMemberFound={(id, email) => {
              setIsLoading(true)
              handleMemberFound(id, email)
            }}
            onMemberNotFound={(email) => {
              setIsLoading(true)
              handleMemberNotFound(email)
            }}
            isLoading={isLoading}
          />
        )}

        {view === "register" && (
          <RegisterForm
            email={pendingEmail}
            onRegistered={handleRegistered}
            onBack={() => setView("login")}
            scheduleType={scheduleType}
          />
        )}

        {view === "schedule" && currentMemberId && (
          <ScheduleTable
            currentMemberId={currentMemberId}
            currentEmail={currentEmail}
            onLogout={handleLogout}
            scheduleType={scheduleType}
          />
        )}
      </div>
    </div>
  )
}
