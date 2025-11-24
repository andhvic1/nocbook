import { DashboardShell } from '@/components/layout/DashboardShell'

export default function PeopleLayout({
                                         children,
                                     }: {
    children: React.ReactNode
}) {
    return <DashboardShell>{children}</DashboardShell>
}