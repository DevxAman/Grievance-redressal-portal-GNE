-- SQL Script to insert users into the database
-- This script adds all the users with their appropriate roles and passwords

-- Insert all users with their specific roles
INSERT INTO public.users (id, user_id, email, name, role, phone_number, created_at, password) VALUES
-- Student entries
(124, 'amit_k12', 'amitkumar1234@gndec.ac.in', 'Amit Kumar', 'student', '9876543124', '2025-04-23 11:00:00', '$2b$10$studentPwd123'),
(125, 'neha_s7', 'nehasharma1234@gndec.ac.in', 'Neha Sharma', 'student', '9876543125', '2025-04-23 11:01:00', '$2b$10$studentPwd123'),
(127, 'priya_j5', 'priyajain1234@gndec.ac.in', 'Priya Jain', 'student', '9876543127', '2025-04-23 11:03:00', '$2b$10$studentPwd123'),
(128, 'ravi_p3', 'ravipandey1234@gndec.ac.in', 'Ravi Pandey', 'student', '9876543128', '2025-04-23 11:04:00', '$2b$10$studentPwd123'),
(130, 'rajesh_t4', 'rajeshtiwari1234@gndec.ac.in', 'Rajesh Tiwari', 'student', '9876543130', '2025-04-23 11:06:00', '$2b$10$studentPwd123'),
(132, 'suresh_k2', 'sureshkumar1234@gndec.ac.in', 'Suresh Kumar', 'student', '9876543132', '2025-04-23 11:08:00', '$2b$10$studentPwd123'),
(134, 'deepak_b7', 'deepakbhatia1234@gndec.ac.in', 'Deepak Bhatia', 'student', '9876543134', '2025-04-23 11:10:00', '$2b$10$studentPwd123'),
(135, 'kavita_h3', 'kavitahooda1234@gndec.ac.in', 'Kavita Hooda', 'student', '9876543135', '2025-04-23 11:11:00', '$2b$10$studentPwd123'),
(137, 'lata_p8', 'latapatel1234@gndec.ac.in', 'Lata Patel', 'student', '9876543137', '2025-04-23 11:13:00', '$2b$10$studentPwd123'),
(139, 'poonam_j1', 'poonamjha1234@gndec.ac.in', 'Poonam Jha', 'student', '9876543139', '2025-04-23 11:15:00', '$2b$10$studentPwd123'),
(140, 'rahul_n4', 'rahulnagar1234@gndec.ac.in', 'Rahul Nagar', 'student', '9876543140', '2025-04-23 11:16:00', '$2b$10$studentPwd123'),
(142, 'gopal_t2', 'gopalthakur1234@gndec.ac.in', 'Gopal Thakur', 'student', '9876543142', '2025-04-23 11:18:00', '$2b$10$studentPwd123'),
(144, 'rakesh_d3', 'rakeshdas1234@gndec.ac.in', 'Rakesh Das', 'student', '9876543144', '2025-04-23 11:20:00', '$2b$10$studentPwd123'),
(146, 'mohan_s8', 'mohansharma1234@gndec.ac.in', 'Mohan Sharma', 'student', '9876543146', '2025-04-23 11:22:00', '$2b$10$studentPwd123'),
(147, 'ritu_g4', 'ritugupta1234@gndec.ac.in', 'Ritu Gupta', 'student', '9876543147', '2025-04-23 11:23:00', '$2b$10$studentPwd123'),
(149, 'nisha_r1', 'nisharai1234@gndec.ac.in', 'Nisha Rai', 'student', '9876543149', '2025-04-23 11:25:00', '$2b$10$studentPwd123'),
(151, 'jyoti_m2', 'jyotimishra1234@gndec.ac.in', 'Jyoti Mishra', 'student', '9876543151', '2025-04-23 11:27:00', '$2b$10$studentPwd123'),
(153, 'shweta_p3', 'shwetapandey1234@gndec.ac.in', 'Shweta Pandey', 'student', '9876543153', '2025-04-23 11:29:00', '$2b$10$studentPwd123'),
(155, 'neelam_j8', 'neelamjain1234@gndec.ac.in', 'Neelam Jain', 'student', '9876543155', '2025-04-23 11:31:00', '$2b$10$studentPwd123'),
(156, 'ajay_d4', 'ajaydas1234@gndec.ac.in', 'Ajay Das', 'student', '9876543156', '2025-04-23 11:32:00', '$2b$10$studentPwd123'),
(158, 'sumit_t1', 'sumittiwari1234@gndec.ac.in', 'Sumit Tiwari', 'student', '9876543158', '2025-04-23 11:34:00', '$2b$10$studentPwd123'),
(160, 'ravi_g2', 'ravigupta1234@gndec.ac.in', 'Ravi Gupta', 'student', '9876543160', '2025-04-23 11:36:00', '$2b$10$studentPwd123'),
(162, 'arjun_s3', 'arjunsingh1234@gndec.ac.in', 'Arjun Singh', 'student', '9876543162', '2025-04-23 11:38:00', '$2b$10$studentPwd123'),
(163, 'lata_m5', 'latamishra1234@gndec.ac.in', 'Lata Mishra', 'student', '9876543163', '2025-04-23 11:39:00', '$2b$10$studentPwd123'),
(165, 'sonia_d4', 'soniadas1234@gndec.ac.in', 'Sonia Das', 'student', '9876543165', '2025-04-23 11:41:00', '$2b$10$studentPwd123'),
(167, 'anita_j1', 'anitajain1234@gndec.ac.in', 'Anita Jain', 'student', '9876543167', '2025-04-23 11:43:00', '$2b$10$studentPwd123'),

