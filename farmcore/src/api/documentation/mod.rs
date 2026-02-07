use serde::Serialize;

#[derive(Serialize, Debug, Clone)]
pub struct ApiDocumentation {
    pub service: String,
    pub version: String,
    pub description: String,
    pub base_url: String,
    pub endpoints: Vec<EndpointDoc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_format: Option<ResponseFormatDoc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub authentication: Option<AuthDoc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rate_limiting: Option<RateLimitDoc>,
}

#[derive(Serialize, Debug, Clone)]
pub struct EndpointDoc {
    pub path: String,
    pub method: HttpMethod,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub path_parameters: Vec<ParameterDoc>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub query_parameters: Vec<ParameterDoc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_body: Option<RequestBodyDoc>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub examples: Vec<ExampleDoc>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub response_codes: Vec<ResponseCodeDoc>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Head,
    Options,
}

#[derive(Serialize, Debug, Clone)]
pub struct ParameterDoc {
    pub name: String,
    pub parameter_type: ParameterType,
    pub description: String,
    pub required: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub enum_values: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub example: Option<String>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ParameterType {
    String,
    Integer,
    Boolean,
    Array,
    Object,
    Number,
}

#[derive(Serialize, Debug, Clone)]
pub struct RequestBodyDoc {
    pub content_type: String,
    pub description: String,
    pub schema: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub example: Option<serde_json::Value>,
}

#[derive(Serialize, Debug, Clone)]
pub struct ExampleDoc {
    pub description: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub method: Option<HttpMethod>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_body: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response: Option<serde_json::Value>,
}

#[derive(Serialize, Debug, Clone)]
pub struct ResponseCodeDoc {
    pub code: u16,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub example: Option<serde_json::Value>,
}

#[derive(Serialize, Debug, Clone)]
pub struct ResponseFormatDoc {
    pub description: String,
    pub success_format: serde_json::Value,
    pub error_format: serde_json::Value,
}

#[derive(Serialize, Debug, Clone)]
pub struct AuthDoc {
    pub type_name: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub header_name: Option<String>,
}

#[derive(Serialize, Debug, Clone)]
pub struct RateLimitDoc {
    pub requests_per_minute: Option<u32>,
    pub requests_per_hour: Option<u32>,
    pub description: String,
}

// Builder pattern for easy construction
impl ApiDocumentation {
    pub fn new(service: &str, version: &str, description: &str, base_url: &str) -> Self {
        Self {
            service: service.to_string(),
            version: version.to_string(),
            description: description.to_string(),
            base_url: base_url.to_string(),
            endpoints: Vec::new(),
            response_format: None,
            authentication: None,
            rate_limiting: None,
        }
    }

    pub fn with_response_format(mut self, response_format: ResponseFormatDoc) -> Self {
        self.response_format = Some(response_format);
        self
    }

    pub fn with_authentication(mut self, auth: AuthDoc) -> Self {
        self.authentication = Some(auth);
        self
    }

    pub fn with_rate_limiting(mut self, rate_limit: RateLimitDoc) -> Self {
        self.rate_limiting = Some(rate_limit);
        self
    }

    pub fn add_endpoint(mut self, endpoint: EndpointDoc) -> Self {
        self.endpoints.push(endpoint);
        self
    }

    pub fn add_endpoints(mut self, endpoints: Vec<EndpointDoc>) -> Self {
        self.endpoints.extend(endpoints);
        self
    }
}

impl EndpointDoc {
    pub fn new(path: &str, method: HttpMethod, description: &str) -> Self {
        Self {
            path: path.to_string(),
            method,
            description: description.to_string(),
            tags: None,
            path_parameters: Vec::new(),
            query_parameters: Vec::new(),
            request_body: None,
            examples: Vec::new(),
            response_codes: Vec::new(),
        }
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = Some(tags);
        self
    }

    pub fn add_path_parameter(mut self, param: ParameterDoc) -> Self {
        self.path_parameters.push(param);
        self
    }

    pub fn add_query_parameter(mut self, param: ParameterDoc) -> Self {
        self.query_parameters.push(param);
        self
    }

    pub fn with_request_body(mut self, body: RequestBodyDoc) -> Self {
        self.request_body = Some(body);
        self
    }

