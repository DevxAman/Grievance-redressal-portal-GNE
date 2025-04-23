-- SQL Script to update users in the database
-- This script ensures each user has the correct role based on the provided data

-- First, let's update student entries
UPDATE public.users 
SET role = 'student', 
    password = '$2b$10$studentPassword123' 
WHERE id IN (124, 125, 127, 128, 130, 132, 134, 135, 137, 139, 140, 142, 144, 146, 147, 149, 151, 153, 155, 156, 158, 160, 162, 163, 165, 167);

-- Update clerk entries
UPDATE public.users 
SET role = 'clerk', 
    password = '$2b$10$clerkPassword456' 
WHERE id IN (126, 133, 138, 143, 148, 154, 159, 164);

-- Update DSW entries
UPDATE public.users 
SET role = 'dsw', 
    password = '$2b$10$dswPassword789' 
WHERE id IN (129, 136, 145, 152, 161, 168);

-- Update admin entries
UPDATE public.users 
SET role = 'admin', 
    password = '$2b$10$adminPassword000' 
WHERE id IN (131, 141, 150, 157, 166);

-- Verify the changes
SELECT id, user_id, email, name, role, phone_number, created_at 
FROM public.users 
WHERE id BETWEEN 124 AND 168 
ORDER BY id; 