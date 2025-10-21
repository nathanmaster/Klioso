<?php

namespace App\Mail;

use App\Models\Website;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityAlertEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $website;
    public $alertType;
    public $alertData;

    /**
     * Create a new message instance.
     */
    public function __construct(Website $website, string $alertType, array $alertData = [])
    {
        $this->website = $website;
        $this->alertType = $alertType;
        $this->alertData = $alertData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $severity = $this->alertData['severity'] ?? 'medium';
        $subject = match($severity) {
            'critical' => '🚨 CRITICAL Security Alert',
            'high' => '⚠️ HIGH Priority Security Alert',
            'medium' => '⚠️ Security Alert',
            default => 'ℹ️ Security Notification'
        };

        return new Envelope(
            subject: "{$subject} - {$this->website->domain_name}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.security-alert',
            text: 'emails.security-alert-text',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
