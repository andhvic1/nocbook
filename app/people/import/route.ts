import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

interface ImportRow {
    name: string
    profession?: string
    role?: string
    skills?: string
    tags?: string
    instagram?: string
    whatsapp?: string
    linkedin?: string
    github?: string
    discord?: string
    email?: string
    phone?: string
    twitter?: string
    telegram?: string
    website?: string
    notes?: string
}

interface ImportResult {
    success: number
    failed: number
    duplicates: number
    errors: string[]
    duplicateRecords: any[]
}

// Helper: Validate email format
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Helper: Clean and parse comma-separated values
function parseCommaSeparated(value: string | undefined): string[] | null {
    if (!value || String(value).trim() === '') return null
    return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const skipDuplicates = formData. get('skipDuplicates') === 'true'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(fileBuffer)

        let rows: ImportRow[] = []

        // Parse based on file type
        if (file.name. endsWith('.csv')) {
            const text = buffer.toString('utf-8')
            const parsed = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header. trim(). toLowerCase()
            })
            rows = parsed.data as ImportRow[]
        } else if (file. name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(sheet)

            // Normalize keys to lowercase
            rows = jsonData.map((row: any) => {
                const normalizedRow: any = {}
                Object.keys(row).forEach(key => {
                    normalizedRow[key.trim().toLowerCase()] = row[key]
                })
                return normalizedRow
            }) as ImportRow[]
        } else {
            return NextResponse.json({ error: 'Invalid file format. Only CSV, XLS, XLSX are supported.' }, { status: 400 })
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: 'File is empty or invalid format' }, { status: 400 })
        }

        // Fetch existing people untuk duplicate check
        const { data: existingPeople } = await supabase
            . from('people')
            .select('name, contacts')

        const result: ImportResult = {
            success: 0,
            failed: 0,
            duplicates: 0,
            errors: [],
            duplicateRecords: []
        }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const rowNumber = i + 2 // +2 karena row 1 = header

            // Validate required field
            if (!row.name || String(row.name).trim() === '') {
                result.failed++
                result.errors.push(`Row ${rowNumber}: Name is required`)
                continue
            }

            const name = String(row.name). trim()

            // Validate email if provided
            if (row. email && String(row.email).trim() !== '' && !isValidEmail(String(row.email).trim())) {
                result.failed++
                result.errors.push(`Row ${rowNumber} (${name}): Invalid email format`)
                continue
            }

            // Check duplicates
            const isDuplicate = existingPeople?. some(person => {
                if (person.name. toLowerCase() === name.toLowerCase()) return true

                const contacts = person.contacts as any
                if (contacts && row.phone && contacts.phone === String(row.phone). trim()) return true
                if (contacts && row.email && contacts.email === String(row.email).trim()) return true
                if (contacts && row.whatsapp && contacts.whatsapp === String(row.whatsapp).trim()) return true

                return false
            })

            if (isDuplicate) {
                result.duplicates++
                result.duplicateRecords.push({ row: rowNumber, name })

                if (skipDuplicates) {
                    continue
                }
            }

            // Parse skills and tags
            const skills = parseCommaSeparated(row.skills)
            const tags = parseCommaSeparated(row.tags)

            // Build contacts object
            const contacts: any = {}
            const contactFields = [
                'instagram', 'whatsapp', 'linkedin', 'github', 'discord',
                'email', 'phone', 'twitter', 'telegram', 'website'
            ]

            contactFields. forEach(field => {
                const value = row[field as keyof ImportRow]
                if (value && String(value).trim() !== '') {
                    contacts[field] = String(value). trim()
                }
            })

            // Insert to database
            const { error } = await supabase
                .from('people')
                . insert({
                    user_id: user.id,
                    name,
                    profession: row.profession && String(row.profession).trim() !== '' ? String(row.profession).trim() : null,
                    role: row. role && String(row.role). trim() !== '' ? String(row.role).trim() : null,
                    skills,
                    tags,
                    contacts: Object.keys(contacts).length > 0 ? contacts : null,
                    notes: row.notes && String(row.notes).trim() !== '' ? String(row.notes).trim() : null
                })

            if (error) {
                result.failed++
                result.errors.push(`Row ${rowNumber} (${name}): ${error.message}`)
            } else {
                result. success++
            }
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console. error('Import error:', error)
        return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
    }
}