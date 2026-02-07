use serde::Deserialize;
use std::collections::HashMap;

use crate::search::SearchQueryBuilder;
use crate::models::{QueryOptions, WhereCondition};

#[derive(Deserialize, Clone, Debug)]
pub struct CommonPaginationQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub columns: Option<String>,
    pub search: Option<String>,
    #[serde(flatten)]
    pub filters: HashMap<String, String>,
}

pub struct QueryParser;

impl QueryParser {
    /// Parse pagination parameters with validation
    pub fn parse_pagination(query: &CommonPaginationQuery) -> Result<(i64, i64, i64), String> {
        let page = query.page.unwrap_or(1);
        let per_page = query.per_page.unwrap_or(10).min(100);
        
        if page < 1 || per_page < 1 {
            return Err("Invalid pagination parameters".to_string());
        }
        
        let offset = (page - 1) * per_page;
        Ok((page, per_page, offset))
    }

    /// Parse column selection
    pub fn parse_columns(columns: &Option<String>) -> Option<Vec<String>> {
        match columns {
            Some(cols) if !cols.is_empty() => {
                Some(cols.split(',').map(|s| s.trim().to_string()).collect())
            }
            _ => None
        }
    }

    /// Parse search conditions using SearchQueryBuilder
    pub fn parse_search_conditions(
        search: Option<&str>, 
        filters: &HashMap<String, String>
    ) -> Result<Vec<WhereCondition>, String> {
        SearchQueryBuilder::build_mixed_conditions(search, filters, None)
    }

    /// Create QueryOptions from parsed parameters
    pub fn create_query_options(
        columns: Option<Vec<String>>,
        where_conditions: Vec<WhereCondition>,
        per_page: i64,
        offset: i64,
        order_by: Option<String>,
    ) -> QueryOptions {
        QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by,
        }
    }

    /// Complete parsing workflow - returns (page, per_page, offset, columns, conditions)
    pub fn parse_all(
        query: &CommonPaginationQuery,
        default_order_by: Option<String>
    ) -> Result<(i64, i64, i64, Option<Vec<String>>, Vec<WhereCondition>, QueryOptions), String> {
        let (page, per_page, offset) = Self::parse_pagination(query)?;
        let columns = Self::parse_columns(&query.columns);
        let where_conditions = Self::parse_search_conditions(
            query.search.as_deref(), 
            &query.filters
        )?;
        
        let query_options = Self::create_query_options(
            columns.clone(),
            where_conditions.clone(),
            per_page,
            offset,
            default_order_by,
        );

        Ok((page, per_page, offset, columns, where_conditions, query_options))
    }
}