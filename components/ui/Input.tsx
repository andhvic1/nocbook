import React from 'react'
import type { InputProps } from '@/types'

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2 text-text">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-text 
          focus:outline-none focus:border-primary transition-colors
          ${error ? 'border-red-500' : ''}
          ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}