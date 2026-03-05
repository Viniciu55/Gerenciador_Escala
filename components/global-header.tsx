import { ThemeToggle } from "@/components/theme-toggle"

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
      </div>
    </header>
  )
}
