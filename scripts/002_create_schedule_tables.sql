-- Table: members_louvor (membros do louvor)
CREATE TABLE IF NOT EXISTS public.members_louvor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: schedule_entries_louvor
CREATE TABLE IF NOT EXISTS public.schedule_entries_louvor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members_louvor(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'indisponivel', 'nao_sei')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, schedule_date)
);

-- Table: members_sonoplastia (membros da sonoplastia)
CREATE TABLE IF NOT EXISTS public.members_sonoplastia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: schedule_entries_sonoplastia
CREATE TABLE IF NOT EXISTS public.schedule_entries_sonoplastia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members_sonoplastia(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'indisponivel', 'nao_sei')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, schedule_date)
);

-- Table: members_midia (membros da midia)
CREATE TABLE IF NOT EXISTS public.members_midia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: schedule_entries_midia
CREATE TABLE IF NOT EXISTS public.schedule_entries_midia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members_midia(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'indisponivel', 'nao_sei')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, schedule_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.members_louvor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries_louvor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members_sonoplastia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries_sonoplastia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members_midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries_midia ENABLE ROW LEVEL SECURITY;

-- RLS policies for members_louvor
CREATE POLICY "members_louvor_select_all" ON public.members_louvor FOR SELECT USING (true);
CREATE POLICY "members_louvor_insert" ON public.members_louvor FOR INSERT WITH CHECK (true);
CREATE POLICY "members_louvor_update" ON public.members_louvor FOR UPDATE USING (true);

-- RLS policies for schedule_entries_louvor
CREATE POLICY "schedule_louvor_select_all" ON public.schedule_entries_louvor FOR SELECT USING (true);
CREATE POLICY "schedule_louvor_insert" ON public.schedule_entries_louvor FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_louvor_update" ON public.schedule_entries_louvor FOR UPDATE USING (true);
CREATE POLICY "schedule_louvor_delete" ON public.schedule_entries_louvor FOR DELETE USING (true);

-- RLS policies for members_sonoplastia
CREATE POLICY "members_sonoplastia_select_all" ON public.members_sonoplastia FOR SELECT USING (true);
CREATE POLICY "members_sonoplastia_insert" ON public.members_sonoplastia FOR INSERT WITH CHECK (true);
CREATE POLICY "members_sonoplastia_update" ON public.members_sonoplastia FOR UPDATE USING (true);

-- RLS policies for schedule_entries_sonoplastia
CREATE POLICY "schedule_sonoplastia_select_all" ON public.schedule_entries_sonoplastia FOR SELECT USING (true);
CREATE POLICY "schedule_sonoplastia_insert" ON public.schedule_entries_sonoplastia FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_sonoplastia_update" ON public.schedule_entries_sonoplastia FOR UPDATE USING (true);
CREATE POLICY "schedule_sonoplastia_delete" ON public.schedule_entries_sonoplastia FOR DELETE USING (true);

-- RLS policies for members_midia
CREATE POLICY "members_midia_select_all" ON public.members_midia FOR SELECT USING (true);
CREATE POLICY "members_midia_insert" ON public.members_midia FOR INSERT WITH CHECK (true);
CREATE POLICY "members_midia_update" ON public.members_midia FOR UPDATE USING (true);

-- RLS policies for schedule_entries_midia
CREATE POLICY "schedule_midia_select_all" ON public.schedule_entries_midia FOR SELECT USING (true);
CREATE POLICY "schedule_midia_insert" ON public.schedule_entries_midia FOR INSERT WITH CHECK (true);
CREATE POLICY "schedule_midia_update" ON public.schedule_entries_midia FOR UPDATE USING (true);
CREATE POLICY "schedule_midia_delete" ON public.schedule_entries_midia FOR DELETE USING (true);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_schedule_louvor_member_date ON public.schedule_entries_louvor(member_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_members_louvor_email ON public.members_louvor(email);

CREATE INDEX IF NOT EXISTS idx_schedule_sonoplastia_member_date ON public.schedule_entries_sonoplastia(member_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_members_sonoplastia_email ON public.members_sonoplastia(email);

CREATE INDEX IF NOT EXISTS idx_schedule_midia_member_date ON public.schedule_entries_midia(member_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_members_midia_email ON public.members_midia(email);
