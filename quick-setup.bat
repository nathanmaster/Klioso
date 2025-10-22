@echo off
echo.
echo ================================================================
echo                    Klioso Quick Setup
echo        WordPress Management System - Optimized Installation
echo ================================================================
echo.

REM Check if we're in the right directory
if not exist "artisan" (
    echo ERROR: artisan file not found. Please run this script from the Klioso root directory.
    pause
    exit /b 1
)

echo [1/6] Installing Composer dependencies...
call composer install
if errorlevel 1 (
    echo ERROR: Composer installation failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Installing NPM dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: NPM installation failed!
    pause
    exit /b 1
)

echo.
echo [3/6] Setting up environment configuration...
if not exist ".env" (
    copy ".env.example" ".env"
    echo Environment file created from .env.example
) else (
    echo Environment file already exists
)

echo.
echo [4/6] Generating application key...
php artisan key:generate

echo.
echo [5/6] Setting up database with optimized schema...
echo Choose installation type:
echo 1. Fresh installation (Recommended - Fast, clean setup)
echo 2. Incremental installation (For existing installations)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo Running fresh installation...
    php artisan klioso:install --fresh --force
) else if "%choice%"=="2" (
    echo Running incremental installation...
    php artisan klioso:install
) else (
    echo Invalid choice. Using fresh installation as default...
    php artisan klioso:install --fresh --force
)

if errorlevel 1 (
    echo ERROR: Database setup failed!
    echo.
    echo Common solutions:
    echo - Check your database connection in .env file
    echo - Ensure your database server is running
    echo - Verify database credentials
    pause
    exit /b 1
)

echo.
echo [6/6] Building frontend assets...
call npm run build
if errorlevel 1 (
    echo WARNING: Frontend build failed, but installation can continue
    echo You may need to run 'npm run dev' for development
)

echo.
echo ================================================================
echo                    🎉 Setup Complete! 🎉
echo ================================================================
echo.
echo ✅ Klioso has been successfully installed!
echo.
echo Next steps:
echo 1. Configure your .env file with:
echo    - Database connection details
echo    - WPScan API key (for security scanning)
echo    - Mail configuration (optional)
echo.
echo 2. Start the development server:
echo    php artisan serve
echo.
echo 3. Visit: http://localhost:8000
echo.
echo 📚 Documentation available in docs/ folder
echo 🔧 For production setup, see docs/setup/COMPLETE_INSTALLATION_GUIDE.md
echo.
echo Press any key to start the development server...
pause > nul

echo Starting Klioso development server...
echo Visit: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
php artisan serve --host=0.0.0.0 --port=8000