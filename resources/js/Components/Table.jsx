import React from 'react';

export default function Table({ columns, data, loading = false, onRowClick }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map(col => (
                            <th key={col.label} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                                Loading...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                                No records found.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                            >
                                {columns.map(col => (
                                    <td key={col.label} className="px-4 py-2 whitespace-nowrap">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
