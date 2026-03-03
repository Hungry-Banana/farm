import React, { useState, useMemo, useEffect } from 'react';

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

export interface SearchCriteria {
    column: string;
    operator: string;
    value: string;
    logicToNext?: 'AND' | 'OR'; // Logic operator to connect to the next criterion
}

// DB Table Section component that auto-generates columns from data
interface DBTableSectionProps {
    data: any[];
    keyField?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    excludeColumns?: string[];
    columnOverrides?: Record<string, Partial<TableColumn>>;
    cellContentRenderer?: CellContentRenderer;
    itemsPerPage?: number;
    showPagination?: boolean;
    // Server-side pagination props
    totalItems?: number; // Total number of items from backend
    currentPage?: number; // Current page (controlled from parent)
    onPageChange?: (page: number) => void; // Callback when page changes
    // Advanced search props
    onSearch?: (criteria: SearchCriteria[]) => void; // Callback for search execution
    activeCriteria?: SearchCriteria[]; // Active search criteria from parent (controlled)
}

const DBTableSection = ({ 
    data, 
    keyField = 'id',
    searchable = true,
    searchPlaceholder = "Search...",
    excludeColumns = [],
    columnOverrides = {},
    cellContentRenderer,
    itemsPerPage = 5,
    showPagination = true,
    totalItems,
    currentPage: controlledPage,
    onPageChange,
    onSearch,
    activeCriteria
}: DBTableSectionProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [internalPage, setInternalPage] = useState(1);
    // Building criteria - what's being edited in the panel before Execute
    const [buildingCriteria, setBuildingCriteria] = useState<SearchCriteria[]>([]);
    
    // Active criteria from parent (what's actually applied to the search)
    const activeSearchCriteria = activeCriteria || [];
    
    const [currentCriterion, setCurrentCriterion] = useState<SearchCriteria>({
        column: '',
        operator: '=',
        value: '',
        logicToNext: 'AND'
    });
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    
    // Initialize building criteria from active criteria when panel opens
    useEffect(() => {
        if (showAdvancedSearch && activeCriteria) {
            setBuildingCriteria([...activeCriteria]);
        }
    }, [showAdvancedSearch, activeCriteria]);
    
    // Use controlled page if provided, otherwise use internal state
    const isServerPagination = totalItems !== undefined && onPageChange !== undefined;
    const currentPage = isServerPagination ? (controlledPage || 1) : internalPage;
    
    const operators = [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'LIKE', label: 'Contains' },
        { value: '>', label: 'Greater Than' },
        { value: '<', label: 'Less Than' },
        { value: '>=', label: 'Greater or Equal' },
        { value: '<=', label: 'Less or Equal' }
    ];
    
    const addSearchCriterion = () => {
        if (currentCriterion.column && currentCriterion.value) {
            setBuildingCriteria([...buildingCriteria, currentCriterion]);
            setCurrentCriterion({
                column: columns[0]?.key || '',
                operator: '=',
                value: '',
                logicToNext: 'AND'
            });
        }
    };
    
    const removeSearchCriterion = (index: number) => {
        const newCriteria = activeSearchCriteria.filter((_, i) => i !== index);
        if (onSearch) {
            onSearch(newCriteria);
        }
    };
    
    const removeBuildingCriterion = (index: number) => {
        setBuildingCriteria(buildingCriteria.filter((_, i) => i !== index));
    };
    
    const updateCriterionLogic = (index: number, logic: 'AND' | 'OR') => {
        const updated = [...activeSearchCriteria];
        updated[index] = { ...updated[index], logicToNext: logic };
        if (onSearch) {
            onSearch(updated);
        }
    };
    
    const updateBuildingCriterionLogic = (index: number, logic: 'AND' | 'OR') => {
        const updated = [...buildingCriteria];
        updated[index] = { ...updated[index], logicToNext: logic };
        setBuildingCriteria(updated);
    };
    
    const executeSearch = () => {
        if (onSearch) {
            onSearch(buildingCriteria);
            // Auto-collapse the advanced search panel after executing
            setShowAdvancedSearch(false);
        }
    };
    
    const clearSearch = () => {
        setBuildingCriteria([]);
        setCurrentCriterion({
            column: columns[0]?.key || '',
            operator: '=',
            value: '',
            logicToNext: 'AND'
        });
        if (onSearch) {
            onSearch([]);
        }
    };
    
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

    // Pagination calculations
    const totalPages = isServerPagination 
        ? Math.ceil((totalItems || 0) / itemsPerPage)
        : Math.ceil(filteredData.length / itemsPerPage);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // For server-side pagination, use data as-is. For client-side, slice it
    const paginatedData = isServerPagination 
        ? filteredData 
        : (showPagination ? filteredData.slice(startIndex, endIndex) : filteredData);
    
    const totalDisplayItems = isServerPagination ? (totalItems || 0) : filteredData.length;

    // Reset to page 1 when search term changes
    useEffect(() => {
        if (isServerPagination && onPageChange) {
            onPageChange(1);
        } else {
            setInternalPage(1);
        }
    }, [searchTerm, isServerPagination, onPageChange]);

    const handlePageChange = (page: number) => {
        if (isServerPagination && onPageChange) {
            onPageChange(page);
        } else {
            setInternalPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            // Calculate range around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            
            // Always show last page
            pages.push(totalPages);
        }
        
        return pages;
    };

    return (
        <div className="rounded-theme">
            {/* Advanced Search */}
            {searchable && onSearch && (
                <div className="mb-4">
                    {/* Active Filters Display - Always Visible */}
                    {activeSearchCriteria.length > 0 && (
                        <div className="mb-3 p-3 bg-primary/5 border border-island_border rounded-theme">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Active Filters ({activeSearchCriteria.length})
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {activeSearchCriteria.map((criterion, index) => (
                                            <React.Fragment key={index}>
                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-island_background border border-island_border rounded text-xs">
                                                    <span className="text-foreground">
                                                        <strong className="text-primary">{criterion.column.replace(/_/g, ' ').toUpperCase()}</strong>
                                                        <span className="mx-1 text-muted">{operators.find(op => op.value === criterion.operator)?.label || criterion.operator}</span>
                                                        <strong>&quot;{criterion.value}&quot;</strong>
                                                    </span>
                                                    <button
                                                        onClick={() => removeSearchCriterion(index)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Remove filter"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {index < activeSearchCriteria.length - 1 && (
                                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded text-primary bg-primary/10 border border-island_border">
                                                        {criterion.logicToNext || 'AND'}
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={clearSearch}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors whitespace-nowrap"
                                    title="Clear all filters"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/20 rounded-theme transition-colors"
                        >
                            <svg
                                className={`w-4 h-4 transition-transform ${showAdvancedSearch ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium">Advanced Search</span>
                            {activeSearchCriteria.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                    {activeSearchCriteria.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {showAdvancedSearch && (
                        <div className="border border-island_border rounded-theme p-4 bg-island_background space-y-4">
                            {/* Building Search Criteria (in panel) */}
                            {buildingCriteria.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-foreground">Building Filters:</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {buildingCriteria.map((criterion, index) => (
                                            <React.Fragment key={index}>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-island_border rounded-theme text-sm">
                                                    <span className="text-foreground">
                                                        <strong>{criterion.column.replace(/_/g, ' ').toUpperCase()}</strong>
                                                        {' '}{operators.find(op => op.value === criterion.operator)?.label || criterion.operator}{' '}
                                                        <strong>{criterion.value}</strong>
                                                    </span>
                                                    <button
                                                        onClick={() => removeBuildingCriterion(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {index < buildingCriteria.length - 1 && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => updateBuildingCriterionLogic(index, 'AND')}
                                                            className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                                                criterion.logicToNext === 'AND'
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-island_background border border-island_border text-foreground hover:bg-accent/10'
                                                            }`}
                                                        >
                                                            AND
                                                        </button>
                                                        <button
                                                            onClick={() => updateBuildingCriterionLogic(index, 'OR')}
                                                            className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                                                criterion.logicToNext === 'OR'
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-island_background border border-island_border text-foreground hover:bg-accent/10'
                                                            }`}
                                                        >
                                                            OR
                                                        </button>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Criterion */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-foreground">Add Search Criterion:</div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={currentCriterion.column}
                                        onChange={(e) => setCurrentCriterion({ ...currentCriterion, column: e.target.value })}
                                        className="flex-1 px-3 py-2 text-sm border border-island_border rounded-theme bg-island_background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">Select Column...</option>
                                        {columns.map(col => (
                                            <option key={col.key} value={col.key}>
                                                {col.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={currentCriterion.operator}
                                        onChange={(e) => setCurrentCriterion({ ...currentCriterion, operator: e.target.value })}
                                        className="px-3 py-2 text-sm border border-island_border rounded-theme bg-island_background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {operators.map(op => (
                                            <option key={op.value} value={op.value}>
                                                {op.label}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="text"
                                        value={currentCriterion.value}
                                        onChange={(e) => setCurrentCriterion({ ...currentCriterion, value: e.target.value })}
                                        placeholder="Search value..."
                                        className="flex-1 px-3 py-2 text-sm border border-island_border rounded-theme bg-island_background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addSearchCriterion();
                                            }
                                        }}
                                    />

                                    <button
                                        onClick={addSearchCriterion}
                                        disabled={!currentCriterion.column || !currentCriterion.value}
                                        className="px-3 py-2 text-sm bg-accent/20 border border-island_border rounded-theme text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        title="Add criterion"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-island_border">
                                <button
                                    onClick={executeSearch}
                                    disabled={buildingCriteria.length === 0}
                                    className="px-4 py-2 text-sm bg-primary text-white rounded-theme hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Execute Search
                                </button>
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-2 text-sm border border-island_border rounded-theme bg-island_background text-foreground hover:bg-accent/20 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Simple Search Bar */}
            {searchable && !onSearch && (
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
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
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

            {/* Pagination Controls */}
            {showPagination && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-island_border">
                    <div className="text-sm text-muted-foreground">
                        {totalDisplayItems > 0 ? (
                            <>Showing {startIndex + 1} to {Math.min(endIndex, totalDisplayItems)} of {totalDisplayItems} entries</>
                        ) : (
                            <>No entries to display</>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || totalDisplayItems === 0}
                            className="px-3 py-1 text-sm rounded-theme border border-island_border bg-island_background text-foreground hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {totalPages > 0 ? (
                                getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page as number)}
                                            className={`px-3 py-1 text-sm rounded-theme border transition-colors ${
                                                currentPage === page
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-island_border bg-island_background text-foreground hover:bg-accent/20'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))
                            ) : (
                                <span className="px-3 py-1 text-sm text-muted-foreground">No pages</span>
                            )}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalDisplayItems === 0}
                            className="px-3 py-1 text-sm rounded-theme border border-island_border bg-island_background text-foreground hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DBTableSection;
export type { TableColumn, DBTableSectionProps, CellContentRenderer };