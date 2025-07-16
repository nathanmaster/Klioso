<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_email',
        'contact_phone',
        'address',
        'company',
        'notes',
    ];

    public function websites()
    {
        return $this->hasMany(Website::class);
    }
}
