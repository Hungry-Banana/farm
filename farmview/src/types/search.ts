/**
 * Type definitions for search functionality
 */

// Comparison operators supported by the backend
export type ComparisonOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE';

// Logical operators for combining search criteria  
export type LogicalOperator = 'AND' | 'OR';

// Search criteria structure used throughout the frontend
export interface SearchCriteria {
  id: string;
  column: string;
  term: string;
  operator?: LogicalOperator;
  comparisonOperator?: ComparisonOperator;
}

// Structured search format sent to backend
export interface StructuredSearch {
  [column: string]: string | { [value: string]: string | ColumnOperation };
}

// Column operation details for complex search criteria
export interface ColumnOperation {
  op?: ComparisonOperator; 
  logical: LogicalOperator;
}

// Validation result for search criteria
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}