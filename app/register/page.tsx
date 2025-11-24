'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password)
            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to register')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-cardBg border-2 border-border rounded-xl p-8">
        <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
    <p className="text-textSecondary mb-8">Start managing your network and projects</p>

    <form onSubmit={handleSubmit} className="space-y-4">
    <Input
        type="email"
    label="Email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    />

    <Input
        type="password"
    label="Password"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />

    <Input
        type="password"
    label="Confirm Password"
    placeholder="••••••••"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    />

    {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm">
            {error}
            </div>
    )}

    <Button
        type="submit"
    variant="primary"
    className="w-full"
    loading={loading}
        >
        Create Account
    </Button>
    </form>

    <p className="mt-6 text-center text-textSecondary text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
        Sign in
        </Link>
        </p>
        </div>
        </div>
        </div>
)
}