'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportExportModalProps {
    isOpen: boolean
    onClose: () => void
    onImportSuccess: () => void
}

export function ImportExportModal({ isOpen, onClose, onImportSuccess }: ImportExportModalProps) {
    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)
    const [skipDuplicates, setSkipDuplicates] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx')
    const [exportFilters, setExportFilters] = useState({
        role: '',
        tag: '',
        skill: ''
    })

    if (!isOpen) return null

    const downloadTemplate = () => {
        // Buat template Excel dengan XLSX library
        const headers = [
            'name',
            'profession',
            'role',
            'skills',
            'tags',
            'instagram',
            'whatsapp',
            'linkedin',
            'github',
            'discord',
            'email',
            'phone',
            'twitter',
            'telegram',
            'website',
            'notes'
        ]

        const exampleData = [
            [
                'John Doe',
                'Software Engineer',
                'Friend',
                'Python, JavaScript, IoT',
                'Tech, Developer',
                'johndoe',
                '081234567890',
                'johndoe',
                'johndoe',
                'johndoe#1234',
                'john@example.com',
                '081234567890',
                '@johndoe',
                '@johndoe',
                'https://johndoe.com',
                'Great developer'
            ],
            [
                'Jane Smith',
                'Designer',
                'Colleague',
                'UI/UX, Figma',
                'Design, Creative',
                'janesmith',
                '085678901234',
                'janesmith',
                '',
                '',
                'jane@example.com',
                '085678901234',
                '',
                '',
                'https://janesmith.com',
                'Talented designer'
            ],
            [
                'Ahmad Putra',
                'IoT Engineer',
                'Client',
                'Arduino, Raspberry Pi, Python',
                'Tech, Hardware, IoT',
                'ahmadputra',
                '087654321098',
                'ahmadputra',
                'ahmadputra',
                '',
                'ahmad@example.com',
                '087654321098',
                '',
                'ahmadputra',
                'https://ahmadputra.com',
                'Expert in IoT systems'
            ]
        ]

        // Gabungkan header dan data
        const worksheetData = [headers, ...exampleData]

        // Buat worksheet
        const ws = XLSX.utils.aoa_to_sheet(worksheetData)

        // Set column widths untuk readability
        ws['!cols'] = [
            { wch: 15 }, // name
            { wch: 20 }, // profession
            { wch: 12 }, // role
            { wch: 30 }, // skills
            { wch: 25 }, // tags
            { wch: 15 }, // instagram
            { wch: 15 }, // whatsapp
            { wch: 15 }, // linkedin
            { wch: 15 }, // github
            { wch: 18 }, // discord
            { wch: 25 }, // email
            { wch: 15 }, // phone
            { wch: 15 }, // twitter
            { wch: 15 }, // telegram
            { wch: 25 }, // website
            { wch: 30 }  // notes
        ]

        // Buat workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Import Template')

        // Add instructions sheet
        const instructionsData = [
            ['NocBook Import Template - Instructions'],
            [''],
            ['How to use this template:'],
            ['1. Fill in the data in the "Import Template" sheet'],
            ['2. Required field: name (other fields are optional)'],
            ['3. For skills and tags, separate multiple values with commas (e.g., "Python, JavaScript, IoT")'],
            ['4. Leave cells empty if you don\'t have that information'],
            ['5. Save this file and upload it to NocBook'],
            [''],
            ['Field Descriptions:'],
            ['- name: Full name (Required)'],
            ['- profession: Job title or profession'],
            ['- role: Relationship type (Friend, Colleague, Client, etc.)'],
            ['- skills: Technical or professional skills (comma-separated)'],
            ['- tags: Categories or labels (comma-separated)'],
            ['- instagram: Instagram username (with or without @)'],
            ['- whatsapp: WhatsApp number'],
            ['- linkedin: LinkedIn username or profile URL'],
            ['- github: GitHub username'],
            ['- discord: Discord username with discriminator (e.g., user#1234)'],
            ['- email: Email address'],
            ['- phone: Phone number'],
            ['- twitter: Twitter/X username'],
            ['- telegram: Telegram username'],
            ['- website: Personal or professional website URL'],
            ['- notes: Additional information or notes']
        ]

        const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData)
        wsInstructions['!cols'] = [{ wch: 80 }]

        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions')

        // Download file
        XLSX.writeFile(wb, 'nocbook-import-template.xlsx')
    }

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault()

        const file = fileInputRef.current?.files?.[0]
        if (!file) {
            alert('Please select a file')
            return
        }

        setImporting(true)
        setImportResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('skipDuplicates', skipDuplicates.toString())

            const response = await fetch('/people/import', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Import failed')
            }

            setImportResult(result)

            if (result.success > 0) {
                setTimeout(() => {
                    onImportSuccess()
                    onClose()
                }, 3000)
            }
        } catch (error: any) {
            alert(error.message || 'Import failed')
        } finally {
            setImporting(false)
        }
    }

    const handleExport = async () => {
        setExporting(true)

        try {
            const params = new URLSearchParams({
                format: exportFormat,
                ...(exportFilters.role && { role: exportFilters.role }),
                ...(exportFilters.tag && { tag: exportFilters.tag }),
                ...(exportFilters.skill && { skill: exportFilters.skill })
            })

            const response = await fetch(`/people/export?${params}`)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Export failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `nocbook-people-${Date.now()}.${exportFormat}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            alert('Export successful!')
        } catch (error: any) {
            alert(error.message || 'Export failed')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-cardBg dark:bg-cardBg-dark border-2 border-border dark:border-border-dark
        rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border dark:border-border-dark sticky top-0 bg-cardBg dark:bg-cardBg-dark z-10">
                    <h2 className="text-xl font-bold text-text dark:text-text-dark">
                        Import / Export People
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary-dark/10
              text-text-secondary dark:text-text-darkSecondary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border dark:border-border-dark sticky top-[73px] bg-cardBg dark:bg-cardBg-dark z-10">
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 px-6 py-3 font-medium transition-colors ${
                            activeTab === 'import'
                                ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark'
                                : 'text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark'
                        }`}
                    >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Import
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 px-6 py-3 font-medium transition-colors ${
                            activeTab === 'export'
                                ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark'
                                : 'text-text-secondary dark:text-text-darkSecondary hover:text-text dark:hover:text-text-dark'
                        }`}
                    >
                        <Download className="w-4 h-4 inline mr-2" />
                        Export
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'import' ? (
                        <div className="space-y-6">
                            {/* Template Download */}
                            <div className="bg-blue-500/10 border border-blue-500 dark:border-blue-400 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-text dark:text-text-dark mb-2">
                                            <strong>First time importing?</strong> Download our Excel template with examples and instructions.
                                        </p>
                                        <button
                                            onClick={downloadTemplate}
                                            className="text-sm text-blue-500 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            📥 Download Excel Template (.xlsx)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Import Form */}
                            <form onSubmit={handleImport} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                        Select File (CSV, XLSX, XLS)
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        className="w-full px-4 py-2 rounded-lg border-2 border-border dark:border-border-dark
                      bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:bg-primary dark:file:bg-primary-dark file:text-white file:text-sm file:font-medium
                      file:cursor-pointer hover:file:opacity-90 transition-all"
                                    />
                                    <p className="text-xs text-text-secondary dark:text-text-darkSecondary mt-2">
                                        Supported formats: Excel (.xlsx, .xls) or CSV
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="skipDuplicates"
                                        checked={skipDuplicates}
                                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                                        className="w-4 h-4 text-primary focus:ring-primary rounded border-border dark:border-border-dark"
                                    />
                                    <label htmlFor="skipDuplicates" className="text-sm text-text dark:text-text-dark cursor-pointer">
                                        Skip duplicate entries (based on name, phone, email, WhatsApp)
                                    </label>
                                </div>

                                {/* Import Result */}
                                {importResult && (
                                    <div className="space-y-2 p-4 rounded-lg bg-background dark:bg-background-dark border border-border dark:border-border-dark">
                                        {importResult.success > 0 && (
                                            <div className="flex items-center gap-2 text-green-500 dark:text-green-400 text-sm">
                                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                                <span><strong>{importResult.success}</strong> people imported successfully</span>
                                            </div>
                                        )}
                                        {importResult.duplicates > 0 && (
                                            <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span><strong>{importResult.duplicates}</strong> duplicates {skipDuplicates ? 'skipped' : 'found'}</span>
                                            </div>
                                        )}
                                        {importResult.failed > 0 && (
                                            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span><strong>{importResult.failed}</strong> rows failed</span>
                                            </div>
                                        )}
                                        {importResult.errors.length > 0 && (
                                            <details className="text-xs text-text-secondary dark:text-text-darkSecondary mt-2">
                                                <summary className="cursor-pointer hover:text-primary font-medium">View error details</summary>
                                                <ul className="list-disc list-inside mt-2 space-y-1 max-h-40 overflow-y-auto pl-2">
                                                    {importResult.errors.slice(0, 20).map((error: string, i: number) => (
                                                        <li key={i}>{error}</li>
                                                    ))}
                                                    {importResult.errors.length > 20 && (
                                                        <li className="font-medium">... and {importResult.errors.length - 20} more errors</li>
                                                    )}
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={importing}
                                    disabled={importing}
                                    className="w-full"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {importing ? 'Importing...' : 'Import People'}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Export Options */}
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
                                    Export Format
                                </label>
                                <div className="flex gap-3">
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 cursor-pointer rounded-lg border-2 transition-colors
                    ${exportFormat === 'xlsx'
                      ? 'border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/5'
                      : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                    }">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="xlsx"
                                            checked={exportFormat === 'xlsx'}
                                            onChange={(e) => setExportFormat(e.target.value as 'xlsx')}
                                            className="w-4 h-4 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-text dark:text-text-dark">Excel (.xlsx)</span>
                                    </label>
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 cursor-pointer rounded-lg border-2 transition-colors
                    ${exportFormat === 'csv'
                      ? 'border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/5'
                      : 'border-border dark:border-border-dark hover:border-primary/50 dark:hover:border-primary-dark/50'
                    }">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="csv"
                                            checked={exportFormat === 'csv'}
                                            onChange={(e) => setExportFormat(e.target.value as 'csv')}
                                            className="w-4 h-4 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-text dark:text-text-dark">CSV (.csv)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-background dark:bg-background-dark rounded-lg p-4 space-y-3 border border-border dark:border-border-dark">
                                <h3 className="text-sm font-semibold text-text dark:text-text-dark">
                                    Filter Export (Optional)
                                </h3>
                                <p className="text-xs text-text-secondary dark:text-text-darkSecondary">
                                    Leave empty to export all people
                                </p>

                                <div className="grid gap-3">
                                    <input
                                        type="text"
                                        placeholder="Filter by Role (e.g., Friend)"
                                        value={exportFilters.role}
                                        onChange={(e) => setExportFilters(prev => ({ ...prev, role: e.target.value }))}
                                        className="px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                      bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                      focus:outline-none focus:border-primary dark:focus:border-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Filter by Tag (e.g., Tech)"
                                        value={exportFilters.tag}
                                        onChange={(e) => setExportFilters(prev => ({ ...prev, tag: e.target.value }))}
                                        className="px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                      bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                      focus:outline-none focus:border-primary dark:focus:border-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Filter by Skill (e.g., Python)"
                                        value={exportFilters.skill}
                                        onChange={(e) => setExportFilters(prev => ({ ...prev, skill: e.target.value }))}
                                        className="px-3 py-2 text-sm rounded-lg border-2 border-border dark:border-border-dark
                      bg-cardBg dark:bg-cardBg-dark text-text dark:text-text-dark
                      focus:outline-none focus:border-primary dark:focus:border-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-darkSecondary"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleExport}
                                variant="primary"
                                loading={exporting}
                                disabled={exporting}
                                className="w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {exporting ? 'Exporting...' : 'Export People'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}