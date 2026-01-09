@echo off
REM ====================================
REM PRODUCTION DEPLOYMENT SCRIPT (Windows)
REM Works.uz Job Platform
REM ====================================

echo ========================================
echo   PRODUCTION DEPLOYMENT
echo   Works.uz Job Platform
echo ========================================
echo.

REM ====================================
REM 1. CHECK PREREQUISITES
REM ====================================
echo [1/10] Checking prerequisites...

where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Supabase CLI not installed
    echo Install it: npm install -g supabase
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not installed
    pause
    exit /b 1
)

echo [OK] All prerequisites met
echo.

REM ====================================
REM 2. SUPABASE LOGIN
REM ====================================
echo [2/10] Connecting to Supabase...

supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please login to Supabase:
    supabase login
)

echo.
set /p PROJECT_REF="Enter your Supabase project ref: "

if "%PROJECT_REF%"=="" (
    echo [ERROR] Project ref required
    pause
    exit /b 1
)

supabase link --project-ref %PROJECT_REF%

echo [OK] Connected to Supabase
echo.

REM ====================================
REM 3. DATABASE MIGRATION
REM ====================================
echo [3/10] Running database migrations...

if exist "supabase\migrations" (
    supabase db push
    echo [OK] Database migrations complete
) else (
    echo [WARNING] No migrations found
)

echo.

REM ====================================
REM 4. SET SECRETS FROM .ENV
REM ====================================
echo [4/10] Setting Supabase secrets...

REM Read JWT secrets
for /f "tokens=2 delims==" %%a in ('findstr "^JWT_SECRET=" .env') do set JWT_SECRET=%%a
for /f "tokens=2 delims==" %%a in ('findstr "^JWT_REFRESH_SECRET=" .env') do set JWT_REFRESH_SECRET=%%a
for /f "tokens=2 delims==" %%a in ('findstr "^ALLOWED_ORIGINS=" .env') do set ALLOWED_ORIGINS=%%a

REM Set secrets
supabase secrets set JWT_SECRET="%JWT_SECRET%"
supabase secrets set JWT_REFRESH_SECRET="%JWT_REFRESH_SECRET%"
supabase secrets set ALLOWED_ORIGINS="%ALLOWED_ORIGINS%"

REM SMS Secrets (optional)
for /f "tokens=2 delims==" %%a in ('findstr "^ESKIZ_EMAIL=" .env') do set ESKIZ_EMAIL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "^ESKIZ_PASSWORD=" .env') do set ESKIZ_PASSWORD=%%a
for /f "tokens=2 delims==" %%a in ('findstr "^ESKIZ_FROM=" .env') do set ESKIZ_FROM=%%a

if not "%ESKIZ_EMAIL%"=="" (
    supabase secrets set ESKIZ_EMAIL="%ESKIZ_EMAIL%"
    supabase secrets set ESKIZ_PASSWORD="%ESKIZ_PASSWORD%"
    supabase secrets set ESKIZ_FROM="%ESKIZ_FROM%"
    supabase secrets set SMS_TEST_MODE="false"
    supabase secrets set OTP_EXPIRY_MINUTES="5"
    supabase secrets set OTP_LENGTH="6"
    echo [OK] SMS secrets configured
) else (
    echo [WARNING] SMS secrets not configured (test mode)
)

echo [OK] Secrets configured
echo.

REM ====================================
REM 5. DEPLOY BACKEND
REM ====================================
echo [5/10] Deploying backend function...

supabase functions deploy server

echo [OK] Backend deployed
echo.

REM ====================================
REM 6. ENABLE REALTIME
REM ====================================
echo [6/10] Enable Realtime...
echo.
echo Please enable Realtime in Supabase Dashboard:
echo 1. Go to Database -^> Replication
echo 2. Enable 'messages' table
echo 3. Enable 'conversations' table
echo.
echo Or run this SQL in SQL Editor:
echo.
echo ALTER PUBLICATION supabase_realtime ADD TABLE messages;
echo ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
echo.
pause

echo [OK] Realtime setup complete
echo.

REM ====================================
REM 7. BUILD FRONTEND
REM ====================================
echo [7/10] Building frontend...

call npm install
call npm run build

echo [OK] Frontend built
echo.

REM ====================================
REM 8. FRONTEND DEPLOYMENT
REM ====================================
echo [8/10] Frontend deployment...
echo.
echo Choose deployment platform:
echo 1. Vercel (recommended)
echo 2. Netlify
echo 3. Skip (deploy manually)
echo.
set /p DEPLOY_CHOICE="Choose (1-3): "

if "%DEPLOY_CHOICE%"=="1" (
    where vercel >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        vercel --prod
        echo [OK] Deployed to Vercel
    ) else (
        echo [INFO] Install Vercel CLI: npm install -g vercel
        echo Then run: vercel --prod
    )
)

if "%DEPLOY_CHOICE%"=="2" (
    where netlify >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        netlify deploy --prod
        echo [OK] Deployed to Netlify
    ) else (
        echo [INFO] Install Netlify CLI: npm install -g netlify-cli
        echo Then run: netlify deploy --prod
    )
)

if "%DEPLOY_CHOICE%"=="3" (
    echo [INFO] Skipping frontend deployment
)

echo.

REM ====================================
REM 9. TEST DEPLOYMENT
REM ====================================
echo [9/10] Testing deployment...

set SUPABASE_URL=https://%PROJECT_REF%.supabase.co

echo Testing backend health endpoint...
curl -s "%SUPABASE_URL%/functions/v1/make-server-5b47a45d/health"

echo.
echo [OK] Backend test complete
echo.

REM ====================================
REM 10. COMPLETE
REM ====================================
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Update .env with production URLs:
echo    VITE_SUPABASE_URL=%SUPABASE_URL%
echo.
echo 2. Get Anon Key from Supabase Dashboard:
echo    Settings -^> API -^> anon public key
echo.
echo 3. Test the application:
echo    - Register new user
echo    - Login
echo    - Post a job
echo    - Send message (real-time chat)
echo    - Verify phone (SMS)
echo.
echo 4. Update CORS for production:
echo    supabase secrets set ALLOWED_ORIGINS="https://your-domain.com"
echo.
echo Documentation: See READY_TO_DEPLOY.md
echo.
echo ========================================
echo Happy deploying!
echo ========================================
echo.
pause
