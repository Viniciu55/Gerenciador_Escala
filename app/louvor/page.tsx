import { SchedulePage } from "@/components/schedule-page"

export const metadata = {
  title: "Escala do Louvor",
  description: "Gerencie a disponibilidade da equipe de louvor",
}

export default function LouvorPage() {
  return <SchedulePage scheduleType="louvor" />
}
