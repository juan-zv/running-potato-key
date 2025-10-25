import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import supabase from "@/utils/supabase"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

export function SignInCard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      
      // Use environment variable for site URL, fallback to current origin
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}${import.meta.env.BASE_URL || '/'}`
      
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

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error("Failed to sign out", {
          description: error.message,
        })
      } else {
        toast.success("Signed out successfully")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {user ? "Welcome back!" : "Sign In"}
        </CardTitle>
        <CardDescription>
          {user
            ? `You're signed in as ${user.email}`
            : "Sign in with your Google account to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
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
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.user_metadata?.full_name && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {user.user_metadata.full_name}
                  </p>
                </div>
              )}
              {user.user_metadata?.avatar_url && (
                <div className="mt-3">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-16 w-16 rounded-full"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleSignOut}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
