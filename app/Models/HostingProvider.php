<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostingProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'website',
        'contact_info',
        'notes',
        'provides_hosting',
        'provides_dns',
        'provides_email',
        'provides_domain_registration',
        'login_url',
    ];

    protected $casts = [
        'provides_hosting' => 'boolean',
        'provides_dns' => 'boolean',
        'provides_email' => 'boolean',
        'provides_domain_registration' => 'boolean',
    ];

    public function websites()
    {
        return $this->hasMany(Website::class);
    }

    // Scope methods for filtering by service type
    public function scopeHostingProviders($query)
    {
        return $query->where('provides_hosting', true);
    }

    public function scopeDnsProviders($query)
    {
        return $query->where('provides_dns', true);
    }

    public function scopeEmailProviders($query)
    {
        return $query->where('provides_email', true);
    }

    public function scopeDomainRegistrars($query)
    {
        return $query->where('provides_domain_registration', true);
    }

    // Helper methods to get service types
    public function getServicesAttribute()
    {
        $services = [];
        if ($this->provides_hosting) $services[] = 'Hosting';
        if ($this->provides_dns) $services[] = 'DNS';
        if ($this->provides_email) $services[] = 'Email';
        if ($this->provides_domain_registration) $services[] = 'Domain Registration';
        return $services;
    }

    public function getServicesStringAttribute()
    {
        return implode(', ', $this->services);
    }
}
