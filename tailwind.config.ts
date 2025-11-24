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
                background: 'var(--color-background)',
                primary: 'var(--color-primary)',
                accent: 'var(--color-accent)',
                text: 'var(--color-text)',
                textSecondary: 'var(--color-text-secondary)',
                border: 'var(--color-border)',
                cardBg: 'var(--color-card-bg)',
            },
        },
    },
    plugins: [],
};

export default config;