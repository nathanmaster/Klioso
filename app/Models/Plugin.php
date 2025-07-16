<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plugin extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_paid',
        'purchase_url',
        'install_source',
    ];

    public function websites()
    {
        return $this->belongsToMany(Website::class, 'website_plugin')
            ->withPivot('version', 'is_active')
            ->withTimestamps();
    }
}
