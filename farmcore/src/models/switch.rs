use sqlx::FromRow;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

// ===================================================================
// SWITCH MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct Switch {
    pub switch_id: i32,
    pub switch_name: String,
    pub component_switch_id: Option<i32>,
    pub serial_number: Option<String>,
    pub asset_tag: Option<String>,

    // Firmware / OS
    pub os_type: Option<String>,
    pub os_version: Option<String>,
    pub bootrom_version: Option<String>,

    // Management Interface
    pub mgmt_ip_address: Option<String>,
    pub mgmt_mac_address: Option<String>,
    pub mgmt_vlan_id: Option<i32>,

    // Physical / Health
    pub uptime_seconds: Option<i64>,
    pub temperature_celsius: Option<i32>,
    pub fan_status: Option<String>,
    pub power_consumption_watts: Option<i32>,

    // Management Fields
    pub switch_role: Option<String>, // ENUM: ACCESS, DISTRIBUTION, CORE, EDGE, MANAGEMENT, OOB
    pub status: Option<String>,      // ENUM: ACTIVE, INACTIVE, MAINTENANCE, NEW, RMA, DECOMMISSIONED
    pub environment_type: Option<String>, // ENUM: PRODUCTION, DEVELOPMENT, QA, STAGING, TESTING

    // Location
    pub cluster_id: Option<i32>,
    pub sub_cluster_id: Option<i32>,
    pub data_center_id: Option<i32>,
    pub rack_id: Option<i32>,
    pub rack_position_id: Option<i32>,

    // Polling
    pub last_poll_at: Option<chrono::DateTime<chrono::Utc>>,
    pub poll_interval_seconds: Option<i32>,

    // Auth configuration (non-secret fields)
    pub auth_method: Option<String>, // ENUM: LOCAL, RADIUS, TACACS, LDAP, CERTIFICATE
    pub auth_server_ip: Option<String>,
    pub auth_server_port: Option<i32>,
    pub snmp_version: Option<String>, // ENUM: v1, v2c, v3
    pub snmp_auth_protocol: Option<String>,
    pub snmp_priv_protocol: Option<String>,

    // NOTE: auth_shared_secret, snmp_community, service_username, service_password
    //       are intentionally excluded from this struct — they are stored in the DB
    //       but never serialised into API responses to prevent credential leakage.

    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl Switch {
    pub const TABLE: &'static str = "switches";
    pub const KEY: &'static str = "switch_id";
}

// ===================================================================
// SWITCH PORT MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct SwitchPort {
    pub switch_port_id: i32,
    pub switch_id: i32,

    // Port Identification
    pub name: String,
    pub port_index: Option<i32>,
    pub port_type: Option<String>, // ENUM: ETHERNET, SFP, SFP+, QSFP, QSFP+, QSFP28, MANAGEMENT

    // Port Configuration
    pub admin_status: Option<String>, // ENUM: UP, DOWN, TESTING
    pub oper_status: Option<String>,
    pub speed_mbps: Option<i64>,
    pub duplex: Option<String>,
    pub mtu: Option<i32>,

    // VLAN
    pub access_vlan_id: Option<i32>,
    pub native_vlan_id: Option<i32>,
    pub port_mode: Option<String>, // ENUM: ACCESS, TRUNK, HYBRID

    // Connected Device
    pub connected_device_name: Option<String>,
    pub connected_device_ip: Option<String>,
    pub connected_device_mac: Option<String>,
    pub connected_device_type: Option<String>, // ENUM: SERVER, SWITCH, ROUTER, OTHER

    // Statistics
    pub bytes_in: Option<i64>,
    pub bytes_out: Option<i64>,
    pub packets_in: Option<i64>,
    pub packets_out: Option<i64>,
    pub errors_in: Option<i64>,
    pub errors_out: Option<i64>,

    // Optical / SFP
    pub sfp_vendor: Option<String>,
    pub sfp_part_number: Option<String>,
    pub sfp_serial_number: Option<String>,
    pub optical_power_dbm: Option<Decimal>,
    pub optical_temperature_c: Option<i32>,

    pub description: Option<String>,
    pub last_flap_time: Option<chrono::DateTime<chrono::Utc>>,
    pub stats_last_updated: Option<chrono::DateTime<chrono::Utc>>,

    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl SwitchPort {
    pub const TABLE: &'static str = "switch_ports";
    pub const KEY: &'static str = "switch_port_id";
}

// ===================================================================
// SWITCH VLAN MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct SwitchVlan {
    pub vlan_db_id: i32,
    pub switch_id: i32,
    pub vlan_id: i32,
    pub vlan_name: Option<String>,
    pub vlan_status: Option<String>, // ENUM: ACTIVE, SUSPEND

    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl SwitchVlan {
    pub const TABLE: &'static str = "switch_vlans";
    pub const KEY: &'static str = "vlan_db_id";
}

// ===================================================================
// COMPOSITE STRUCTURE
// ===================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwitchWithPorts {
    #[serde(flatten)]
    pub switch: Switch,
    pub ports: Vec<SwitchPort>,
    pub vlans: Vec<SwitchVlan>,
}
