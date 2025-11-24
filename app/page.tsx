import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Users, FolderKanban, Award, Calendar } from 'lucide-react'

export default function Home() {
    const features = [
        {
            icon: Users,
            title: 'People Database',
            description: 'Manage your network with detailed contact information and skills tracking'
        },
        {
            icon: FolderKanban,
            title: 'Project Tracker',
            description: 'Track your personal and professional projects with progress monitoring'
        },
        {
            icon: Award,
            title: 'Skill Progress',
            description: 'Monitor your learning journey and skill development over time'
        },
        {
            icon: Calendar,
            title: 'Events & Activities',
            description: 'Log workshops, seminars, and networking events for future reference'
        }
    ]

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-text mb-6">
                        Welcome to <span className="text-primary">NocBook</span>
                    </h1>
                    <p className="text-xl text-textSecondary mb-8 max-w-2xl mx-auto">
                        Your personal hub for managing networks, projects, skills, and daily activities.
                        Everything you need to track your professional growth in one place.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/register">
                            <Button variant="primary" size="lg">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold text-center text-text mb-12">
                    Powerful Features
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={feature.title}
                                className="p-6 rounded-xl border-2 border-border bg-cardBg hover:border-primary transition-colors"
                            >
                                <Icon className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold text-text mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-textSecondary">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}