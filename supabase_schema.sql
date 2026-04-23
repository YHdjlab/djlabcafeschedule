-- Run this in Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'floor' CHECK (role IN ('gm','supervisor_floor','supervisor_bar','floor','bar')),
  phone TEXT,
  telegram_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,
  notes TEXT
);

-- Rush hour config
CREATE TABLE IF NOT EXISTS rush_hour_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_type TEXT NOT NULL CHECK (day_type IN ('weekday','weekend')),
  rush_start TIME NOT NULL DEFAULT '15:00',
  rush_end TIME NOT NULL DEFAULT '21:00',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_starting DATE NOT NULL,
  staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slot_key TEXT NOT NULL,
  slot_label TEXT NOT NULL,
  slot_date DATE NOT NULL,
  available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_starting, staff_id, slot_key)
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  week_starting DATE NOT NULL,
  slot_id TEXT NOT NULL,
  slot_date DATE NOT NULL,
  slot_label TEXT NOT NULL,
  slot_type TEXT CHECK (slot_type IN ('rush','off-rush')),
  start_time TIME,
  end_time TIME,
  supervisor_id UUID REFERENCES profiles(id),
  bar_staff_id UUID REFERENCES profiles(id),
  floor_staff1_id UUID REFERENCES profiles(id),
  floor_staff2_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id)
);

-- Swap requests
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swap_id TEXT NOT NULL,
  staff_a_id UUID REFERENCES profiles(id),
  staff_b_id UUID REFERENCES profiles(id),
  shift_date DATE NOT NULL,
  shift_label TEXT NOT NULL,
  slot_key TEXT,
  status TEXT DEFAULT 'pending_staff_b' CHECK (status IN ('pending_staff_b','pending_supervisor','approved','denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Day off requests
CREATE TABLE IF NOT EXISTS day_off_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  staff_id UUID REFERENCES profiles(id),
  date_off DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending_supervisor' CHECK (status IN ('pending_supervisor','pending_gm','approved','denied')),
  supervisor_approved_at TIMESTAMPTZ,
  gm_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id TEXT NOT NULL,
  staff_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  checkin_time TIME,
  checkin_ts TIMESTAMPTZ,
  checkout_time TIME,
  checkout_ts TIMESTAMPTZ,
  shift_type TEXT CHECK (shift_type IN ('rush','off-rush')),
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','checked_in','checked_out','rejected')),
  attendance_flag TEXT DEFAULT 'on_time' CHECK (attendance_flag IN ('on_time','late','no_show','partial')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fill-in requests
CREATE TABLE IF NOT EXISTS fillin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fillin_id TEXT NOT NULL,
  absent_staff_id UUID REFERENCES profiles(id),
  absence_type TEXT,
  status TEXT DEFAULT 'pending_gm' CHECK (status IN ('pending_gm','broadcasting','filled','denied')),
  volunteer_id UUID REFERENCES profiles(id),
  gm_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed rush hour config
INSERT INTO rush_hour_config (day_type, rush_start, rush_end)
VALUES ('weekday', '15:00', '21:00'), ('weekend', '08:00', '00:00')
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE rush_hour_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE fillin_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated can view availability" ON availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own availability" ON availability FOR ALL TO authenticated USING (auth.uid() = staff_id);

CREATE POLICY "Authenticated can view schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage schedules" ON schedules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('gm','supervisor_floor','supervisor_bar'))
);

CREATE POLICY "Authenticated view swaps" ON swap_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own swaps" ON swap_requests FOR ALL TO authenticated USING (
  auth.uid() = staff_a_id OR auth.uid() = staff_b_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('gm','supervisor_floor','supervisor_bar'))
);

CREATE POLICY "Authenticated view days off" ON day_off_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own days off" ON day_off_requests FOR ALL TO authenticated USING (
  auth.uid() = staff_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('gm','supervisor_floor','supervisor_bar'))
);

CREATE POLICY "Authenticated view attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own attendance" ON attendance FOR ALL TO authenticated USING (
  auth.uid() = staff_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('gm','supervisor_floor','supervisor_bar'))
);

CREATE POLICY "Authenticated view rush config" ON rush_hour_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage rush config" ON rush_hour_config FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('gm','supervisor_floor','supervisor_bar'))
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'floor'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
