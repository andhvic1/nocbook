'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Award,
    Calendar,
    CheckSquare,
    FileText,
    BookOpen,
    X
} from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'People', href: '/people' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: Award, label: 'Skills', href: '/skills' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
    { icon: FileText, label: 'Notes', href: '/notes' },
    { icon: BookOpen, label: 'Logs', href: '/logs' },
]

interface SidebarProps {
    onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname()

    const handleLinkClick = () => {
        if (onClose) {
            onClose()
        }
    }

    return (
        <aside className="w-64 h-full border-r border-border dark:border-border-dark bg-cardBg dark:bg-cardBg-dark flex flex-col transition-colors">
            {/* Mobile Header with Close Button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-border dark:border-border-dark flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary-dark/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary dark:text-primary-dark">N</span>
                    </div>
                    <span className="text-lg font-semibold text-text dark:text-text-dark">Menu</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10
            text-text-secondary dark:text-text-darkSecondary hover:text-primary dark:hover:text-primary-dark transition-colors"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Menu - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                                : 'text-text-secondary dark:text-text-darkSecondary hover:bg-primary/10 dark:hover:bg-primary-dark/10 hover:text-primary dark:hover:text-primary-dark'
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Info - Sticky Bottom */}
            <div className="flex-shrink-0 p-4 border-t border-border dark:border-border-dark bg-cardBg dark:bg-cardBg-dark">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-primary-dark/5">
                    <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary-dark/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary dark:text-primary-dark">N</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text dark:text-text-dark truncate">NocBook v1.0</p>
                        <p className="text-xs text-text-secondary dark:text-text-darkSecondary truncate">Network Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}