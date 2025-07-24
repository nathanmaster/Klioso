<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function hostingProvider()
    {
        return $this->belongsTo(HostingProvider::class);
    }

    public function dnsProvider()
    {
        return $this->belongsTo(HostingProvider::class, 'dns_provider_id');
    }

    public function emailProvider()
    {
        return $this->belongsTo(HostingProvider::class, 'email_provider_id');
    }

    public function domainRegistrar()
    {
        return $this->belongsTo(HostingProvider::class, 'domain_registrar_id');
    }

    public function plugins()
    {
        return $this->belongsToMany(Plugin::class, 'website_plugin')
            ->withPivot('version', 'is_active')
            ->withTimestamps();
    }
}
