import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/sonner"
import { SignInCard } from "@/components/auth/SignInCard"
import { CalendarEventsCard } from "@/components/auth/CalendarEventsCard"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <SignInCard />
        <CalendarEventsCard />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

export default App