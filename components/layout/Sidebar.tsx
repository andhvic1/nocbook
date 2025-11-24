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
    BookOpen
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

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-border bg-cardBg h-[calc(100vh-4rem)] sticky top-16">
        <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                        ? 'bg-primary text-white'
                        : 'text-textSecondary hover:bg-primary/10 hover:text-primary'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                        </Link>
                )
                })}
            </nav>
            </aside>
    )
}