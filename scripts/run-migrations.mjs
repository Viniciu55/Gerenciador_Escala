import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrations = [
    '002_create_schedule_tables.sql',
    '003_create_built_schedules.sql',
  ];

  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration);
    if (!fs.existsSync(filePath)) {
      console.error(`Migration file not found: ${filePath}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`Running migration: ${migration}`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => {
        // If exec_sql doesn't exist, try direct SQL execution through query
        return supabase.query(sql);
      });

      if (error) {
        console.error(`Error running ${migration}:`, error);
      } else {
        console.log(`✓ ${migration} completed`);
      }
    } catch (err) {
      console.error(`Exception running ${migration}:`, err);
    }
  }
}

runMigrations().then(() => {
  console.log('All migrations completed');
  process.exit(0);
}).catch((err) => {
  console.error('Migration process failed:', err);
  process.exit(1);
});
