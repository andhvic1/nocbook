'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { LogOut, User, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface NavbarProps {
    sidebarOpen?: boolean
    setSidebarOpen?: (open: boolean) => void
}

export function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
    const { user, signOut } = useAuth()
    const pathname = usePathname()

    // Check if we're in dashboard routes (need sidebar)
    const isDashboardRoute = pathname?.startsWith('/dashboard') ||
        pathname?.startsWith('/people') ||
        pathname?.startsWith('/projects') ||
        pathname?.startsWith('/skills') ||
        pathname?.startsWith('/events') ||
        pathname?.startsWith('/tasks') ||
        pathname?.startsWith('/notes') ||
        pathname?.startsWith('/logs')

    return (
        <nav className="border-b border-border dark:border-border-dark bg-cardBg dark:bg-cardBg-dark sticky top-0 z-50 transition-colors">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Hamburger + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu - Only show in dashboard routes on mobile */}
                        {isDashboardRoute && setSidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10
                  text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}

                        <Link href="/" className="text-xl md:text-2xl font-bold text-primary dark:text-primary-dark">
                            NocBook
                        </Link>
                    </div>

                    {/* Right: Theme Toggle + User Menu */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                                    <User className="w-4 h-4" />
                                    <span className="hidden md:inline truncate max-w-[120px] lg:max-w-[150px]">
                    {user.email}
                  </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={signOut}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">
                                        <span className="hidden sm:inline">Register</span>
                                        <span className="sm:hidden">Sign Up</span>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}