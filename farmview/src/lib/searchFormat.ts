/**
 * Utility functions for converting between frontend search criteria and backend structured format
 */

import { 
  SearchCriteria, 
  StructuredSearch, 
  ColumnOperation, 
  ValidationResult, 
  ComparisonOperator, 
  LogicalOperator 
} from '@/types/search';

export type { SearchCriteria, StructuredSearch, ColumnOperation, ValidationResult };

/**
 * Convert frontend SearchCriteria array to new structured format
 * Groups criteria by column and handles logical operators properly
 */
export function convertToStructuredFormat(criteria: SearchCriteria[]): StructuredSearch {
  const structured: StructuredSearch = {};
  
  // Group criteria by column
  const columnGroups: { [column: string]: SearchCriteria[] } = {};
  for (const criterion of criteria) {
    if (!columnGroups[criterion.column]) {
      columnGroups[criterion.column] = [];
    }
    columnGroups[criterion.column].push(criterion);
  }
  
  // Convert each column group
  for (const [column, criteriaList] of Object.entries(columnGroups)) {
    if (criteriaList.length === 1) {
      // Single criterion
      const criterion = criteriaList[0];
      if (!criterion.comparisonOperator || criterion.comparisonOperator === '=') {
        // Simple format for equality operations
        structured[column] = criterion.term;
      } else {
        // Complex format for non-equality operations
        structured[column] = {
          [criterion.term]: {
            op: criterion.comparisonOperator,
            logical: criterion.operator || 'OR'
          }
        };
      }
    } else {
      // Multiple criteria for same column - use complex format
      const valueOperators: { [value: string]: string | ColumnOperation } = {};
      for (const criterion of criteriaList) {
        if (!criterion.comparisonOperator || criterion.comparisonOperator === '=') {
          // Simple logical operator for equality
          valueOperators[criterion.term] = criterion.operator || 'OR';
        } else {
          // Full operation details for non-equality
          valueOperators[criterion.term] = {
            op: criterion.comparisonOperator,
            logical: criterion.operator || 'OR'
          };
        }
      }
      structured[column] = valueOperators;
    }
  }
  
  return structured;
}

/**
 * Convert structured format back to frontend SearchCriteria array
 * Useful for editing existing searches or backward compatibility
 */
export function convertFromStructuredFormat(structured: StructuredSearch): SearchCriteria[] {
  const criteria: SearchCriteria[] = [];
  let idCounter = 1;
  
  for (const [column, value] of Object.entries(structured)) {
    if (typeof value === 'string') {
      // Simple format
      criteria.push({
        id: (idCounter++).toString(),
        column,
        term: value,
        comparisonOperator: '='
      });
    } else {
      // Complex format
      for (const [term, operator] of Object.entries(value)) {
        criteria.push({
          id: (idCounter++).toString(),
          column,
          term,
          operator: operator as 'AND' | 'OR',
          comparisonOperator: '='
        });
      }
    }
  }
  
  return criteria;
}

/**
 * Validate that search criteria can be converted to structured format
 * Returns validation errors or null if valid
 */
export function validateSearchCriteria(criteria: SearchCriteria[]): string[] {
  const errors: string[] = [];
  
  for (const criterion of criteria) {
    if (!criterion.column || criterion.column.trim() === '') {
      errors.push(`Search criterion ${criterion.id} has empty column`);
    }
    if (!criterion.term || criterion.term.trim() === '') {
      errors.push(`Search criterion ${criterion.id} has empty search term`);
    }
    if (criterion.operator && !['AND', 'OR'].includes(criterion.operator)) {
      errors.push(`Search criterion ${criterion.id} has invalid operator: ${criterion.operator}`);
    }
    if (criterion.comparisonOperator && !['=', '!=', '>', '<', '>=', '<=', 'LIKE'].includes(criterion.comparisonOperator)) {
      errors.push(`Search criterion ${criterion.id} has invalid comparison operator: ${criterion.comparisonOperator}`);
    }
  }
  
  return errors;
}

/**
 * Detect potentially illogical search combinations
 * Returns warnings about logic that might not produce expected results
 */
