import React from 'react';
import { Squares2X2Icon, ListBulletIcon, TableCellsIcon } from '@heroicons/react/24/outline';

/**
 * Universal View Toggle Component
 * Provides consistent view switching across all pages
 */
export default function ViewToggle({ 
    currentView, 
    onViewChange, 
    views = ['grid', 'table'],
    className = '' 
}) {
    const viewConfigs = {
        grid: {
            icon: Squares2X2Icon,
            label: 'Grid view',
            key: 'grid'
        },
        table: {
            icon: ListBulletIcon,
            label: 'Table view',
            key: 'table'
        },
        cards: {
            icon: TableCellsIcon,
            label: 'Cards view',
            key: 'cards'
        }
    };

    const availableViews = views.map(view => viewConfigs[view]).filter(Boolean);

    if (availableViews.length <= 1) return null;

    return (
        <div className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
            {availableViews.map((view) => (
                <button
                    key={view.key}
                    onClick={() => onViewChange(view.key)}
                    className={`p-2 rounded-md transition-colors ${
                        currentView === view.key
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={view.label}
                >
                    <view.icon className="h-5 w-5" />
                </button>
            ))}
        </div>
    );
}
