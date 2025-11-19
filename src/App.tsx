import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

function App() {
  const { user, loading } = useAuth()
  const [progress, setProgress] = useState(0)
  
  // Check if we're on the reset password page
  const isResetPasswordPage = window.location.pathname === '/reset-password' || 
                               window.location.hash.includes('type=recovery')

  // Animate progress bar while loading
  useEffect(() => {
    if (loading) {
      setProgress(0)
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 100)
      return () => clearInterval(timer)
    } else {
      setProgress(100)
    }
  }, [loading])

  if (loading) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Loading</h2>
              <p className="text-muted-foreground">Please wait...</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    )
  }

  // Show reset password page if user is on that route
  if (isResetPasswordPage) {
    return (
      <>
        <ResetPasswordPage />
        <Toaster />
      </>
    )
  }

  return (
    <>
      {user ? <DashboardPage /> : <LoginPage />}
      <Toaster />
    </>
  )

  // return (
  //   <>
  //     <DashboardPage />
  //   </>
  // )
}

export default App