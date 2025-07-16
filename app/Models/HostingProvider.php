<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HostingProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'login_url',
    ];

    public function websites()
    {
        return $this->hasMany(Website::class);
    }
}
