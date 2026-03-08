@echo off
chcp 65001 >nul
title CS2 Skin Creator - Käynnistys

echo.
echo ========================================
echo 🎨 CS2 Skin Creator - Käynnistys
echo ========================================
echo.

REM Tarkista Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python löytyi! Käynnistetään...
    echo.
    echo 📡 Palvelin: http://localhost:8000
    echo 🌐 Sovellus: http://localhost:8000/index.html
    echo.
    echo 💡 Paina Ctrl+C lopettaaksesi
    echo.
    
    REM Avaa selain
    timeout /t 2 >nul
    start http://localhost:8000/index.html
    
    REM Käynnistä serveri
    python -m http.server 8000
) else (
    echo ⚠️  Python ei ole asennettu
    echo.
    echo Lataa Python: https://www.python.org/downloads/
    echo.
    echo Tai avaa index.html suoraan selaimessa:
    echo.
    pause
    start index.html
)
