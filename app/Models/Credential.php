<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class Credential extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'password',
    ];

    protected function password(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => 
                // Decrypt password when accessed
                (function () use ($value) {
                    try {
                        return Crypt::decryptString($value);
                    } catch (DecryptException $e) {
                        return 'DECRYPTION_FAILED';
                    }
                })(),
            set: fn ($value) => Crypt::encryptString($value),
        );
    }
}