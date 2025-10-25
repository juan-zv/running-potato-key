# Dashboard Components Review & Testing Guide

## ✅ Review Summary

All dashboard components have been reviewed and updated to work with the database schema and centralized mock data.

## 📊 Database Schema

**Location**: `src/components/db/schema.tsx`

### Core Types:
- **User**: Represents roommates/household members
- **Group**: Represents the apartment/household (formerly "Room")
- **Image**: Gallery images with creator and category
- **Task**: To-do items with assignments and due dates
- **AssignedTask**: Junction table for many-to-many Task ↔ User relationship

### Relationships:
- Group → Users (one-to-many)
- Group → Images (one-to-many)
- Group → Tasks (one-to-many)
- User → Images (one-to-many, as creator)
- Task ↔ User (many-to-many via AssignedTask)

## 🗂️ Mock Data

**Location**: `src/utils/mockData.ts`

Contains realistic test data:
- ✅ 1 Group (Sunset Apartments #204)
- ✅ 5 Users (Sarah, Michael, Emily, David, Lisa)
- ✅ 6 Images (various categories: travel, nature, family)
- ✅ 6 Tasks (household chores and responsibilities)
- ✅ 7 AssignedTask records (task assignments)

### Helper Functions:
```typescript
getUserById(id: number)
getUsersByGroupId(groupId: number)
getImagesByGroupId(groupId: number)
getTasksByGroupId(groupId: number)
getTasksByUserId(userId: number)
```

## 📦 Dashboard Components

### 1. **ContactsCard** ✅
- **File**: `src/components/dashboard/ContactsCard.tsx`
- **Data**: Uses `mockUsers` from centralized mock data
- **Features**:
  - Displays user name, email, phone
  - Avatar with auto-generated initials
  - Hover effects on contact cards
- **Schema Alignment**: ✅ Uses `User` type

### 2. **TasksCard** ✅
- **File**: `src/components/dashboard/TasksCard.tsx`
- **Data**: Uses `mockTasks` from centralized mock data
- **Features**:
  - Task name, description, due date
  - Checkbox for completion status
  - Strike-through for completed tasks
  - Checkmark icon for completed items
- **Schema Alignment**: ✅ Uses `Task` type with correct properties (`name`, `description`, `due_date`)

### 3. **GalleryCard** ✅
- **File**: `src/components/dashboard/GalleryCard.tsx`
- **Data**: Uses `mockImages` from centralized mock data
- **Features**:
  - Image carousel with navigation
  - Upload functionality with Sheet component
  - Category selection
  - File validation (type & size)
  - Preview before upload
  - Toast notifications
- **Schema Alignment**: ✅ Uses `Image` type with `group_id` and `created_by`

### 4. **AISummaryCard** ✅
- **File**: `src/components/dashboard/AISummaryCard.tsx`
- **Data**: Uses placeholder data (will be replaced with real data later)
- **Features**:
  - AI-generated daily summary using Gemini API
  - Loading spinner
  - Stats badges (events, tasks, free hours)
- **API Integration**: ✅ Uses `VITE_GEMINI_API_KEY`

### 5. **CalendarEventsCard** ✅
- **File**: `src/components/dashboard/CalendarEventsCard.tsx`
- **Data**: Fetches from Google Calendar API
- **Features**:
  - Displays upcoming events
  - ScrollArea for long lists (h-[600px])
  - Date/time formatting
- **API Integration**: ✅ Uses Google Calendar OAuth

### 6. **StudyMode** ✅
- **File**: `src/components/dashboard/StudyMode.tsx`
- **Features**:
  - Pomodoro timer (60min work / 5min break)
  - Progress bar using proper `Progress` component
  - Play/Pause/Reset controls
  - Audio notification on session end
  - Full-screen overlay
- **Schema Alignment**: N/A (standalone utility)

## 🧪 Testing with Mock Data

### Current State:
All components are using mock data and ready for testing:

```typescript
// ContactsCard
import { mockUsers } from "@/utils/mockData"

// TasksCard
import { mockTasks } from "@/utils/mockData"

// GalleryCard
import { mockImages } from "@/utils/mockData"
```

### Testing Checklist:

#### ContactsCard:
- [ ] Displays all 5 mock users
- [ ] Shows name, email, phone correctly
- [ ] Avatar initials are correct (SJ, MC, ER, DK, LA)
- [ ] Hover effect works on contact cards

#### TasksCard:
- [ ] Displays all 6 mock tasks
- [ ] Shows task name, description, due date
- [ ] Checkbox toggles (currently view-only)
- [ ] Completed tasks show strike-through
- [ ] Checkmark icon appears for completed tasks
- [ ] Plus button is visible (functionality not yet implemented)

#### GalleryCard:
- [ ] Displays images in carousel
- [ ] Navigation buttons work (previous/next)
- [ ] "Add Image" button opens Sheet from right
- [ ] Category select dropdown works
- [ ] File input accepts images only
- [ ] File validation shows toast errors for invalid files
- [ ] Preview shows selected image
- [ ] Upload button shows loading state
- [ ] Success/error toasts display correctly

#### AISummaryCard:
- [ ] Shows loading spinner initially
- [ ] Generates AI summary (requires `VITE_GEMINI_API_KEY`)
- [ ] Displays stats badges
- [ ] Handles errors gracefully

#### StudyMode:
- [ ] Timer displays correct format (MM:SS)
- [ ] Play button starts timer
- [ ] Pause button stops timer
- [ ] Reset button resets to session duration
- [ ] Progress bar fills as time progresses
- [ ] Session switches automatically (work ↔ break)
- [ ] Audio plays on session end
- [ ] Exit button returns to dashboard

## 🔄 Next Steps: API Integration

When ready to replace mock data with real API calls:

### 1. Users/Contacts:
```typescript
// Replace mockUsers with:
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('group_id', currentGroupId)
```

### 2. Tasks:
```typescript
// Replace mockTasks with:
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('group_id', currentGroupId)
  .order('due_date', { ascending: true })
```

### 3. Images:
```typescript
// Replace mockImages with:
const { data: images, error } = await supabase
  .from('images')
  .select('*')
  .eq('group_id', currentGroupId)
  .order('created_at', { descending: true })
```

### 4. Add Interactivity:
- Task completion toggle
- Task creation (Plus button)
- Image upload to Supabase storage
- Contact editing
- Task assignment to multiple users

## 📝 Database Setup (SQL)

When ready to create the actual database tables, use the SQL provided in the schema comments:

```sql
-- Create tables in this order:
1. groups
2. users
3. images
4. tasks
5. assigned_tasks
```

See `src/components/db/schema.tsx` comments for full SQL.

## ✨ Features Working:
- ✅ All components render with mock data
- ✅ Type safety with TypeScript
- ✅ Consistent styling with shadcn/ui
- ✅ Proper schema alignment
- ✅ Centralized mock data
- ✅ Helper functions for data access
- ✅ Ready for API integration

## 🚫 Known Limitations (with mock data):
- Checkboxes don't persist state changes
- Plus button doesn't create new tasks
- Image uploads go to Supabase (requires setup)
- No user authentication state
- Tasks don't show assigned user names
- No filtering or sorting

All limitations will be resolved when integrating with real API calls and state management.
