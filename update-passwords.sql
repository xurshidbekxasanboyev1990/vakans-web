-- Update password hashes with bcrypt
UPDATE users SET password_hash = '$2a$10$3R3QVAovNy41zBsufG2FKOeczb/Ge4XVbH9wHtIVpv6kkqzun7r2S' WHERE phone = '+998996983806';
UPDATE users SET password_hash = '$2a$10$nmo7wh7PpJG9SYpPeJq6.uBe.cDNt9zjcOiFOwUWg7Opei9HvPRl6' WHERE phone = '+998901234567';
UPDATE users SET password_hash = '$2a$10$nI2VwuT5tmqZecV3xFZjIOV0uWY/rKdGYzP8fbZNrKCdLa94xdl7u' WHERE phone = '+998907654321';

-- Verify updates
SELECT phone, first_name, user_type, substring(password_hash, 1, 25) as hash_preview FROM users WHERE phone IN ('+998996983806', '+998901234567', '+998907654321');
