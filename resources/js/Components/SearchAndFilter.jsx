import React, { useState, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Universal Search and Filter Component
 * Provides consistent search and filtering across all pages
 */
export default function SearchAndFilter({ 
    searchValue = '',
    searchPlaceholder = 'Search...',
    onSearchChange,
    filters = [],
    filterValues = {},
    onFilterChange,
    showClearButton = true,
    className = ''
}) {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);
    
    // Debounce search input
    const debounceSearch = useCallback(
        debounce((value) => {
            onSearchChange?.(value);
        }, 300),
        [onSearchChange]
    );

    useEffect(() => {
        debounceSearch(localSearchValue);
    }, [localSearchValue, debounceSearch]);

    const handleSearchChange = (e) => {
        setLocalSearchValue(e.target.value);
    };

    const handleClearSearch = () => {
        setLocalSearchValue('');
        onSearchChange?.('');
    };

    const handleFilterChange = (filterKey, value) => {
        onFilterChange?.(filterKey, value);
    };

    const hasActiveFilters = Object.values(filterValues).some(value => 
        value && value !== 'all' && value !== ''
    );

    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 ${className}`}>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={localSearchValue}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {localSearchValue && showClearButton && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <div key={filter.key} className="min-w-0">
                            {filter.type === 'select' ? (
                                <select
                                    value={filterValues[filter.key] || filter.defaultValue || 'all'}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    {filter.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : filter.type === 'toggle' ? (
                                <button
                                    onClick={() => handleFilterChange(filter.key, !filterValues[filter.key])}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterValues[filter.key]
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ) : filter.type === 'daterange' ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="date"
                                        value={filterValues[`${filter.key}_start`] || ''}
                                        onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
                                        className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400">to</span>
                                    <input
                                        type="date"
                                        value={filterValues[`${filter.key}_end`] || ''}
                                        onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
                                        className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}

            {/* Clear All Filters */}
            {hasActiveFilters && showClearButton && (
                <button
                    onClick={() => {
                        // Clear all filters
                        Object.keys(filterValues).forEach(key => {
                            handleFilterChange(key, '');
                        });
                        handleClearSearch();
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear all
                </button>
            )}
        </div>
    );
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
