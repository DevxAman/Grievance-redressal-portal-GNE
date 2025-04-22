-- Create users table for auth
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('student', 'clerk', 'dsw', 'admin')) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@gndec.ac.in'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = user_id OR auth.uid() IN (
        SELECT user_id FROM public.users WHERE role IN ('admin', 'dsw')
    ));

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policy for admin to manage all records
CREATE POLICY "Admins can do anything" ON public.users
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create index on user_id and email for faster lookups
CREATE INDEX idx_users_user_id ON public.users(user_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ==========================================
-- Pre-populate with 50 entries (demo data)
-- Uses bcrypt hashed passwords (all set to 'password123')
-- ==========================================

-- 20 Student accounts (S001-S020)
INSERT INTO public.users (user_id, password, role, email, created_at) VALUES
('S001', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('S002', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('S003', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('S004', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('S005', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('S006', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('S007', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('S008', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('S009', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('S010', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student10@gndec.ac.in', NOW() - INTERVAL '21 days'),
('S011', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student11@gndec.ac.in', NOW() - INTERVAL '20 days'),
('S012', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student12@gndec.ac.in', NOW() - INTERVAL '19 days'),
('S013', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student13@gndec.ac.in', NOW() - INTERVAL '18 days'),
('S014', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student14@gndec.ac.in', NOW() - INTERVAL '17 days'),
('S015', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student15@gndec.ac.in', NOW() - INTERVAL '16 days'),
('S016', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student16@gndec.ac.in', NOW() - INTERVAL '15 days'),
('S017', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student17@gndec.ac.in', NOW() - INTERVAL '14 days'),
('S018', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student18@gndec.ac.in', NOW() - INTERVAL '13 days'),
('S019', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student19@gndec.ac.in', NOW() - INTERVAL '12 days'),
('S020', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'student', 'student20@gndec.ac.in', NOW() - INTERVAL '11 days');

-- 15 Clerk accounts (C001-C015)
INSERT INTO public.users (user_id, password, role, email, created_at) VALUES
('C001', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('C002', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('C003', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('C004', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('C005', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('C006', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('C007', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('C008', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('C009', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('C010', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk10@gndec.ac.in', NOW() - INTERVAL '21 days'),
('C011', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk11@gndec.ac.in', NOW() - INTERVAL '20 days'),
('C012', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk12@gndec.ac.in', NOW() - INTERVAL '19 days'),
('C013', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk13@gndec.ac.in', NOW() - INTERVAL '18 days'),
('C014', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk14@gndec.ac.in', NOW() - INTERVAL '17 days'),
('C015', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'clerk', 'clerk15@gndec.ac.in', NOW() - INTERVAL '16 days');

-- 10 DSW accounts (D001-D010)
INSERT INTO public.users (user_id, password, role, email, created_at) VALUES
('D001', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('D002', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('D003', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('D004', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('D005', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('D006', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('D007', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('D008', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('D009', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('D010', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'dsw', 'dsw10@gndec.ac.in', NOW() - INTERVAL '21 days');

-- 5 Admin accounts (A001-A005)
INSERT INTO public.users (user_id, password, role, email, created_at) VALUES
('A001', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'admin', 'admin1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('A002', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'admin', 'admin2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('A003', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'admin', 'admin3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('A004', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'admin', 'admin4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('A005', '$2a$10$hACwQ5/HsryCXpuwL8TnrOUVZtf.AI2iAE.pfxRjtvRgHD5hxJoi.', 'admin', 'admin5@gndec.ac.in', NOW() - INTERVAL '26 days'); 