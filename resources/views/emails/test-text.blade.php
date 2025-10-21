KLIOSO - EMAIL TEST
===================

{{ $testData['title'] }}

{{ $testData['message'] }}

Test Details:
- Timestamp: {{ $testData['timestamp'] }}
- Environment: {{ config('app.env') }}
- Mail Driver: {{ config('mail.default') }}

If you can see this email in Mailpit, your email configuration is working correctly!

Visit Mailpit Interface: http://localhost:8025

---
This is a test email from Klioso WordPress Management System
Sent at {{ $testData['timestamp'] }}
