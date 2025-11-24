export const themes = {
    blueMinimal: {
        light: {
            background: '#FAFAFA',
            primary: '#2563EB',
            accent: '#60A5FA',
            text: '#111827',
            textSecondary: '#6B7280',
            border: '#E5E7EB',
            cardBg: '#FFFFFF',
        },
        dark: {
            background: '#0F172A',
            primary: '#3B82F6',
            accent: '#93C5FD',
            text: '#F1F5F9',
            textSecondary: '#94A3B8',
            border: '#334155',
            cardBg: '#1E293B',
        }
    }
}

export type ThemeMode = 'light' | 'dark'