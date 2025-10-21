import React from 'react';
import { TrashIcon, ArchiveBoxIcon, EyeIcon } from '@heroicons/react/24/outline';

/**
 * Universal Bulk Actions Bar Component
 * Provides consistent bulk actions across all pages
 */
export default function BulkActionsBar({ 
    selectedItems = [], 
    onClearSelection, 
    actions = [], 
    itemName = 'item' 
}) {
    if (selectedItems.length === 0) return null;

    const defaultActions = [
        {
            key: 'delete',
            label: 'Delete',
            variant: 'danger',
            icon: TrashIcon
        }
    ];

    const actionsToShow = actions.length > 0 ? actions : defaultActions;

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {selectedItems.length} {itemName}{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={onClearSelection}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    >
                        Clear selection
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    {actionsToShow.map((action) => (
                        <button
                            key={action.key}
                            onClick={() => action.onClick?.(selectedItems)}
                            disabled={action.disabled}
                            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                                action.variant === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                    : action.variant === 'warning'
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400'
                                    : action.variant === 'success'
                                    ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                            } ${action.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
