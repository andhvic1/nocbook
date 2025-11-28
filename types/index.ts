export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export type Theme = 'light' | 'dark';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

// People Fiture
export interface Person {
    id: string
    user_id: string
    name: string
    profession?: string
    skills?: string[]
    role?: string
    tags?: string[]
    contacts?: {
        instagram?: string
        whatsapp?: string
        linkedin?: string
        github?: string
        discord?: string
        email?: string
        phone?: string
        twitter?: string
        telegram?: string
        website?: string
    }
    notes?: string
    created_at: string
    updated_at: string
}

export interface PersonFormData {
    name: string
    profession: string
    skills: string[]
    role: string
    tags: string[]
    contacts: {
        instagram: string
        whatsapp: string
        linkedin: string
        github: string
        discord: string
        email: string
        phone: string
        twitter: string
        telegram: string
        website: string
    }
    notes: string
}

// Projects Feature
// Add to your existing types/index.ts

export type ProjectCategory =
    'school' | 'competition' | 'personal' | 'client' | 'startup' | 'web' | 'iot' | 'ai' | 'mobile' | 'api'

export type ProjectStatus =
    'idea' | 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'

export type ProjectPriority =
    'low' | 'medium' | 'high' | 'urgent'

export interface Project {
    id: string
    user_id: string
    title: string
    description?: string
    category: ProjectCategory
    status: ProjectStatus
    progress: number
    deadline?: string
    start_date?: string
    completed_at?: string
    priority: ProjectPriority
    tags?: string[]
    tech_stack?: string[]
    github_url?: string
    demo_url?: string
    notes?: string
    team_members?: string[]
    created_at: string
    updated_at: string
}

//Skills Feature
export type SkillCategory = 'web' | 'mobile' | 'iot' | 'ai' | 'devops' | 'data' | 'embedded' | 'design' | 'soft-skill'

export type SkillType = 'language' | 'framework' | 'library' | 'tool' | 'platform' | 'hardware' | 'soft-skill'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type SkillDifficulty = 'easy' | 'medium' | 'hard' | 'insane'

export interface SkillResource {
    title: string
    url: string
    type: 'youtube' | 'course' | 'documentation' | 'article' | 'book' | 'other'
    completed?: boolean
}

export interface Skill {
    id: string
    user_id: string
    name: string
    category: SkillCategory
    skill_type: SkillType
    level: SkillLevel
    difficulty: SkillDifficulty
    progress: number
    practice_hours: number
    description?: string
    icon_url?: string
    resources?: SkillResource[]
    projects_count: number
    learning_since?: string
    last_practiced?: string
    notes?: string
    tags?: string[]
    is_featured: boolean
    created_at: string
    updated_at: string
}

// Event Feature
export type EventType = 'seminar' | 'workshop' | 'competition' | 'meetup' | 'conference'

export type MaterialType = 'pdf' | 'slides' | 'video' | 'notes' | 'link'

export interface EventMaterial {
    id: string
    event_id: string
    title: string
    url?: string
    type: MaterialType
    created_at: string
}

export interface Event {
    id: string
    user_id: string
    name: string
    event_type: EventType
    venue?: string
    certificate_url?: string
    cost: number
    organizer?: string
    important_insights?: string[]
    start_date?: string
    end_date?: string
    start_time?: string  // NEW
    end_time?: string    // NEW
    is_online: boolean   // NEW
    meeting_url?: string // NEW
    registration_url?: string // NEW
    event_info_url?: string   // NEW
    tags?: string[]
    notes?: string
    is_featured: boolean
    created_at: string
    updated_at: string
}

// Task Feature
export type TaskCategory = 'school' | 'content' | 'project' | 'personal' | 'learning' | 'work' | 'health' | 'other'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 'not-started' | 'in-progress' | 'done' | 'blocked' | 'cancelled'

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Task {
    id: string
    user_id: string
    title: string
    description?: string
    notes?: string
    category: TaskCategory
    priority: TaskPriority
    status: TaskStatus
    due_date?: string
    due_time?: string
    estimated_time?: number // in minutes
    actual_time_spent: number // in minutes
    progress: number // 0-100
    skill_id?: string
    project_id?: string
    event_id?: string
    is_recurring: boolean
    recurrence_pattern?: RecurrencePattern
    recurrence_end_date?: string
    parent_recurring_task_id?: string
    tags?: string[]
    attachments?: string[]
    is_featured: boolean
    completed_at?: string
    created_at: string
    updated_at: string
}

export interface Subtask {
    id: string
    task_id: string
    title: string
    is_completed: boolean
    order_index: number
    created_at: string
}

export interface TaskTimeLog {
    id: string
    task_id: string
    user_id: string
    duration: number // in minutes
    started_at: string
    ended_at?: string
    notes?: string
    created_at: string
}

// Task with relations
export interface TaskWithRelations extends Task {
    subtasks?: Subtask[]
    skill?: Skill
    project?: Project
    event?: Event
    time_logs?: TaskTimeLog[]
    subtasks_completed?: number
    subtasks_total?: number
}