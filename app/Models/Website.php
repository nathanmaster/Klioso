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
        'domain_name',
        'platform',
        'dns_provider',
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

    public function plugins()
    {
        return $this->belongsToMany(Plugin::class, 'website_plugin')
            ->withPivot('version', 'is_active')
            ->withTimestamps();
    }
}
