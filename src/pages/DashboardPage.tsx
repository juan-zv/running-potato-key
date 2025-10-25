import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { CalendarEventsCard } from "@/components/auth/CalendarEventsCard"
import { AISummaryCard } from "@/components/dashboard/AISummaryCard"
import { TasksCard } from "@/components/dashboard/TasksCard"
import { ContactsCard } from "@/components/dashboard/ContactsCard"
import { GalleryCard } from "@/components/dashboard/GalleryCard"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import supabase from "@/utils/supabase"
import { toast } from "sonner"
import { LogOut, Settings, User as UserIcon, Bell, HelpCircle } from "lucide-react"
import { useState } from "react"

export function DashboardPage() {
  const { user } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Failed to sign out", {
        description: error.message,
      })
    } else {
      setSheetOpen(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left side - User Profile */}
            <div className="flex items-center gap-4">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email || "User"} 
                      />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {user?.user_metadata?.full_name || user?.email}
                        </p>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                        <Badge variant="outline" className="text-xs">Premium</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Account</SheetTitle>
                    <SheetDescription>
                      Manage your account settings and preferences
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url} 
                          alt={user?.user_metadata?.full_name || user?.email || "User"} 
                        />
                        <AvatarFallback className="text-lg">
                          {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {user?.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="secondary">Pro</Badge>
                          <Badge variant="outline">Premium</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          toast.info("Settings", {
                            description: "Settings page coming soon!",
                          })
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          toast.info("Profile", {
                            description: "Profile page coming soon!",
                          })
                        }}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          toast.info("Notifications", {
                            description: "Notifications page coming soon!",
                          })
                        }}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          toast.info("Help", {
                            description: "Help center coming soon!",
                          })
                        }}
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <Button
                        onClick={handleSignOut}
                        variant="destructive"
                        className="w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right side - Theme Toggle */}
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your schedule today.
              </p>
            </div>

            {/* AI Summary - Full Width */}
            <AISummaryCard />

            {/* Grid Layout with Variant Widths */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Events - Spans 2 columns on large screens */}
              <div className="lg:col-span-2">
                <CalendarEventsCard />
              </div>

              {/* Tasks - 1 column */}
              <div className="lg:col-span-1">
                <TasksCard />
              </div>

              {/* Contacts - 1 column */}
              <div className="lg:col-span-1">
                <ContactsCard />
              </div>

              {/* Gallery - Spans 2 columns on large screens */}
              <div className="lg:col-span-2">
                <GalleryCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
