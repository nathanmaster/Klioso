<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteScan extends Model
{
    protected $fillable = [
        'url',
        'status',
        'plugins',
        'themes',
        'wordpress_version',
        'raw_output',
        'error_message',
        'scanned_at'
    ];

    protected $casts = [
        'plugins' => 'array',
        'themes' => 'array',
        'scanned_at' => 'datetime'
    ];

    public function getPluginsCountAttribute()
    {
        return is_array($this->plugins) ? count($this->plugins) : 0;
    }

    public function getThemesCountAttribute()
    {
        return is_array($this->themes) ? count($this->themes) : 0;
    }
}
