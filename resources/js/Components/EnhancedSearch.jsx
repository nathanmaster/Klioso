import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Enhanced Search and Filter Component
 * Provides advanced search capabilities with multiple filter types
 */
export default function EnhancedSearch({
    onSearch,
    onFilter,
    placeholder = "Search...",
    searchFields = ['name', 'title', 'domain_name', 'description'],
    filterOptions = [],
    initialSearchTerm = '',
    initialFilters = {},
    showAdvancedFilters = false,
    className = ''
}) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(showAdvancedFilters);
    const [searchHistory, setSearchHistory] = useState([]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Filter change handler
    useEffect(() => {
        if (onFilter) {
            onFilter(filters);
        }
    }, [filters, onFilter]);

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('klioso-search-history');
        if (saved) {
            try {
                setSearchHistory(JSON.parse(saved));
            } catch (e) {
                console.warn('Failed to load search history:', e);
            }
        }
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        if (searchTerm.trim()) {
            // Add to search history
            const newHistory = [
                searchTerm.trim(),
                ...searchHistory.filter(item => item !== searchTerm.trim())
            ].slice(0, 10); // Keep only last 10 searches
            
            setSearchHistory(newHistory);
            localStorage.setItem('klioso-search-history', JSON.stringify(newHistory));
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters({});
    };

    const hasActiveFilters = useMemo(() => {
        return searchTerm.length > 0 || Object.values(filters).some(value => 
            value !== '' && value !== 'all' && value !== null && value !== undefined
        );
    }, [searchTerm, filters]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => 
            value !== '' && value !== 'all' && value !== null && value !== undefined
        ).length;
    }, [filters]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            list="search-history"
                        />
                        
                        {/* Search History Datalist */}
                        <datalist id="search-history">
                            {searchHistory.map((term, index) => (
                                <option key={index} value={term} />
                            ))}
                        </datalist>

                        {/* Action Buttons */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                            {filterOptions.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-1 rounded-md transition-colors ${
                                        showFilters || activeFilterCount > 0
                                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                    title={`${showFilters ? 'Hide' : 'Show'} filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
                                >
                                    <FunnelIcon className="h-4 w-4" />
                                </button>
                            )}
                            
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="p-1 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                                    title="Clear all filters"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Advanced Filters */}
            {showFilters && filterOptions.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterOptions.map((option) => (
                            <div key={option.key} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {option.label}
                                </label>
                                
                                {option.type === 'select' && (
                                    <select
                                        value={filters[option.key] || ''}
                                        onChange={(e) => handleFilterChange(option.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    >
                                        <option value="">All {option.label}</option>
                                        {option.options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {option.type === 'range' && (
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min={option.min || 0}
                                            max={option.max || 100}
                                            value={filters[option.key] || option.min || 0}
                                            onChange={(e) => handleFilterChange(option.key, parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{option.min || 0}</span>
                                            <span>{filters[option.key] || option.min || 0}</span>
                                            <span>{option.max || 100}</span>
                                        </div>
                                    </div>
                                )}

                                {option.type === 'date' && (
                                    <input
                                        type="date"
                                        value={filters[option.key] || ''}
                                        onChange={(e) => handleFilterChange(option.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    />
                                )}

                                {option.type === 'checkbox' && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters[option.key] || false}
                                            onChange={(e) => handleFilterChange(option.key, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {option.checkboxLabel || 'Enable'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filter Summary */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                            Search: "{searchTerm}"
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    {Object.entries(filters).map(([key, value]) => {
                                        if (!value || value === 'all' || value === '') return null;
                                        const option = filterOptions.find(opt => opt.key === key);
                                        return (
                                            <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {option?.label}: {value}
                                                <button
                                                    onClick={() => handleFilterChange(key, '')}
                                                    className="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                                
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
