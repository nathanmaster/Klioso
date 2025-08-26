<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $testData['title'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Klioso</div>
        <h1>{{ $testData['title'] }}</h1>
    </div>
    
    <div class="content">
        <div class="message">
            <h2>Email Configuration Test</h2>
            <p>{{ $testData['message'] }}</p>
            
            <p><strong>Test Details:</strong></p>
            <ul>
                <li>Timestamp: {{ $testData['timestamp'] }}</li>
                <li>Environment: {{ config('app.env') }}</li>
                <li>Mail Driver: {{ config('mail.default') }}</li>
            </ul>
            
            <p>If you can see this email in Mailpit, your email configuration is working correctly!</p>
            
            <a href="http://localhost:8025" class="button">Open Mailpit Interface</a>
        </div>
        
        <div class="footer">
            <p>This is a test email from Klioso WordPress Management System</p>
            <p>Sent at {{ $testData['timestamp'] }}</p>
        </div>
    </div>
</body>
</html>
