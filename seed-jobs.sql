-- Insert test jobs
-- First get employer and category IDs
DO $$
DECLARE
    employer_id UUID;
    worker_id UUID;
    category_id UUID;
BEGIN
    -- Get employer user ID
    SELECT id INTO employer_id FROM users WHERE user_type = 'employer' LIMIT 1;
    -- Get worker user ID  
    SELECT id INTO worker_id FROM users WHERE user_type = 'worker' LIMIT 1;
    -- Get a category ID (or create one if none exists)
    SELECT id INTO category_id FROM categories LIMIT 1;
    
    IF category_id IS NULL THEN
        INSERT INTO categories (name, icon, description) 
        VALUES ('IT va Dasturlash', '💻', 'Dasturlash va IT sohasidagi ishlar')
        RETURNING id INTO category_id;
    END IF;
    
    -- Insert jobs if employer exists
    IF employer_id IS NOT NULL THEN
        INSERT INTO jobs (
            employer_id, category_id, title, description, 
            salary_min, salary_max, salary_type, currency,
            location, region, work_type, status,
            requirements, benefits, deadline
        ) VALUES 
        (
            employer_id, category_id,
            'Frontend Developer',
            'React va TypeScript bo''yicha tajribali dasturchi kerak. Zamonaviy web ilovalarni yaratish.',
            3000000, 5000000, 'monthly', 'UZS',
            'Toshkent, Yunusobod tumani', 'Toshkent shahri',
            'full_time', 'active',
            ARRAY['React', 'TypeScript', '2+ yil tajriba'],
            ARRAY['Yuqori maosh', 'Masofadan ishlash', 'Ingliz tili kurslari'],
            CURRENT_DATE + INTERVAL '30 days'
        ),
        (
            employer_id, category_id,
            'Backend Developer', 
            'Node.js va PostgreSQL bo''yicha tajribali backend dasturchi kerak.',
            4000000, 6000000, 'monthly', 'UZS',
            'Toshkent, Chilonzor tumani', 'Toshkent shahri',
            'full_time', 'active',
            ARRAY['Node.js', 'PostgreSQL', '3+ yil tajriba'],
            ARRAY['Sog''liqni saqlash sug''urtasi', 'Fleksibel ish vaqti'],
            CURRENT_DATE + INTERVAL '45 days'
        ),
        (
            employer_id, category_id,
            'Grafik Dizayner',
            'Kreativ grafik dizayner jamoaga qo''shilish uchun taklif qilinadi.',
            2500000, 4000000, 'monthly', 'UZS',
            'Samarqand shahri', 'Samarqand viloyati',
            'full_time', 'active',
            ARRAY['Adobe Photoshop', 'Illustrator', 'Figma'],
            ARRAY['Ijodiy muhit', 'Professional o''sish'],
            CURRENT_DATE + INTERVAL '20 days'
        );
    END IF;
END $$;

-- Show created jobs
SELECT j.id, j.title, u.first_name as employer, j.status, j.created_at
FROM jobs j
JOIN users u ON j.employer_id = u.id
ORDER BY j.created_at DESC;
