-- Table: built_schedules (escalas montadas pelos administradores)
-- Armazena as atribuicoes de membros a funcoes em datas especificas
CREATE TABLE IF NOT EXISTS public.built_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('louvor', 'sonoplastia', 'midia')),
  schedule_date DATE NOT NULL,
  role TEXT NOT NULL,
  member_name TEXT,
  member_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_type, schedule_date, role)
);

ALTER TABLE public.built_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "built_schedules_select_all" ON public.built_schedules FOR SELECT USING (true);
CREATE POLICY "built_schedules_insert" ON public.built_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "built_schedules_update" ON public.built_schedules FOR UPDATE USING (true);
CREATE POLICY "built_schedules_delete" ON public.built_schedules FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_built_schedules_type_date ON public.built_schedules(schedule_type, schedule_date);
