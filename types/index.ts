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