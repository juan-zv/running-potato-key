import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Loader2, Users } from "lucide-react"
import type { User } from "@/components/db/schema"

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface ContactsCardProps {
  users: User[]
  loading: boolean
}

export function ContactsCard({ users, loading }: ContactsCardProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
        <CardDescription>Your roommates</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No roommates yet</p>
            <p className="text-sm">Invite people to join your group</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Avatar>
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{contact.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