    pub fn add_example(mut self, example: ExampleDoc) -> Self {
        self.examples.push(example);
        self
    }

    pub fn add_response_code(mut self, response: ResponseCodeDoc) -> Self {
        self.response_codes.push(response);
        self
    }
}

impl ParameterDoc {
    pub fn new(name: &str, param_type: ParameterType, description: &str, required: bool) -> Self {
        Self {
            name: name.to_string(),
            parameter_type: param_type,
            description: description.to_string(),
            required,
            default_value: None,
            enum_values: Vec::new(),
            example: None,
        }
    }

    pub fn with_default(mut self, default: &str) -> Self {
        self.default_value = Some(default.to_string());
        self
    }

    pub fn with_enum_values(mut self, values: Vec<String>) -> Self {
        self.enum_values = values;
        self
    }

    pub fn with_example(mut self, example: &str) -> Self {
        self.example = Some(example.to_string());
        self
    }
}

impl ExampleDoc {
    pub fn new(description: &str, url: &str) -> Self {
        Self {
            description: description.to_string(),
            url: url.to_string(),
            method: None,
            request_body: None,
            response: None,
        }
    }

    pub fn with_method(mut self, method: HttpMethod) -> Self {
        self.method = Some(method);
        self
    }

    pub fn with_request_body(mut self, body: serde_json::Value) -> Self {
        self.request_body = Some(body);
        self
    }

    pub fn with_response(mut self, response: serde_json::Value) -> Self {
        self.response = Some(response);
        self
    }
}

impl ResponseCodeDoc {
    pub fn new(code: u16, description: &str) -> Self {
        Self {
            code,
            description: description.to_string(),
            example: None,
        }
    }

    pub fn with_example(mut self, example: serde_json::Value) -> Self {
        self.example = Some(example);
        self
    }
}

// Helper functions for common documentation patterns
pub fn standard_response_codes() -> Vec<ResponseCodeDoc> {
    vec![
        ResponseCodeDoc::new(200, "Success"),
        ResponseCodeDoc::new(400, "Bad Request - Invalid parameters"),
        ResponseCodeDoc::new(404, "Not Found - Resource not found"),
        ResponseCodeDoc::new(500, "Internal Server Error"),
    ]
}

pub fn standard_response_format() -> ResponseFormatDoc {
    ResponseFormatDoc {
        description: "All endpoints return consistent JSON structure".to_string(),
        success_format: serde_json::json!({
            "success": true,
            "data": "Response data",
            "meta": {
                "pagination": "Pagination info (if applicable)",
                "filters_applied": "Applied filters (if applicable)",
                "timestamp": "ISO 8601 timestamp"
            }
        }),
        error_format: serde_json::json!({
            "success": false,
            "error": {
                "code": "ERROR_CODE",
                "message": "Human-readable error message",
                "details": "Additional error details (optional)"
            }
        }),
    }
}

pub fn pagination_parameters() -> Vec<ParameterDoc> {
    vec![
        ParameterDoc::new("page", ParameterType::Integer, "Page number", false)
            .with_default("1")
            .with_example("2"),
        ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false)
            .with_default("10")
            .with_example("25"),
    ]
}

// Common filtering parameters for any model
pub fn filtering_parameters(available_fields: &[&str]) -> Vec<ParameterDoc> {
    let mut params = vec![
        ParameterDoc::new("columns", ParameterType::String, 
            "Comma-separated list of columns to return", false)
            .with_example(&available_fields[..3].join(",")),
    ];

    // Add dynamic filtering parameters
    for field in available_fields {
        params.extend(vec![
            ParameterDoc::new(&format!("{}", field), ParameterType::String,
                &format!("Filter by exact {} value", field), false),
            ParameterDoc::new(&format!("{}_like", field), ParameterType::String,
                &format!("Filter {} with LIKE pattern", field), false),
            ParameterDoc::new(&format!("{}_gt", field), ParameterType::String,
                &format!("Filter {} greater than value", field), false),
            ParameterDoc::new(&format!("{}_lt", field), ParameterType::String,
                &format!("Filter {} less than value", field), false),
            ParameterDoc::new(&format!("{}_ne", field), ParameterType::String,
                &format!("Filter {} not equal to value", field), false),
        ]);
    }

    params
}