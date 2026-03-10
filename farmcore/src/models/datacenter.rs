use sqlx::FromRow;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

// ===================================================================
// DATACENTER MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct Datacenter {
    pub data_center_id: i32,
    pub data_center_name: String,
    pub data_center_code: String,
    pub description: Option<String>,
    
    // Location Information
    pub address: Option<String>,
    pub city: Option<String>,
    pub state_province: Option<String>,
    pub country: String,
    pub postal_code: Option<String>,
    pub region: Option<String>,
    
    // Geographic Coordinates
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    
    // Provider Information
    pub provider: Option<String>,
    pub provider_facility_id: Option<String>,
    
    // Facility Details
    pub tier_level: Option<String>, // ENUM: TIER_I, TIER_II, TIER_III, TIER_IV, UNKNOWN
    pub total_floor_space_sqm: Option<Decimal>,
    pub power_capacity_kw: Option<Decimal>,
    pub cooling_capacity_kw: Option<Decimal>,
    
    // Status and Management
    pub status: String, // ENUM: ACTIVE, INACTIVE, MAINTENANCE, CONSTRUCTION, DECOMMISSIONED
    
    // Capacity Tracking
    pub total_racks: Option<i32>,
    pub occupied_racks: Option<i32>,
    pub total_servers: Option<i32>,
    
    // Contact Information
    pub facility_manager: Option<String>,
    pub contact_phone: Option<String>,
    pub contact_email: Option<String>,
    pub emergency_contact: Option<String>,
    pub emergency_phone: Option<String>,
    
    // Operational Details
    pub timezone: Option<String>,
    pub operating_hours: Option<String>,
    
    // Metadata
    pub tags: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl Datacenter {
    pub const TABLE: &'static str = "datacenters";
    pub const KEY: &'static str = "data_center_id";
}

// ===================================================================
// DATACENTER RACK MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct DatacenterRack {
    pub rack_id: i32,
    pub data_center_id: i32,
    
    // Basic Information
    pub rack_name: String,
    pub rack_code: String,
    pub description: Option<String>,
    
    // Physical Specifications
    pub rack_height_u: i32,
    pub rack_width_mm: Option<i32>,
    pub rack_depth_mm: Option<i32>,
    
    // Location in Datacenter
    pub row_name: Option<String>,
    pub aisle_name: Option<String>,
    pub room_name: Option<String>,
    pub floor_level: Option<i32>,
    
    // Power and Cooling
    pub power_capacity_w: Option<i32>,
    pub power_usage_w: Option<i32>,
    pub cooling_type: Option<String>, // ENUM: AIR, LIQUID, HYBRID, NONE
    
    // Network
    pub network_zone: Option<String>,
    
    // Status
    pub status: String, // ENUM: ACTIVE, INACTIVE, MAINTENANCE, RESERVED, DECOMMISSIONED
    
    // Capacity Tracking
    pub total_u_available: Option<i32>,
    pub occupied_u: Option<i32>,
    pub reserved_u: Option<i32>,
    pub free_u: Option<i32>,
    
    // Access Control
    pub access_level: Option<String>, // ENUM: PUBLIC, RESTRICTED, HIGH_SECURITY
    
    // Metadata
    pub tags: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl DatacenterRack {
    pub const TABLE: &'static str = "datacenter_racks";
    pub const KEY: &'static str = "rack_id";
}

// ===================================================================
// DATACENTER RACK POSITION MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct DatacenterRackPosition {
    pub rack_position_id: i32,
    pub rack_id: i32,
    
    // Position Information
    pub u_position: i32,
    pub u_height: i32,
    
    // Status
    pub status: String, // ENUM: AVAILABLE, OCCUPIED, RESERVED, BLOCKED
    
    // Reservation Details
    pub reserved_for: Option<String>,
    pub reservation_notes: Option<String>,
    
    // Current Occupancy
    pub server_id: Option<i32>,
    pub device_type: Option<String>, // ENUM: SERVER, SWITCH, STORAGE, PDU, UPS, OTHER
    
    // Metadata
    pub notes: Option<String>,
    
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl DatacenterRackPosition {
    pub const TABLE: &'static str = "datacenter_rack_positions";
    pub const KEY: &'static str = "rack_position_id";
}

// ===================================================================
// COMPOSITE STRUCTURES
// ===================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatacenterWithRacks {
    #[serde(flatten)]
    pub datacenter: Datacenter,
    pub racks: Vec<DatacenterRack>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RackWithPositions {
    #[serde(flatten)]
    pub rack: DatacenterRack,
    pub positions: Vec<DatacenterRackPosition>,
}