-- Clerk entries
(126, 'vikas_g9', 'vikasgupta1234@gndec.ac.in', 'Vikas Gupta', 'clerk', '9876543126', '2025-04-23 11:02:00', '$2b$10$clerkPwd456'),
(133, 'meena_d9', 'meenadas1234@gndec.ac.in', 'Meena Das', 'clerk', '9876543133', '2025-04-23 11:09:00', '$2b$10$clerkPwd456'),
(138, 'vikram_s6', 'vikramsingh1234@gndec.ac.in', 'Vikram Singh', 'clerk', '9876543138', '2025-04-23 11:14:00', '$2b$10$clerkPwd456'),
(143, 'sunita_m7', 'sunitamodi1234@gndec.ac.in', 'Sunita Modi', 'clerk', '9876543143', '2025-04-23 11:19:00', '$2b$10$clerkPwd456'),
(148, 'sanjay_b6', 'sanjaybhat1234@gndec.ac.in', 'Sanjay Bhat', 'clerk', '9876543148', '2025-04-23 11:24:00', '$2b$10$clerkPwd456'),
(154, 'rohit_s5', 'rohitsingh1234@gndec.ac.in', 'Rohit Singh', 'clerk', '9876543154', '2025-04-23 11:30:00', '$2b$10$clerkPwd456'),
(159, 'poonam_k9', 'poonamkapoor1234@gndec.ac.in', 'Poonam Kapoor', 'clerk', '9876543159', '2025-04-23 11:35:00', '$2b$10$clerkPwd456'),
(164, 'vikram_k8', 'vikramkumar1234@gndec.ac.in', 'Vikram Kumar', 'clerk', '9876543164', '2025-04-23 11:40:00', '$2b$10$clerkPwd456'),

-- DSW entries
(129, 'sonia_r8', 'soniarao1234@gndec.ac.in', 'Sonia Rao', 'dsw', '9876543129', '2025-04-23 11:05:00', '$2b$10$dswPwd789'),
(136, 'arun_l5', 'arunlal1234@gndec.ac.in', 'Arun Lal', 'dsw', '9876543136', '2025-04-23 11:12:00', '$2b$10$dswPwd789'),
(145, 'anju_p5', 'anjupatel1234@gndec.ac.in', 'Anju Patel', 'dsw', '9876543145', '2025-04-23 11:21:00', '$2b$10$dswPwd789'),
(152, 'anil_k7', 'anilkumar1234@gndec.ac.in', 'Anil Kumar', 'dsw', '9876543152', '2025-04-23 11:28:00', '$2b$10$dswPwd789'),
(161, 'megha_p7', 'meghapandey1234@gndec.ac.in', 'Megha Pandey', 'dsw', '9876543161', '2025-04-23 11:37:00', '$2b$10$dswPwd789'),
(168, 'suresh_p9', 'sureshpandey1234@gndec.ac.in', 'Suresh Pandey', 'dsw', '9876543168', '2025-04-23 11:44:00', '$2b$10$dswPwd789'),

-- Admin entries
(131, 'anita_m6', 'anitamishra1234@gndec.ac.in', 'Anita Mishra', 'admin', '9876543131', '2025-04-23 11:07:00', '$2b$10$adminPwd000'),
(141, 'seema_k9', 'seemakapoor1234@gndec.ac.in', 'Seema Kapoor', 'admin', '9876543141', '2025-04-23 11:17:00', '$2b$10$adminPwd000'),
(150, 'vikas_t9', 'vikastiwari1234@gndec.ac.in', 'Vikas Tiwari', 'admin', '9876543150', '2025-04-23 11:26:00', '$2b$10$adminPwd000'),
(157, 'kajal_r6', 'kajalrao1234@gndec.ac.in', 'Kajal Rao', 'admin', '9876543157', '2025-04-23 11:33:00', '$2b$10$adminPwd000'),
(166, 'rahul_t6', 'rahultiwari1234@gndec.ac.in', 'Rahul Tiwari', 'admin', '9876543166', '2025-04-23 11:42:00', '$2b$10$adminPwd000');

-- Verify the insertions
SELECT id, user_id, email, name, role, phone_number, created_at 
FROM public.users 
WHERE id BETWEEN 124 AND 168 
ORDER BY id; 