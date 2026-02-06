import React, { useState, useMemo } from 'react';

// Helper component for rendering table sections
interface TableColumn {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
    className?: string;
}

// Cell content renderer function type or React component
type CellContentRenderer = 
    | ((columnKey: string, value: any, item: any) => React.ReactNode)
    | React.ComponentType<{columnKey: string, value: any, item: any}>;

// DB Table Section component that auto-generates columns from data
interface DBTableSectionProps {
    data: any[];
    keyField?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    excludeColumns?: string[];
    columnOverrides?: Record<string, Partial<TableColumn>>;
    cellContentRenderer?: CellContentRenderer;
}

const DBTableSection = ({ 
    data, 
    keyField = 'id',
    searchable = true,
    searchPlaceholder = "Search...",
    excludeColumns = [],
    columnOverrides = {},
    cellContentRenderer
}: DBTableSectionProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Generate columns automatically from data
    const columns = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }

        // Extract column keys from the first data item
        const dataKeys = Object.keys(data[0] || {});
        const filteredKeys = dataKeys.filter(key => !excludeColumns.includes(key));
        
        const newColumns: TableColumn[] = filteredKeys.map((key) => {
            const override = columnOverrides[key] || {};
            return {
                key,
                label: override.label || key.toUpperCase().replace(/_/g, " "), // Convert snake_case to readable labels
                render: override.render || (cellContentRenderer 
                    ? (value: any, item: any) => {
                        // Assume it's a React component if it's a function
                        const Component = cellContentRenderer as React.ComponentType<{columnKey: string, value: any, item: any}>;
                        return <Component columnKey={key} value={value} item={item} />;
                    }
                    : undefined),
                className: override.className
            };
        });

        return newColumns;
    }, [data, excludeColumns, columnOverrides, cellContentRenderer]);

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
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-md table-auto">
                    <thead>
                        <tr className="border-b border-island_border">
                            {columns.map((column) => (
                                <th key={column.key} className={`text-left px-4 py-3 whitespace-nowrap min-w-fit ${column.className || ''}`}>
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
                                        <td key={column.key} className={`px-4 py-4 whitespace-nowrap min-w-fit ${column.className || ''}`}>
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

export default DBTableSection;
export type { TableColumn, DBTableSectionProps, CellContentRenderer };