use serde::Deserialize;
use std::collections::HashMap;

use crate::search::SearchQueryBuilder;
use crate::models::{QueryOptions, QueryValue, WhereCondition};

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
    pub fn parse_pagination(query: &CommonPaginationQuery) -> Result<(i64, i64, i64), String> {
        let page = query.page.unwrap_or(1);
        let per_page = query.per_page.unwrap_or(10).min(100);

        if page < 1 || per_page < 1 {
            return Err("Invalid pagination parameters".to_string());
        }

        let offset = (page - 1) * per_page;
        Ok((page, per_page, offset))
    }

    pub fn parse_columns(columns: &Option<String>) -> Option<Vec<String>> {
        match columns {
            Some(cols) if !cols.is_empty() => {
                Some(cols.split(',').map(|s| s.trim().to_string()).collect())
            }
            _ => None,
        }
    }

    pub fn parse_search_conditions(
        search: Option<&str>,
        filters: &HashMap<String, String>,
    ) -> Result<Vec<WhereCondition>, String> {
        let mut conditions = match search {
            Some(json) => SearchQueryBuilder::build_conditions(json)?,
            None => Vec::new(),
        };

        // Turn remaining query params (e.g. sub_cluster_id=1&cluster_id=2) into WHERE conditions.
        // Known pagination/control keys are excluded.
        let skip = ["page", "per_page", "columns", "search"];
        for (key, value) in filters {
            if skip.contains(&key.as_str()) {
                continue;
            }
            let qv = if let Ok(i) = value.parse::<i64>() {
                QueryValue::Integer(i)
            } else {
                QueryValue::String(value.clone())
            };
            conditions.push(WhereCondition {
                column: key.clone(),
                operator: "=".to_string(),
                value: qv,
                logical_operator: Some("AND".to_string()),
            });
        }

        Ok(conditions)
    }

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