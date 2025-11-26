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