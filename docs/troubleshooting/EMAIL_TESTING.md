# Email Testing Configuration Guide

## Development (Local with Mailpit)
```bash
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@klioso.local"
MAIL_FROM_NAME="${APP_NAME}"
```

## Production (Real SMTP)
```bash
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## Testing Email Configuration

### Development:
1. Ensure Mailpit is running: `http://localhost:8025`
2. Use the Email Test page: `/email-test`
3. All emails will be captured by Mailpit (no real sending)

### Production:
1. Configure real SMTP credentials in `.env`
2. Test with `/email-test` using a real email address
3. Emails will be sent to real recipients

## Environment Detection

The email test system automatically detects the environment:
- **Local**: Shows Mailpit link and captures emails
- **Production**: Sends real emails without Mailpit references

## Security Notes

- Test emails in production are clearly marked as "TEST" 
- Security alerts include "TEST ALERT" prefix
- All test emails log the environment for tracking
