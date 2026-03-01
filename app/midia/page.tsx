import { SchedulePage } from "@/components/schedule-page"

export const metadata = {
  title: "Escala da Midia",
  description: "Gerencie a disponibilidade da equipe de midia",
}

export default function MidiaPage() {
  return <SchedulePage scheduleType="midia" />
}
