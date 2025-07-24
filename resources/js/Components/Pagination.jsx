import { Link } from '@inertiajs/react';

// Simple SVG icons to avoid dependency conflicts
const ChevronLeftIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default function Pagination({ 
    current_page, 
    last_page, 
    per_page, 
    total, 
    from, 
    to, 
    links = [],
    path = '',
    preserveScroll = true 
}) {
    if (last_page <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        // Add ellipsis and last page if needed
        if (endPage < last_page) {
            if (endPage < last_page - 1) {
                pages.push('...');
            }
            pages.push(last_page);
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="text-sm text-gray-700 order-2 sm:order-1">
                Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-1 order-1 sm:order-2">
                {/* Previous button */}
                {current_page > 1 ? (
                    <Link
                        href={`${path}?page=${current_page - 1}`}
                        preserveScroll={preserveScroll}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span className="sr-only">Previous</span>
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-l-md cursor-not-allowed">
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span className="sr-only">Previous</span>
                    </span>
                )}

                {/* Page numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                            >
                                ...
                            </span>
                        );
                    }

                    const isCurrentPage = page === current_page;
                    
                    return isCurrentPage ? (
                        <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600"
                        >
                            {page}
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={`${path}?page=${page}`}
                            preserveScroll={preserveScroll}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {page}
                        </Link>
                    );
                })}

                {/* Next button */}
                {current_page < last_page ? (
                    <Link
                        href={`${path}?page=${current_page + 1}`}
                        preserveScroll={preserveScroll}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                        <span className="sr-only">Next</span>
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-r-md cursor-not-allowed">
                        <ChevronRightIcon className="h-5 w-5" />
                        <span className="sr-only">Next</span>
                    </span>
                )}
            </div>
        </div>
    );
}
