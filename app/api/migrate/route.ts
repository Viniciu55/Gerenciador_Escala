import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: 'Missing Supabase URL or Service Role Key' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Read and execute migrations
    const migrationsDir = path.join(process.cwd(), 'scripts')

    const migrations = [
      '002_create_schedule_tables.sql',
      '003_create_built_schedules.sql',
    ]

    const results = []

    for (const migration of migrations) {
      const filePath = path.join(migrationsDir, migration)

      if (!fs.existsSync(filePath)) {
        results.push({ migration, status: 'error', message: 'File not found' })
        continue
      }

      const sql = fs.readFileSync(filePath, 'utf-8')

      try {
        // Execute the entire SQL file as a single transaction
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({ sql }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'SQL execution failed')
        }

        results.push({ migration, status: 'success' })
      } catch (error) {
        console.error(`Error in ${migration}:`, error)
        results.push({
          migration,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return Response.json({ success: true, results })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
