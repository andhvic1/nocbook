'use client'

import { useState, ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

interface DashboardShellProps {
    children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark">
        <Navbar
            sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    />

    <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
    {sidebarOpen && (
        <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
        onClick={() => setSidebarOpen(false)}
        />
    )}

    {/* Sidebar */}
    <div className={`
          fixed lg:sticky 
          top-0 lg:top-16 
          left-0
          h-screen lg:h-[calc(100vh-4rem)]
          z-[70] lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
    <Sidebar onClose={() => setSidebarOpen(false)} />
    </div>

    {/* Main Content */}
    <main className="flex-1 w-full min-w-0 overflow-x-hidden">
    <div className="p-4 md:p-6 lg:p-8">
        {children}
        </div>
        </main>
        </div>
        </div>
)
}