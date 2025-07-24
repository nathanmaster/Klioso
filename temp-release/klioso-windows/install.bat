@echo off
echo 🪟 Klioso Windows Installation

echo Setting up environment...
if not exist .env copy .env.example .env

echo Generating application key...
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan key:generate --force

echo Running database migrations...
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan migrate --force

echo Optimizing application...
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan config:cache
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan route:cache
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan view:cache

echo ✅ Installation complete!
echo Configure your web server to point to the 'public' directory.
echo For Laragon, this should work automatically at http://klioso.test
pause
