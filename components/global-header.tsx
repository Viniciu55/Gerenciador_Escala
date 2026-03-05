import { Home } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function GlobalHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-lg font-bold text-foreground">Reviver</span>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Inicio">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <ThemeToggle />
      </div>
      </div>
    </header>
  )
}
