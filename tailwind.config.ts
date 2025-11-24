import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--color-background) / <alpha-value>)',
                primary: {
                    DEFAULT: '#2563EB',
                    light: '#60A5FA',
                    dark: '#3B82F6'
                },
                accent: {
                    DEFAULT: '#60A5FA',
                    light: '#93C5FD',
                    dark: '#3B82F6'
                },
                text: {
                    DEFAULT: '#111827',
                    secondary: '#6B7280',
                    dark: '#F1F5F9',
                    darkSecondary: '#94A3B8'
                },
                border: {
                    DEFAULT: '#E5E7EB',
                    dark: '#334155'
                },
                cardBg: {
                    DEFAULT: '#FFFFFF',
                    dark: '#1E293B'
                }
            },
            backgroundColor: {
                background: 'var(--color-background)',
            },
            textColor: {
                text: 'var(--color-text)',
                textSecondary: 'var(--color-text-secondary)',
            },
            borderColor: {
                border: 'var(--color-border)',
            }
        },
    },
    plugins: [],
};

export default config;