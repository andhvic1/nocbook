'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SkillForm } from '@/components/skills/SkillForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewSkillPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (! authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto mb-4"></div>
                    <p className="text-text-secondary dark:text-text-darkSecondary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/skills"
                    className="p-2 hover:bg-cardBg dark:hover:bg-cardBg-dark rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text dark:text-text-dark" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text dark:text-text-dark">
                        Add New Skill
                    </h1>
                    <p className="text-text-secondary dark:text-text-darkSecondary text-sm mt-1">
                        Track your learning progress and build your skill portfolio
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark rounded-xl p-6 md:p-8">
                <SkillForm />
            </div>

            {/* Tips Card */}
            <div className="bg-blue-500/5 border-2 border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-3 flex items-center gap-2">
                    💡 Tips for Tracking Skills
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary dark:text-text-darkSecondary">
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Be honest with your level</strong> - It helps you set realistic learning goals</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Track practice hours</strong> - Measurable progress is motivating! </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Add learning resources</strong> - Easy reference for future practice</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Update last practiced date</strong> - Stay accountable and avoid skill decay</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary dark:text-primary-dark">•</span>
                        <span><strong>Use featured for portfolio</strong> - Showcase your best skills to employers</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}