'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

interface DropdownMenuProps {
    children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10
          text-text-secondary dark:text-text-darkSecondary hover:text-primary dark:hover:text-primary-dark
          transition-colors"
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-cardBg dark:bg-cardBg-dark
          border-2 border-border dark:border-border-dark rounded-lg shadow-lg z-50 py-1">
                    {children}
                </div>
            )}
        </div>
    )
}

interface DropdownItemProps {
    onClick: (e: React.MouseEvent) => void
    icon: React.ReactNode
    label: string
    variant?: 'default' | 'danger'
}

export function DropdownItem({ onClick, icon, label, variant = 'default' }: DropdownItemProps) {
    const colorClass = variant === 'danger'
        ? 'text-red-500 dark:text-red-400 hover:bg-red-500/10'
        : 'text-text dark:text-text-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10'

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick(e)
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${colorClass}`}
        >
            {icon}
            {label}
        </button>
    )
}