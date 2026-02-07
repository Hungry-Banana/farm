use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ApiError>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<ApiMeta>,
}

#[derive(Serialize)]
pub struct ApiError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct ApiMeta {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<PaginationMeta>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters_applied: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize)]
pub struct PaginationMeta {
    pub current_page: i64,
    pub per_page: i64,
    pub total_count: i64,
    pub total_pages: i64,
    pub has_next: bool,
    pub has_prev: bool,
}

// Update helper methods to only include meta when needed
impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            meta: None,  // No meta for simple success responses
        }
    }
    
    pub fn success_with_meta(data: T, meta: ApiMeta) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            meta: Some(meta),
        }
    }
    
    pub fn error(code: &str, message: &str) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(ApiError {
                code: code.to_string(),
                message: message.to_string(),
                details: None,
            }),
            meta: None,  // No meta for error responses
        }
    }
    
    pub fn error_with_details(code: &str, message: &str, details: serde_json::Value) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(ApiError {
                code: code.to_string(),
                message: message.to_string(),
                details: Some(details),
            }),
            meta: None,
        }
    }
}