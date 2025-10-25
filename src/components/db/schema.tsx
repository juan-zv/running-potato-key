type User = {
    id: number
    dob: Date
    name: string
    email: string
    created_at: Date
    bio: string
    allergies: string
    special_needs: string
    pets: string
    room_id: number
    phone: string
}

type Room = {
    id: number
    created_at: Date
    building: string
    apt_num: string
}

type Image = {
    id: number
    url: string
    title: string
    category: string
    room_id: number
    created_by: number
}

type Task = {
    id: number
    name: string
    desciription: string
    assigned_to: number
    completed: boolean
    due_date: Date
}

type AssignedTask = {
    task_id: number
    user_id: number
}

export type { User, Room, Image, Task, AssignedTask }