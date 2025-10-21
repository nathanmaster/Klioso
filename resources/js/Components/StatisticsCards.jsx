import React from 'react';

/**
 * Universal Statistics Cards Component
 * Provides consistent statistics display across all pages
 */
export default function StatisticsCards({ cards = [] }) {
    if (cards.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <card.icon className={`h-8 w-8 ${card.color || 'text-gray-500'}`} />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        {card.label}
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {typeof card.value === 'function' ? card.value() : card.value}
                                    </dd>
                                    {card.subtitle && (
                                        <dd className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {card.subtitle}
                                        </dd>
                                    )}
                                </dl>
                            </div>
                            {card.trend && (
                                <div className={`flex items-center text-sm ${
                                    card.trend > 0 ? 'text-green-600' : card.trend < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    {card.trend > 0 ? '↗' : card.trend < 0 ? '↘' : '→'}
                                    <span className="ml-1">{Math.abs(card.trend)}%</span>
                                </div>
                            )}
                        </div>
                        {card.description && (
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                {card.description}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
