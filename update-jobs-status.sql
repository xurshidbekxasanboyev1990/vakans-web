UPDATE jobs SET status = 'active' WHERE status = 'pending';
SELECT id, title, status FROM jobs;