export function validateSearchLogic(criteria: SearchCriteria[]): string[] {
  const warnings: string[] = [];
  
  // Group criteria by column
  const columnGroups: { [column: string]: SearchCriteria[] } = {};
  for (const criterion of criteria) {
    if (!columnGroups[criterion.column]) {
      columnGroups[criterion.column] = [];
    }
    columnGroups[criterion.column].push(criterion);
  }
  
  // Check each column group for logical issues
  for (const [column, criteriaList] of Object.entries(columnGroups)) {
    if (criteriaList.length > 1) {
      // Check for potentially contradictory AND conditions
      const andConditions = criteriaList.filter(c => c.operator === 'AND');
      if (andConditions.length > 1) {
        const hasEqualityAndInequality = andConditions.some(c => !c.comparisonOperator || c.comparisonOperator === '=') &&
                                        andConditions.some(c => c.comparisonOperator === '!=');
        
        if (hasEqualityAndInequality) {
          warnings.push(`Column "${column}": Using AND with both equality and inequality might not return any results (e.g., ${column} = "value1" AND ${column} != "value2")`);
        }
        
        const equalityTerms = andConditions
          .filter(c => !c.comparisonOperator || c.comparisonOperator === '=')
          .map(c => c.term);
        
        if (equalityTerms.length > 1) {
          warnings.push(`Column "${column}": Using AND with multiple equality values will never match (${column} cannot be "${equalityTerms[0]}" AND "${equalityTerms[1]}" simultaneously)`);
        }
      }
    }
  }
  
  return warnings;
}

/**
 * Create example structured searches for documentation/testing
 */
export const STRUCTURED_SEARCH_EXAMPLES = {
  simple: {
    status: "active",
    environment: "production"
  } as StructuredSearch,
  
  complex: {
    status: "active",
    user_name: {
      admin: "OR",
      root: "OR"
    },
    environment: "production"
  } as StructuredSearch,
  
  mixed: {
    status: "active",
    user_name: {
      admin: "OR",
      root: "OR",
      serviceuser: "OR"
    },
    environment: "production",
    cpu_count: "8"
  } as StructuredSearch,
  
  withComparison: {
    status: "active",
    cpu_count: {
      "8": { op: ">", logical: "OR" },
      "16": { op: "<=", logical: "OR" }
    },
    memory_gb: {
      "32": { op: ">=", logical: "OR" }
    }
  } as StructuredSearch,
  
  mixedOperators: {
    status: {
      active: "OR",
      maintenance: { op: "!=", logical: "OR" }
    },
    host_name: {
      "web": { op: "LIKE", logical: "OR" },
      "api": { op: "LIKE", logical: "OR" }
    }
  } as StructuredSearch
};

/**
 * Preview how a structured search will be interpreted as SQL
 * Useful for the SearchPreview component
 */
export function previewStructuredSearch(structured: StructuredSearch): string {
  const parts: string[] = [];
  
  for (const [column, value] of Object.entries(structured)) {
    if (typeof value === 'string') {
      parts.push(`${column} = "${value}"`);
    } else {
      const operations = Object.entries(value);
      if (operations.length === 1) {
        const [term, operation] = operations[0];
        if (typeof operation === 'string') {
          // Simple logical operator (equality)
          parts.push(`${column} = "${term}"`);
        } else {
          // Complex operation with comparison operator
          const op = operation.op || '=';
          parts.push(`${column} ${op} "${term}"`);
        }
      } else {
        // Multiple operations
        const allEquality = operations.every(([, op]) => 
          typeof op === 'string' || !op.op || op.op === '='
        );
        
        if (allEquality) {
          // Use IN clause for multiple equality operations
          const terms = operations.map(([term]) => `"${term}"`);
          parts.push(`${column} IN (${terms.join(', ')})`);
        } else {
          // Mixed operations - show with proper logical operators
          const subParts = [];
          for (let i = 0; i < operations.length; i++) {
            const [term, op] = operations[i];
            const operator = typeof op === 'string' ? '=' : (op.op || '=');
            const logical = typeof op === 'string' ? op : (op.logical || 'OR');
            
            if (i === 0) {
              subParts.push(`${column} ${operator} "${term}"`);
            } else {
              subParts.push(` ${logical} ${column} ${operator} "${term}"`);
            }
          }
          parts.push(`(${subParts.join('')})`);
        }
      }
    }
  }
  
  return parts.join(' AND ');
}