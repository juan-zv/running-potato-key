import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import supabase from "@/utils/supabase"
import { toast } from "sonner"

type AuthMode = "signin" | "signup" | "reset"

export function SignInCard() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      
      // Use environment variable for site URL, or construct from current location
      const redirectUrl = import.meta.env.VITE_SITE_URL 
        ? import.meta.env.VITE_SITE_URL 
        : `${window.location.origin}${import.meta.env.BASE_URL || '/'}`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          scopes: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        toast.error("Failed to sign in", {
          description: error.message,
        })
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("Failed to sign in", {
          description: error.message,
        })
      } else {
        toast.success("Successfully signed in!")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      const redirectUrl = import.meta.env.VITE_SITE_URL 
        ? import.meta.env.VITE_SITE_URL 
        : `${window.location.origin}${import.meta.env.BASE_URL || '/'}`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        toast.error("Failed to sign up", {
          description: error.message,
        })
      } else {
        toast.success("Account created!", {
          description: "Please check your email to verify your account.",
        })
        setMode("signin")
        setPassword("")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      setLoading(true)
      const redirectUrl = import.meta.env.VITE_SITE_URL 
        ? `${import.meta.env.VITE_SITE_URL}/reset-password`
        : `${window.location.origin}${import.meta.env.BASE_URL || '/'}reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast.error("Failed to send reset email", {
          description: error.message,
        })
      } else {
        toast.success("Password reset email sent!", {
          description: "Please check your email for the reset link.",
        })
        setMode("signin")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getCardTitle = () => {
    switch (mode) {
      case "signup":
        return "Create Account"
      case "reset":
        return "Reset Password"
      default:
        return "Sign In"
    }
  }

  const getCardDescription = () => {
    switch (mode) {
      case "signup":
        return "Create a new account to get started"
      case "reset":
        return "Enter your email to receive a password reset link"
      default:
        return "Sign in to access your dashboard"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{getCardTitle()}</CardTitle>
        <CardDescription>{getCardDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email/Password Form */}
        <form onSubmit={mode === "signin" ? handleEmailSignIn : mode === "signup" ? handleEmailSignUp : handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Send Reset Link"}
          </Button>
        </form>

        {/* Mode Toggle Links */}
        <div className="text-center text-sm space-y-2">
          {mode === "signin" && (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Don't have an account? Sign up
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-muted-foreground hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}
          
          {(mode === "signup" || mode === "reset") && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-primary hover:underline"
              disabled={loading}
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
          variant="outline"
          size="lg"
        >
          <svg
            className="mr-2 h-5 w-5"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </CardContent>
    </Card>
  )
}
