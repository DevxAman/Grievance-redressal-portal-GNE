-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'clerk', 'admin', 'dsw')),
  phone_number TEXT,
  college_roll_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'infrastructure', 'administrative', 'financial', 'other')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'under-review', 'in-progress', 'resolved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  documents TEXT[],
  feedback TEXT
);

CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_rate NUMERIC NOT NULL DEFAULT 0,
  avg_response_time NUMERIC NOT NULL DEFAULT 0,
  grievances_resolved INTEGER NOT NULL DEFAULT 0,
  user_satisfaction NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row-Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only view and update their own profiles
CREATE POLICY "Users can view own profiles" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'dsw')
    )
  );

-- Create policies for grievances table
-- Students can only view and update their own grievances
CREATE POLICY "Users can view own grievances" 
  ON public.grievances FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own grievances" 
  ON public.grievances FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own grievances" 
  ON public.grievances FOR UPDATE 
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins, DSW, and clerks can view and manage all grievances
CREATE POLICY "Staff can view all grievances" 
  ON public.grievances FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

CREATE POLICY "Staff can update all grievances" 
  ON public.grievances FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

-- Create policies for responses table
-- Students can only view responses to their grievances
CREATE POLICY "Users can view responses to their grievances" 
  ON public.responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.grievances WHERE id = grievance_id AND user_id = auth.uid()
    )
  );

-- Staff can add and view all responses
CREATE POLICY "Staff can insert responses" 
  ON public.responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

CREATE POLICY "Staff can view all responses" 
  ON public.responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

-- Create policies for statistics table
-- Everyone can view statistics
CREATE POLICY "Anyone can view statistics" 
  ON public.statistics FOR SELECT 
  USING (true);

-- Only admins can update statistics
CREATE POLICY "Only admins can update statistics" 
  ON public.statistics FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert statistics" 
  ON public.statistics FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically update grievance timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_grievances_updated_at
BEFORE UPDATE ON public.grievances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create initial statistics record
INSERT INTO public.statistics (resolution_rate, avg_response_time, grievances_resolved, user_satisfaction)
VALUES (0, 0, 0, 0);

-- Create function to update statistics when grievances are resolved
CREATE OR REPLACE FUNCTION update_statistics_on_resolution()
RETURNS TRIGGER AS $$
DECLARE
  total_resolved INTEGER;
  total_grievances INTEGER;
  avg_time NUMERIC;
BEGIN
  -- Only proceed if status changed to 'resolved'
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    -- Count total resolved grievances
    SELECT COUNT(*) INTO total_resolved
    FROM public.grievances
    WHERE status = 'resolved';
    
    -- Count total grievances
    SELECT COUNT(*) INTO total_grievances
    FROM public.grievances;
    
    -- Calculate average response time (in days)
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) INTO avg_time
    FROM public.grievances
    WHERE status = 'resolved';
    
    -- Update statistics
    UPDATE public.statistics
    SET 
      resolution_rate = CASE WHEN total_grievances > 0 THEN (total_resolved::NUMERIC / total_grievances) * 100 ELSE 0 END,
      avg_response_time = COALESCE(avg_time, 0),
      grievances_resolved = total_resolved,
      last_updated = now();
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_resolution
AFTER UPDATE ON public.grievances
FOR EACH ROW
EXECUTE FUNCTION update_statistics_on_resolution(); 