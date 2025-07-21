<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    // Optionally specify the table if not 'templates'
    // protected $table = 'templates';

    // Specify fillable fields for mass assignment
    protected $fillable = ['name', 'description', 'source_url', 'notes'];
}