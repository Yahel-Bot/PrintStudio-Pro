@echo off
REM PrintStudio Pro - Automatic Setup Script
REM This script installs all required Python dependencies

setlocal enabledelayedexpansion

echo.
echo ============================================
echo PrintStudio Pro - Setup Script
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8 or higher from:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During installation, check "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [OK] Python is installed
python --version
echo.

REM Install required Python packages
echo Installing required Python packages...
echo This may take a few minutes...
echo.

pip install --upgrade pip

echo [1/4] Installing comtypes...
pip install comtypes
if %errorlevel% neq 0 goto :error

echo [2/4] Installing PyMuPDF...
pip install PyMuPDF
if %errorlevel% neq 0 goto :error

echo [3/4] Installing opencv-python...
pip install opencv-python
if %errorlevel% neq 0 goto :error

echo [4/4] Installing numpy...
pip install numpy
if %errorlevel% neq 0 goto :error

echo.
echo ============================================
echo [SUCCESS] All dependencies installed!
echo ============================================
echo.
echo You can now run PrintStudio Pro
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] Failed to install dependencies
echo Please check your internet connection and try again
echo.
pause
exit /b 1
