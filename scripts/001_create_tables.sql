-- Table: members (team members identified by email)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: schedule_entries (availability per member per date)
CREATE TABLE IF NOT EXISTS public.schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'indisponivel', 'nao_sei')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, schedule_date)
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

-- Members: everyone can read all members, anyone can insert
CREATE POLICY "members_select_all" ON public.members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update" ON public.members FOR UPDATE USING (true);

-- Schedule entries: everyone can read all, anyone can insert/update/delete
CREATE POLICY "schedule_select_all" ON public.schedule_entries FOR SELECT USING (true);
CREATE POLICY "schedule_insert" ON public.schedule_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_update" ON public.schedule_entries FOR UPDATE USING (true);
CREATE POLICY "schedule_delete" ON public.schedule_entries FOR DELETE USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schedule_entries_member_date ON public.schedule_entries(member_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
