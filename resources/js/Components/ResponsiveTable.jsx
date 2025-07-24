import React from 'react';

// Simple SVG icons to avoid dependency conflicts
const ChevronUpIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export default function ResponsiveTable({ 
    columns = [], 
    data = [], 
    loading = false, 
    onRowClick,
    sortBy = null,
    sortDirection = 'asc',
    onSort = null
}) {
    const getSortIcon = (columnKey) => {
        if (sortBy !== columnKey) {
            return (
                <div className="flex flex-col opacity-30">
                    <ChevronUpIcon className="h-3 w-3 -mb-1" />
                    <ChevronDownIcon className="h-3 w-3" />
                </div>
            );
        }
        
        return sortDirection === 'asc' ? 
            <ChevronUpIcon className="h-4 w-4" /> : 
            <ChevronDownIcon className="h-4 w-4" />;
    };

    const handleHeaderClick = (column) => {
        if (column.sortable !== false && onSort) {
            onSort(column.key);
        }
    };

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th 
                                    key={col?.key || col?.label || `header-${idx}`} 
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        col.sortable !== false && onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleHeaderClick(col)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col?.label || ''}</span>
                                        {col.sortable !== false && onSort && (
                                            <span className="ml-1">
                                                {getSortIcon(col.key)}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : (!data || data.length === 0) ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr
                                    key={row?.id || `row-${idx}`}
                                    className={`${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""} transition-colors duration-150`}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={col?.key || col?.label || `col-${colIdx}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {col.render ? col.render(row) : row?.[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    </div>
                ) : (!data || data.length === 0) ? (
                    <div className="p-8 text-center text-gray-400">
                        No records found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {data.map((row, idx) => (
                            <div 
                                key={row?.id || `card-${idx}`}
                                className={`p-4 ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""} transition-colors duration-150`}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                            >
                                <div className="space-y-2">
                                    {columns.map((col, colIdx) => {
                                        // Skip actions column or columns marked as hidden on mobile
                                        if (col.key === 'actions' || col.hideOnMobile) {
                                            return null;
                                        }
                                        
                                        const value = col.render ? col.render(row) : row?.[col.key];
                                        if (!value || value === '-') return null;
                                        
                                        return (
                                            <div key={col?.key || col?.label || `mobile-col-${colIdx}`} className="flex justify-between items-start">
                                                <span className="text-sm font-medium text-gray-500 w-1/3 flex-shrink-0">
                                                    {col?.label}:
                                                </span>
                                                <span className="text-sm text-gray-900 w-2/3 text-right">
                                                    {value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Always show actions at the bottom of mobile cards */}
                                    {columns.find(col => col.key === 'actions') && (
                                        <div className="pt-2 border-t border-gray-100 mt-3">
                                            {columns.find(col => col.key === 'actions').render(row)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
