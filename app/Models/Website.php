<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Website extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
        'client_id',
        'hosting_provider_id',
        'dns_provider_id',
        'email_provider_id',
        'domain_registrar_id',
        'domain_name',
        'platform',
        'status',
        'notes',
        'wordpress_version',
        'last_scan',
        'credential_id',
        'group_id',
    ];

    protected $casts = [
        'last_scan' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function hostingProvider(): BelongsTo
    {
        return $this->belongsTo(HostingProvider::class);
    }

    public function dnsProvider(): BelongsTo
    {
        return $this->belongsTo(HostingProvider::class, 'dns_provider_id');
    }

    public function emailProvider(): BelongsTo
    {
        return $this->belongsTo(HostingProvider::class, 'email_provider_id');
    }

    public function domainRegistrar(): BelongsTo
    {
        return $this->belongsTo(HostingProvider::class, 'domain_registrar_id');
    }

    public function credential(): BelongsTo
    {
        return $this->belongsTo(Credential::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(WebsiteGroup::class, 'group_id');
    }

    public function plugins(): BelongsToMany
    {
        return $this->belongsToMany(Plugin::class, 'website_plugin')
            ->withPivot('version', 'is_active', 'last_updated')
            ->withTimestamps();
    }

    public function scanHistory(): HasMany
    {
        return $this->hasMany(ScanHistory::class);
    }

    public function scheduledScans(): HasMany
    {
        return $this->hasMany(ScheduledScan::class);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'red',
            'maintenance' => 'yellow',
            default => 'gray',
        };
    }

    public function getLatestScanAttribute(): ?ScanHistory
    {
        return $this->scanHistory()->latest()->first();
    }

    public function hasActiveScheduledScan(): bool
    {
        return $this->scheduledScans()->active()->exists();
    }
}
