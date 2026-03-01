import { SchedulePage } from "@/components/schedule-page"

export const metadata = {
  title: "Escala da Sonoplastia",
  description: "Gerencie a disponibilidade da equipe de sonoplastia",
}

export default function SonoplastiaPage() {
  return <SchedulePage scheduleType="sonoplastia" />
}
