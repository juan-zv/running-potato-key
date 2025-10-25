import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone } from "lucide-react"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  initials: string
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    initials: "SJ",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    initials: "MC",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    phone: "+1 (555) 987-6543",
    initials: "ER",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    initials: "DK",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    phone: "+1 (555) 456-7890",
    initials: "LA",
  },
]

export function ContactsCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
        <CardDescription>Your key contacts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <Avatar>
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.initials}</AvatarFallback>
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
      </CardContent>
    </Card>
  )
}
