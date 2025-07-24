# Klioso v0.8.0-beta.1 for Windows/Laragon

## 🚀 Quick Start

1. **Extract** this archive to `C:\laragon\www\klioso`
2. **Run** `install.bat` as Administrator  
3. **Configure** database in `.env` file
4. **Access** via `http://klioso.test` in your browser

## 📋 Requirements

- **PHP**: 8.2+ (Laragon includes PHP 8.3+)
- **Database**: MySQL or SQLite (included with Laragon)
- **Web Server**: Apache or Nginx (included with Laragon)
- **Composer**: For dependency management (optional for this package)

## 🛠️ Laragon Setup

Laragon should auto-configure the site. If you need manual setup:

1. Open Laragon control panel
2. Ensure Apache/Nginx and MySQL are running
3. The site should be available at `http://klioso.test`

## 💾 Database Configuration

### Option 1: MySQL (Recommended)
1. Open HeidiSQL (included with Laragon)
2. Create database: `klioso`
3. Update `.env` file:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=klioso
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### Option 2: SQLite (Simple)
1. Update `.env` file:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=C:\laragon\www\klioso\database\database.sqlite
   ```
2. The install script will create the SQLite file

## 🎉 Features

- **Multi-Service Providers**: Hosting, DNS, email, domain registration
- **WordPress Scanner**: Detect plugins, themes, and security issues
- **Responsive Interface**: Mobile-friendly design
- **Optional Relationships**: Flexible client and provider assignments

## 🔧 Troubleshooting

### Site not loading
- Ensure Laragon is running (green icons)
- Check that the project is in `C:\laragon\www\klioso`
- Try accessing `http://localhost/klioso/public`

### Database errors
- Verify database credentials in `.env`
- Ensure database exists in HeidiSQL
- Run: `php artisan migrate`

### Permission issues
- Run install.bat as Administrator
- Check that storage directories are writable

## 📞 Support

- **GitHub**: https://github.com/nathanmaster/laravel12
- **Issues**: Report bugs via GitHub Issues
- **Documentation**: See `/docs` folder for detailed guides

---

**Klioso v0.8.0-beta.1** - Professional WordPress management made simple.

⚠️ **Beta Warning**: This is a beta release. Backup your data before use!
