@echo off
echo ========================================
echo   Deploy to Server: 77.237.239.235
echo ========================================
echo.

echo [1/3] Git push to GitHub...
git add .
git commit -m "Production config for IP 77.237.239.235"
git push origin main

echo.
echo [2/3] Fayllar GitHub'ga yuklandi!
echo.
echo [3/3] Serverda bajariladigan komandalar:
echo.
echo ========================================
echo SSH orqali serverga kiring:
echo   ssh root@77.237.239.235
echo.
echo Keyin quyidagi komandalarni bajaring:
echo ========================================
echo.
echo   cd /www/wwwroot/vakans-web
echo   git pull origin main
echo   docker-compose -f docker-compose.prod.yml up -d --build
echo   npm install
echo   npm run build
echo.
echo ========================================
echo Tayyor! Saytni tekshiring:
echo   http://77.237.239.235
echo ========================================
pause
