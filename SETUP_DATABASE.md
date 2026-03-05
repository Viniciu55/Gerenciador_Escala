# Database Setup Instructions

This project requires Supabase to be properly configured with database tables. Follow these steps:

## Step 1: Set Environment Variables

Add the following environment variables to your Vercel project settings or `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase dashboard:
- Go to Settings > API
- Copy the Project URL and Anon Key for the NEXT_PUBLIC variables
- Copy the Service Role key for the SUPABASE_SERVICE_ROLE_KEY

## Step 2: Create Database Tables

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run each of these scripts in order:

**File 1: scripts/002_create_schedule_tables.sql**
Copy and paste the entire contents of this file into the SQL editor and run it.

**File 2: scripts/003_create_built_schedules.sql**
Copy and paste the entire contents of this file into the SQL editor and run it.

### Option B: Using the Migration API

Once environment variables are set, visit: `http://localhost:3000/api/migrate`

## Verify Setup

Once tables are created, your application should:
1. No longer show "table not found" errors
2. Allow users to register in the schedule system
3. Display member lists and schedule entries properly

## Troubleshooting

If you see "Could not find the table" errors:
- Verify environment variables are set correctly
- Ensure you ran the SQL scripts
- Check that RLS (Row Level Security) is enabled on all tables

If you need to reset:
1. Go to Supabase dashboard
2. Delete the tables manually
3. Re-run the SQL scripts
