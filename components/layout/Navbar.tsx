'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
    const { user, signOut } = useAuth()

    return (
        <nav className="border-b border-border bg-cardBg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        NocBook
                    </Link>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-textSecondary">
                                    <User className="w-4 h-4" />
                                    {user.email}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={signOut}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}