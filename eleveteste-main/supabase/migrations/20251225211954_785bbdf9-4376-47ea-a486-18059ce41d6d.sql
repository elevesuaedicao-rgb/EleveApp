-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'parent', 'teacher');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create parent-student relationships
CREATE TABLE public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time slots (teacher availability)
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings (class appointments)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  topics TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create swap requests
CREATE TABLE public.swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  to_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_path TEXT,
  action_label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's students (for parents)
CREATE OR REPLACE FUNCTION public.get_linked_students(_parent_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT student_id FROM public.parent_student_links
  WHERE parent_id = _parent_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Parents can view linked student profiles" ON public.profiles
  FOR SELECT USING (id IN (SELECT public.get_linked_students(auth.uid())));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for parent_student_links
CREATE POLICY "Parents can view their links" ON public.parent_student_links
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Students can view their parent links" ON public.parent_student_links
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all links" ON public.parent_student_links
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone authenticated can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage subjects" ON public.subjects
  FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for time_slots
CREATE POLICY "Anyone authenticated can view available slots" ON public.time_slots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can manage their own slots" ON public.time_slots
  FOR ALL USING (auth.uid() = teacher_id);

-- RLS Policies for bookings
CREATE POLICY "Students can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all bookings" ON public.bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update bookings" ON public.bookings
  FOR UPDATE USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Parents can view linked student bookings" ON public.bookings
  FOR SELECT USING (student_id IN (SELECT public.get_linked_students(auth.uid())));

-- RLS Policies for swap_requests
CREATE POLICY "Users can view their swap requests" ON public.swap_requests
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can create swap requests" ON public.swap_requests
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Teachers can view all swap requests" ON public.swap_requests
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update swap requests" ON public.swap_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default subjects
INSERT INTO public.subjects (name, color, icon) VALUES
  ('Matemática', '#3B82F6', 'calculator'),
  ('Física', '#8B5CF6', 'atom'),
  ('Química', '#10B981', 'flask'),
  ('Biologia', '#22C55E', 'leaf'),
  ('Português', '#F59E0B', 'book-open'),
  ('História', '#EF4444', 'landmark'),
  ('Geografia', '#06B6D4', 'globe'),
  ('Inglês', '#EC4899', 'languages');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;