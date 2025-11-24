import React from 'react'
import type { ButtonProps } from '@/types'

export function Button({
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           children,
                           className = '',
                           disabled,
                           ...props
                       }: ButtonProps) {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-primary text-white hover:opacity-90',
        secondary: 'bg-accent text-text hover:opacity-90',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-primary hover:bg-primary/10'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
            ) : children}
        </button>
    )
}