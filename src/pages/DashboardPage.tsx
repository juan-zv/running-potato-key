import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { CalendarEventsCard } from "@/components/dashboard/CalendarEventsCard"
import { AISummaryCard } from "@/components/dashboard/AISummaryCard"
import { TasksCard } from "@/components/dashboard/TasksCard"
import { ContactsCard } from "@/components/dashboard/ContactsCard"
import { GalleryCard } from "@/components/dashboard/GalleryCard"
import { StudyMode } from "@/components/dashboard/StudyMode"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { useGroupData } from "@/hooks/useGroupData"
import supabase from "@/utils/supabase"
import { toast } from "sonner"
import { LogOut, Settings, User as UserIcon, Bell, HelpCircle, GraduationCap, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import type { CalendarEvent } from "@/utils/calendar"

export function DashboardPage() {
  const { user } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [studyModeActive, setStudyModeActive] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  
  // Get user's group_id from user metadata or profile
  const [userGroupId, setUserGroupId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Fetch group data with auto-refresh
  const { 
    group, 
    users, 
    images, 
    tasks, 
    assignedTasks,
    fullData,
    loading, 
    error, 
    refetch, 
    updateTask 
  } = useGroupData(userGroupId)

  // Log the complete structured JSON data for debugging
  useEffect(() => {
    if (!loading && fullData) {
      console.log("📊 Complete Group Data (JSON Structure):", JSON.stringify(fullData, null, 2))
      console.log("📊 Full Data Object:", fullData)
    }
  }, [fullData, loading])

  // Callback to receive calendar events from CalendarEventsCard
  const handleCalendarEventsLoaded = (events: CalendarEvent[]) => {
    setCalendarEvents(events)
  }

  // Load user's group_id and database user_id on mount
  useEffect(() => {
    async function loadUserInfo() {
      if (!user) return

      try {
        // Fetch the user's profile from the database to get group_id
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("id, group_id")
          .eq("email", user.email)
          .single()

        if (userError) {
          console.error("Error fetching user profile:", userError)
          toast.error("Failed to load user profile", {
            description: "Please make sure your profile is set up in the database",
          })
          return
        }

        if (userData) {
          setUserGroupId(userData.group_id)
          setCurrentUserId(userData.id)
          console.log("📊 Loaded user info - User ID:", userData.id, "Group ID:", userData.group_id)
        }
      } catch (err) {
        console.error("Error loading user info:", err)
      }
    }

    loadUserInfo()
  }, [user])

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

  const handleStartStudyMode = () => {
    setStudyModeActive(true)
    toast.success("Study Mode Activated", {
      description: "Everyone in your household has been notified that you've started studying.",
      duration: 4000,
    })
  }

  const handleExitStudyMode = () => {
    setStudyModeActive(false)
    toast.info("Study Session Complete", {
      description: "Everyone in your household has been notified that you've finished studying.",
      duration: 4000,
    })
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
                        <Badge variant="secondary" className="text-xs">Clean</Badge>
                        <Badge variant="default" className="text-xs">Best Roommate</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent side="left">
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
                          <Badge variant="secondary">Clean</Badge>
                          <Badge variant="default">Best Roommate</Badge>
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

                    <div className="border-t pt-4 mx-auto w-fit">
                      <Button
                        onClick={handleSignOut}
                        variant="destructive"
                        className="w-fit mx-auto"
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right side - Theme Toggle */}
            <div className="flex items-center gap-3">
              <ModeToggle />
            </div>
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
                {group ? (
                  `${group.building} - Apartment ${group.apt_num} • ${users.length} roommate${users.length !== 1 ? 's' : ''}`
                ) : (
                  "Here's what's happening with your schedule today."
                )}
              </p>
            </div>

            {/* AI Summary - Full Width */}
            <AISummaryCard 
              tasks={tasks} 
              calendarEvents={calendarEvents}
            />

            {/* Study Mode Card */}
            <Card className="w-full border-primary/30 bg-linear-to-r from-primary/10 to-purple-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Study Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Focus for 60 minutes with 5 minute breaks
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartStudyMode}
                    size="lg"
                    className="gap-2"
                  >
                    <GraduationCap className="h-5 w-5" />
                    Start Studying
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid Layout with Variant Widths */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Events - Spans 2 columns on large screens */}
              <div className="lg:col-span-2">
                <CalendarEventsCard onEventsLoaded={handleCalendarEventsLoaded} />
              </div>

              {/* Tasks - 1 column */}
              <div className="lg:col-span-1">
                <TasksCard 
                  tasks={tasks} 
                  loading={loading} 
                  onTaskUpdate={updateTask}
                />
              </div>

              {/* Contacts - 1 column */}
              <div className="lg:col-span-1">
                <ContactsCard 
                  users={users} 
                  loading={loading}
                />
              </div>

              {/* Gallery - Spans 2 columns on large screens */}
              <div className="lg:col-span-2">
                <GalleryCard 
                  images={images} 
                  loading={loading}
                  onImageUploaded={refetch}
                  groupId={userGroupId}
                  userId={currentUserId}
                />
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  <strong>Error loading data:</strong> {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={refetch}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Study Mode Overlay */}
        {studyModeActive && (
          <StudyMode onExit={handleExitStudyMode} />
        )}
      </div>
    </ThemeProvider>
  )
}
