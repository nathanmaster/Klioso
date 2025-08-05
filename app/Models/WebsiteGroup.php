<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebsiteGroup extends Model
{
    protected $fillable = [
        'name',
        'description',
        'color',
        'icon',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the websites in this group.
     */
    public function websites(): HasMany
    {
        return $this->hasMany(Website::class, 'group_id');
    }

    /**
     * Scope for active groups only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered groups
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Get websites count for this group
     */
    public function getWebsitesCountAttribute(): int
    {
        return $this->websites()->count();
    }

    /**
     * Get color as CSS style
     */
    public function getColorStyleAttribute(): string
    {
        return "background-color: {$this->color}";
    }

    /**
     * Get predefined colors for selection
     */
    public static function getAvailableColors(): array
    {
        return [
            '#3B82F6' => 'Blue',
            '#10B981' => 'Green',
            '#F59E0B' => 'Yellow',
            '#EF4444' => 'Red',
            '#8B5CF6' => 'Purple',
            '#06B6D4' => 'Cyan',
            '#F97316' => 'Orange',
            '#84CC16' => 'Lime',
            '#EC4899' => 'Pink',
            '#6B7280' => 'Gray',
        ];
    }

    /**
     * Get predefined icons for selection
     */
    public static function getAvailableIcons(): array
    {
        return [
            'globe' => 'Globe',
            'server' => 'Server',
            'briefcase' => 'Briefcase',
            'folder' => 'Folder',
            'star' => 'Star',
            'heart' => 'Heart',
            'shield' => 'Shield',
            'lightning-bolt' => 'Lightning',
            'fire' => 'Fire',
            'sparkles' => 'Sparkles',
        ];
    }
}
