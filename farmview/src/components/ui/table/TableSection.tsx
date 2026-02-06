import React, { useState, useMemo } from 'react';

// Helper component for rendering table sections
interface TableColumn {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
    className?: string;
}

interface TableSectionProps {
    columns: TableColumn[];
    data: any[];
    keyField?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
}

const TableSection = ({ 
    columns, 
    data, 
    keyField = 'id', 
    searchable = true,
    searchPlaceholder = "Search..." 
}: TableSectionProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchable || !searchTerm.trim()) {
            return data;
        }

        const lowercaseSearch = searchTerm.toLowerCase();
        return data.filter(item => {
            return columns.some(column => {
                const value = item[column.key];
                if (value == null) return false;
                
                // Convert value to string for searching
                const stringValue = String(value).toLowerCase();
                return stringValue.includes(lowercaseSearch);
            });
        });
    }, [data, searchTerm, columns, searchable]);

    return (
        <div className="rounded-theme">
            {searchable && (
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 text-sm border border-island_border rounded-theme bg-island_background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Showing {filteredData.length} of {data.length} results
                        </div>
                    )}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-md">
                    <thead>
                        <tr className="border-b border-island_border">
                            {columns.map((column) => (
                                <th key={column.key} className={`text-left px-3 py-3 ${column.className || ''}`}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={item[keyField] || index} className="border-b border-island_border">
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-4 py-4 ${column.className || ''}`}>
                                            {column.render ? column.render(item[column.key], item) : (item[column.key] || 'N/A')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td 
                                    colSpan={columns.length} 
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    {searchTerm ? 'No results found for your search.' : 'No data available.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSection;
export type { TableColumn, TableSectionProps };