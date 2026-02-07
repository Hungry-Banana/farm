#[derive(Debug, Default, Clone)]
pub struct QueryOptions {
    pub columns: Option<Vec<String>>,
    pub where_conditions: Vec<WhereCondition>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub order_by: Option<String>,
}

#[derive(Debug, Clone)]
pub struct WhereCondition {
    pub column: String,
    pub operator: String,
    pub value: QueryValue,
    pub logical_operator: Option<String>, // NEW: AND/OR for this condition
}

#[derive(Debug, Clone)]
pub enum QueryValue {
    String(String),
    Integer(i64),
    Float(f64),
    Boolean(bool),
    Null,
}