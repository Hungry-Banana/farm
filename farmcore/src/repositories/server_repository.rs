use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    Server, ServerWithAllComponents, QueryOptions,
    ServerBmcDetail
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

// Inventory data structures matching the JSON format
#[derive(Debug, serde::Deserialize)]
pub struct ServerInventory {
    pub agent_version: String,
    pub node: NodeInfo,
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub disks: Vec<DiskInfo>,
    pub network: NetworkInfo,
    pub gpus: Vec<GpuInfo>,
    pub power_supplies: Vec<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct NodeInfo {
    pub hostname: Option<String>,
    pub architecture: Option<String>,
    pub product_name: Option<String>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
    pub chassis_manufacturer: Option<String>,
    pub chassis_serial_number: Option<String>,
    pub motherboard: Option<MotherboardInfo>,
    pub bios: Option<BiosInfo>,
    pub bmc: BmcInfo,
}

#[derive(Debug, serde::Deserialize)]
pub struct MotherboardInfo {
    pub manufacturer: Option<String>,
    pub product_name: Option<String>,
    pub version: Option<String>,
    pub serial_number: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct BiosInfo {
    pub vendor: Option<String>,
    pub version: Option<String>,
    pub release_date: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct BmcInfo {
    pub ip_address: Option<String>,
    pub mac_address: Option<String>,
    pub firmware_version: Option<String>,
    pub release_date: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct CpuInfo {
    pub sockets: Option<i32>,
    pub cores: Option<i32>,
    pub threads: Option<i32>,
    pub cpus: Vec<CpuDetail>,
}

#[derive(Debug, serde::Deserialize)]
pub struct CpuDetail {
    pub socket: i32,
    pub manufacturer: Option<String>,
    pub model_name: Option<String>,
    pub num_cores: Option<i32>,
    pub num_threads: Option<i32>,
    pub capacity_mhz: Option<i32>,
    pub slot: Option<String>,
    pub l1_cache_kb: Option<i32>,
    pub l2_cache_kb: Option<i32>,
    pub l3_cache_kb: Option<i32>,
}

#[derive(Debug, serde::Deserialize)]
pub struct MemoryInfo {
    pub total_bytes: Option<i64>,
    pub dimms: Vec<DimmDetail>,
}

#[derive(Debug, serde::Deserialize)]
pub struct DimmDetail {
    pub slot: String,
    pub size_bytes: i64,
    pub mem_type: Option<String>,
    pub speed_mt_s: Option<i32>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
    pub part_number: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub dev_path: Option<String>,
    pub model: Option<String>,
    pub serial: Option<String>,
    pub size_bytes: i64,
    pub rotational: bool,
    pub bus_type: Option<String>,
    pub firmware_version: Option<String>,
    pub smart: Option<SmartInfo>,
}

#[derive(Debug, serde::Deserialize)]
pub struct SmartInfo {
    pub health: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct NetworkInfo {
    pub interfaces: Vec<NetworkInterface>,
    pub routes: Vec<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub mac_address: Option<String>,
    pub mtu: Option<i32>,
    pub speed_mbps: Option<i32>,
    pub driver: Option<String>,
    pub firmware_version: Option<String>,
    pub vendor_name: Option<String>,
    pub device_name: Option<String>,
    pub pci_address: Option<String>,
    pub addresses: Vec<NetworkAddress>,
    pub is_primary: bool,
    pub bond_group: Option<String>,
    pub bond_master: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct NetworkAddress {
    pub family: String,
    pub address: String,
    pub prefix: i32,
}

#[derive(Debug, serde::Deserialize)]
pub struct GpuInfo {
    pub vendor: Option<String>,
    pub model: Option<String>,
    pub pci_address: Option<String>,
    pub vram_mb: Option<i32>,
    pub driver_version: Option<String>,
    pub uuid: Option<String>,
}

#[async_trait]
pub trait ServerRepo: Send + Sync {
    async fn get_all_servers(&self, query: CommonPaginationQuery) -> Result<Vec<Server>, sqlx::Error>;
    async fn get_by_id(&self, id: i64) -> Result<Option<Server>, sqlx::Error>;
    async fn get_server_with_all_components(&self, server_id: i32) -> Result<Option<ServerWithAllComponents>, sqlx::Error>;
    async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_server_counts_by_type(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_server_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_server_counts_by_environment(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn update_server(&self, server_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn check_server_exists_by_mac(&self, mac_address: &str) -> Result<Option<i32>, sqlx::Error>;
    async fn create_server_from_inventory(&self, inventory: ServerInventory) -> Result<i32, sqlx::Error>;
    async fn update_server_from_inventory(&self, server_id: i32, inventory: ServerInventory) -> Result<bool, sqlx::Error>;
    async fn upsert_server_from_inventory(&self, inventory: ServerInventory) -> Result<(i32, bool), sqlx::Error>; // Returns (server_id, was_created)
}

#[derive(Clone)]
pub struct ServerRepository {
    pool: MySqlPool,
}

impl ServerRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    /// Get all servers with pagination
    pub async fn get_all_servers(&self, query: CommonPaginationQuery) -> Result<Vec<Server>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("server_id DESC".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("server_id DESC".to_string()),
        };

        QueryBuilderHelper::select(&self.pool, Server::TABLE, options).await
    }

    /// Find server by ID
    pub async fn get_by_id(&self, id: i64) -> Result<Option<Server>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, Server::TABLE, Server::KEY, id).await
    }

    /// Get server with all components by ID
    pub async fn get_server_with_all_components(&self, server_id: i32) -> Result<Option<ServerWithAllComponents>, sqlx::Error> {
        // First get the server
        let server = match self.get_by_id(server_id as i64).await? {
            Some(server) => server,
            None => return Ok(None),
        };

        // Get all components in parallel
        let (cpus, memory, disks, network_interfaces, bmc_interfaces, credentials, motherboard_detail) = tokio::try_join!(
            self.get_server_cpus(server_id),
            self.get_server_memory(server_id),
            self.get_server_disks(server_id),
            self.get_server_network_interfaces(server_id),
            self.get_server_bmc_interfaces(server_id),
            self.get_server_credentials(server_id),
            self.get_server_motherboard_detail(server_id)
        )?;

        Ok(Some(ServerWithAllComponents {
            server,
            cpus,
            memory,
            disks,
            network_interfaces,
            bmc_interfaces,
            credentials,
            motherboard_detail,
        }))
    }

    // Private helper methods for components (moved from database/repository.rs)
    async fn get_server_cpus(&self, server_id: i32) -> Result<Vec<crate::models::ServerCpuDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                sc.cpu_id,
                sc.socket_number,
                sc.slot,
                cct.manufacturer,
                cct.model_name,
                cct.num_cores,
                cct.num_threads,
                cct.capacity_mhz,
                cct.l1_cache_kb,
                cct.l2_cache_kb,
                cct.l3_cache_kb
            FROM server_cpus sc
            JOIN component_cpu_types cct ON sc.component_cpu_id = cct.component_cpu_id
            WHERE sc.server_id = ?
            ORDER BY sc.socket_number
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_memory(&self, server_id: i32) -> Result<Vec<crate::models::ServerMemoryDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                smd.dimm_id,
                smd.slot,
                smd.serial_number,
                cmt.manufacturer,
                cmt.part_number,
                cmt.size_bytes,
                cmt.speed_mt_s,
                cmt.mem_type,
                NULL as form_factor,
                NULL as voltage
            FROM server_memory_dimms smd
            JOIN component_memory_types cmt ON smd.component_memory_id = cmt.component_memory_id
            WHERE smd.server_id = ?
            ORDER BY smd.slot
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_disks(&self, server_id: i32) -> Result<Vec<crate::models::ServerDiskDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                sd.disk_id,
                sd.name,
                sd.dev_path,
                sd.serial,
                sd.firmware_version,
                sd.smart_health,
                cdt.manufacturer,
                cdt.model,
                cdt.size_bytes,
                cdt.bus_type,
                NULL as form_factor,
                NULL as rpm
            FROM server_disks sd
            JOIN component_disk_types cdt ON sd.component_disk_id = cdt.component_disk_id
            WHERE sd.server_id = ?
            ORDER BY sd.name
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_network_interfaces(&self, server_id: i32) -> Result<Vec<crate::models::ServerNetworkDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                sni.interface_id,
                sni.name,
                sni.mac_address,
                sni.ip_address,
                sni.mtu,
                sni.speed_mbps,
                sni.firmware_version,
                sni.pci_address,
                sni.is_primary,
                sni.bond_group,
                sni.bond_master,
                sni.switch_port_id,
                sni.interface_type,
                NULL as firmware_version_bmc,
                NULL as release_date,
                s.switch_id,
                s.switch_name,
                sp.name as switch_port_name,
                cnt.vendor_name as manufacturer,
                cnt.device_name as model,
                cnt.max_speed_mbps,
                NULL as num_ports
            FROM server_network_interfaces sni
            JOIN component_network_types cnt ON sni.component_network_id = cnt.component_network_id
            LEFT JOIN switch_ports sp ON sni.switch_port_id = sp.switch_port_id
            LEFT JOIN switches s ON sp.switch_id = s.switch_id
            WHERE sni.server_id = ?
            ORDER BY 
                CASE sni.interface_type
                    WHEN 'BMC' THEN 1
                    WHEN 'MANAGEMENT' THEN 2
                    ELSE 3
                END,
                sni.is_primary DESC,
                sni.name
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_bmc_interfaces(&self, server_id: i32) -> Result<Vec<ServerBmcDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                sbi.bmc_interface_id,
                sbi.name,
                sbi.mac_address,
                sbi.ip_address,
                sbi.username,
                sbi.password,
                sbi.firmware_version,
                sbi.release_date,
                sbi.supports_ipmi,
                sbi.supports_redfish,
                sbi.supports_web_interface,
                sbi.is_accessible,
                sbi.last_ping_at,
                sbi.switch_port_id,
                s.switch_id,
                s.switch_name,
                sp.name as switch_port_name,
                cnt.vendor_name as manufacturer,
                cnt.device_name as model,
                cnt.max_speed_mbps,
                NULL as num_ports
            FROM server_bmc_interfaces sbi
            JOIN component_network_types cnt ON sbi.component_network_id = cnt.component_network_id
            LEFT JOIN switch_ports sp ON sbi.switch_port_id = sp.switch_port_id
            LEFT JOIN switches s ON sp.switch_id = s.switch_id
            WHERE sbi.server_id = ?
            ORDER BY sbi.name
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_credentials(&self, server_id: i32) -> Result<Vec<crate::models::ServerCredential>, sqlx::Error> {
        let query = r#"
            SELECT 
                credential_id,
                credential_type,
                username,
                password
            FROM server_credentials
            WHERE server_id = ?
            ORDER BY credential_type, username
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn get_server_motherboard_detail(&self, server_id: i32) -> Result<Option<crate::models::ServerMotherboardDetail>, sqlx::Error> {
        let query = r#"
            SELECT 
                sm.motherboard_id,
                sm.component_motherboard_id,
                sm.serial_number,
                sm.bios_vendor,
                sm.bios_version,
                sm.bios_release_date,
                cmt.manufacturer,
                cmt.product_name,
                cmt.version,
                cmt.bios_version as recommended_bios_version,
                cmt.bmc_firmware_version as recommended_bmc_version
            FROM server_motherboards sm
            JOIN component_motherboard_types cmt ON sm.component_motherboard_id = cmt.component_motherboard_id
            WHERE sm.server_id = ?
        "#;

        sqlx::query_as(query)
            .bind(server_id)
            .fetch_optional(&self.pool)
            .await
    }

    /// Get server counts grouped by server type
    pub async fn get_server_counts_by_type(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        sqlx::query_as::<_, (String, i64)>(
            "SELECT server_type, COUNT(*) as count FROM servers GROUP BY server_type"
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Get server counts grouped by status
    pub async fn get_server_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        sqlx::query_as::<_, (String, i64)>(
            "SELECT status, COUNT(*) as count FROM servers GROUP BY status"
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Get server counts grouped by environment type
    pub async fn get_server_counts_by_environment(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        sqlx::query_as::<_, (String, i64)>(
            "SELECT environment_type, COUNT(*) as count FROM servers GROUP BY environment_type"
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Helper function to convert count tuples to JSON array
    fn counts_to_json(counts: Vec<(String, i64)>) -> Vec<serde_json::Value> {
        counts
            .into_iter()
            .map(|(name, count)| serde_json::json!({
                "name": name,
                "count": count
            }))
            .collect()
    }

    /// Helper function to find count by name (case-insensitive)
    fn find_count_by_name(stats: &[(String, i64)], name: &str) -> i64 {
        stats.iter()
            .find(|(status, _)| status.to_lowercase() == name.to_lowercase())
            .map(|(_, count)| *count)
            .unwrap_or(0)
    }

    /// Get server overview statistics
    pub async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        let total_servers: i64 = DatabaseHelper::get_total_count(&self.pool, Server::TABLE).await?;
        
        // Get all counts in parallel for better performance
        let (server_type_stats, status_stats, environment_stats) = tokio::try_join!(
            self.get_server_counts_by_type(),
            self.get_server_counts_by_status(),
            self.get_server_counts_by_environment()
        )?;

        // Convert to JSON arrays for frontend consumption
        let server_type_json = Self::counts_to_json(server_type_stats);
        let status_json = Self::counts_to_json(status_stats.clone());
        let environment_json = Self::counts_to_json(environment_stats);

        let stats = serde_json::json!({
            "total_servers": total_servers,
            "by_server_type": server_type_json,
            "by_status": status_json,
            "by_environment": environment_json
        });
        
        Ok(stats)
    }

    /// Check if a server exists by primary NIC MAC address
    pub async fn check_server_exists_by_mac(&self, mac_address: &str) -> Result<Option<i32>, sqlx::Error> {
        let query = r#"
            SELECT s.server_id
            FROM servers s
            JOIN server_network_interfaces sni ON s.server_id = sni.server_id
            WHERE sni.mac_address = ? AND sni.is_primary = 1
            LIMIT 1
        "#;

        let result: Option<(i32,)> = sqlx::query_as(query)
            .bind(mac_address)
            .fetch_optional(&self.pool)
            .await?;

        Ok(result.map(|(id,)| id))
    }

    /// Update server with dynamic field updates
    /// Takes a HashMap of field names to values and builds a dynamic UPDATE query
    pub async fn update_server(
        &self,
        server_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        // Get all field names from Server struct using serde
        let server_fields: std::collections::HashSet<String> = {
            let default_server = Server::default();
            match serde_json::to_value(&default_server) {
                Ok(serde_json::Value::Object(map)) => {
                    map.keys().cloned().collect()
                },
                _ => return Err(sqlx::Error::Protocol(
                    "Failed to extract Server field names".to_string()
                ))
            }
        };

        // Blacklist of fields that should never be updated (auto-managed or immutable)
        let blacklisted_fields = [
            "server_id", "created_at", "updated_at", "last_inventory_at", "component_motherboard_id"
        ];

        // Filter and validate updates
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in updates.iter() {
            // Check if field exists in Server struct
            if !server_fields.contains(field) {
                return Err(sqlx::Error::Protocol(
                    format!("Field '{}' does not exist in Server model", field)
                ));
            }

            // Check if field is blacklisted
            if blacklisted_fields.contains(&field.as_str()) {
                return Err(sqlx::Error::Protocol(
                    format!("Field '{}' is not allowed to be updated", field)
                ));
            }

            set_clauses.push(format!("{} = ?", field));
            
            // Convert JSON value to SQL-compatible string
            let sql_value = match value {
                serde_json::Value::Null => "NULL".to_string(),
                serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''").replace("\\", "\\\\")),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                _ => return Err(sqlx::Error::Protocol(
                    format!("Unsupported value type for field '{}'", field)
                )),
            };
            values.push(sql_value);
        }

        // Build the UPDATE query
        let query = format!(
            "UPDATE {} SET {}, updated_at = NOW() WHERE server_id = {}",
            Server::TABLE,
            set_clauses.join(", ").replace("?", "&"),
            server_id
        );

        // Replace placeholders with actual values
        let mut final_query = query;
        for value in values {
            final_query = final_query.replacen("&", &value, 1);
        }

        // Execute the update
        let result = sqlx::query(&final_query)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Create a new server from inventory data
    /// Validates components exist in database and creates server with all components
    pub async fn create_server_from_inventory(
        &self,
        inventory: ServerInventory
    ) -> Result<i32, sqlx::Error> {
        // Find primary NIC MAC address
        let primary_nic = inventory.network.interfaces.iter()
            .find(|iface| iface.is_primary)
            .ok_or_else(|| sqlx::Error::Protocol("No primary network interface found".to_string()))?;

        let primary_mac = primary_nic.mac_address.as_ref()
            .ok_or_else(|| sqlx::Error::Protocol("Primary network interface has no MAC address".to_string()))?;

        // Check if server already exists
        if let Some(existing_id) = self.check_server_exists_by_mac(primary_mac).await? {
            return Err(sqlx::Error::Protocol(
                format!("Server already exists with MAC address {} (server_id: {})", primary_mac, existing_id)
            ));
        }

        // Start transaction
        let mut tx = self.pool.begin().await?;

        // 1. Find or create motherboard component type
        let motherboard_id = if let Some(ref mb) = inventory.node.motherboard {
            self.find_or_create_motherboard_type(&mut tx, mb).await?
        } else {
            None
        };

        // Parse BIOS release date
        let bios_release_date = inventory.node.bios.as_ref()
            .and_then(|bios| bios.release_date.as_ref())
            .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());

        // 2. Create server record
        let server_insert = r#"
            INSERT INTO servers (
                agent_version, architecture,
                chassis_manufacturer, chassis_serial_number,
                manufacturer, product_name, serial_number,
                server_name, server_type, stage, state, status, environment_type,
                last_inventory_at, created_at, updated_at
            ) VALUES (
                ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, 'BAREMETAL', 'DISCOVERY', 'NEW', 'ACTIVE', 'PRODUCTION',
                NOW(), NOW(), NOW()
            )
        "#;

        let server_result = sqlx::query(server_insert)
            .bind(&inventory.agent_version)
            .bind(&inventory.node.architecture)
            .bind(&inventory.node.chassis_manufacturer)
            .bind(&inventory.node.chassis_serial_number)
            .bind(&inventory.node.manufacturer)
            .bind(&inventory.node.product_name)
            .bind(&inventory.node.serial_number)
            .bind(&inventory.node.hostname)
            .execute(&mut *tx)
            .await?;

        let server_id = server_result.last_insert_id() as i32;

        // 3. Add all components
        self.insert_server_components(&mut tx, server_id, &inventory).await?;

        // Commit transaction
        tx.commit().await?;

        Ok(server_id)
    }

    /// Update an existing server from inventory data
    /// Only updates components that have changed (intelligent diff)
    pub async fn update_server_from_inventory(
        &self,
        server_id: i32,
        inventory: ServerInventory
    ) -> Result<bool, sqlx::Error> {
        // Start transaction
        let mut tx = self.pool.begin().await?;

        // 1. Find or create motherboard component type
        let motherboard_id = if let Some(ref mb) = inventory.node.motherboard {
            self.find_or_create_motherboard_type(&mut tx, mb).await?
        } else {
            None
        };

        // Parse BIOS release date
        let bios_release_date = inventory.node.bios.as_ref()
            .and_then(|bios| bios.release_date.as_ref())
            .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());

        // 2. Update server record
        sqlx::query(r#"
            UPDATE servers SET
                agent_version = ?,
                architecture = ?,
                chassis_manufacturer = ?,
                chassis_serial_number = ?,
                manufacturer = ?,
                product_name = ?,
                serial_number = ?,
                server_name = ?,
                last_inventory_at = NOW(),
                updated_at = NOW()
            WHERE server_id = ?
        "#)
        .bind(&inventory.agent_version)
        .bind(&inventory.node.architecture)
        .bind(&inventory.node.chassis_manufacturer)
        .bind(&inventory.node.chassis_serial_number)
        .bind(&inventory.node.manufacturer)
        .bind(&inventory.node.product_name)
        .bind(&inventory.node.serial_number)
        .bind(&inventory.node.hostname)
        .bind(server_id)
        .execute(&mut *tx)
        .await?;

        // 3. Update components intelligently (only what changed)
        self.sync_server_motherboard(&mut tx, server_id, &inventory.node.motherboard, &inventory.node.bios).await?;
        self.sync_server_cpus(&mut tx, server_id, &inventory.cpu.cpus).await?;
        self.sync_server_memory(&mut tx, server_id, &inventory.memory.dimms).await?;
        self.sync_server_disks(&mut tx, server_id, &inventory.disks).await?;
        self.sync_server_network_interfaces(&mut tx, server_id, &inventory.network.interfaces).await?;
        self.sync_server_bmc(&mut tx, server_id, &inventory.node.bmc).await?;

        // Commit transaction
        tx.commit().await?;

        Ok(true)
    }

    // Component sync methods - intelligently add/update/delete based on diff
    
    async fn sync_server_motherboard(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        motherboard_info: &Option<MotherboardInfo>,
        bios_info: &Option<BiosInfo>
    ) -> Result<(), sqlx::Error> {
        // Get existing motherboard
        let existing: Option<(i32, Option<i32>, Option<String>, Option<String>, Option<String>)> = sqlx::query_as(
            "SELECT motherboard_id, component_motherboard_id, serial_number, bios_vendor, bios_version FROM server_motherboards WHERE server_id = ?"
        )
        .bind(server_id)
        .fetch_optional(&mut **tx)
        .await?;

        if let Some(ref mb_info) = motherboard_info {
            let motherboard_type_id = self.find_or_create_motherboard_type(tx, mb_info).await?;
            
            let bios_release_date = bios_info.as_ref()
                .and_then(|bios| bios.release_date.as_ref())
                .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());

            if let Some((mb_id, existing_type_id, existing_serial, existing_vendor, existing_version)) = existing {
                // Update if anything changed
                let needs_update = existing_type_id != motherboard_type_id
                    || existing_serial != mb_info.serial_number
                    || existing_vendor != bios_info.as_ref().and_then(|b| b.vendor.clone())
                    || existing_version != bios_info.as_ref().and_then(|b| b.version.clone());

                if needs_update {
                    sqlx::query(r#"
                        UPDATE server_motherboards SET
                            component_motherboard_id = ?,
                            serial_number = ?,
                            bios_vendor = ?,
                            bios_version = ?,
                            bios_release_date = ?
                        WHERE motherboard_id = ?
                    "#)
                    .bind(motherboard_type_id)
                    .bind(&mb_info.serial_number)
                    .bind(bios_info.as_ref().and_then(|b| b.vendor.as_ref()))
                    .bind(bios_info.as_ref().and_then(|b| b.version.as_ref()))
                    .bind(bios_release_date)
                    .bind(mb_id)
                    .execute(&mut **tx)
                    .await?;
                }
            } else {
                // Insert new motherboard
                sqlx::query(r#"
                    INSERT INTO server_motherboards (
                        server_id, component_motherboard_id, serial_number,
                        bios_vendor, bios_version, bios_release_date
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                "#)
                .bind(server_id)
                .bind(motherboard_type_id)
                .bind(&mb_info.serial_number)
                .bind(bios_info.as_ref().and_then(|b| b.vendor.as_ref()))
                .bind(bios_info.as_ref().and_then(|b| b.version.as_ref()))
                .bind(bios_release_date)
                .execute(&mut **tx)
                .await?;
            }
        } else if existing.is_some() {
            // No motherboard in inventory, remove if exists
            sqlx::query("DELETE FROM server_motherboards WHERE server_id = ?")
                .bind(server_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }
    
    async fn sync_server_cpus(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        inventory_cpus: &[CpuDetail]
    ) -> Result<(), sqlx::Error> {
        // Get existing CPUs
        let existing: Vec<(i32, i32, Option<String>)> = sqlx::query_as(
            "SELECT cpu_id, socket_number, slot FROM server_cpus WHERE server_id = ?"
        )
        .bind(server_id)
        .fetch_all(&mut **tx)
        .await?;

        let mut existing_sockets: HashMap<i32, (i32, Option<String>)> = existing.into_iter()
            .map(|(cpu_id, socket, slot)| (socket, (cpu_id, slot)))
            .collect();

        // Process inventory CPUs
        for cpu in inventory_cpus {
            let cpu_type_id = self.find_or_create_cpu_type(tx, cpu).await?;

            if let Some((cpu_id, existing_slot)) = existing_sockets.remove(&cpu.socket) {
                // Update if slot or type changed
                if existing_slot.as_ref() != cpu.slot.as_ref() {
                    sqlx::query("UPDATE server_cpus SET component_cpu_id = ?, slot = ? WHERE cpu_id = ?")
                        .bind(cpu_type_id)
                        .bind(&cpu.slot)
                        .bind(cpu_id)
                        .execute(&mut **tx)
                        .await?;
                }
            } else {
                // Insert new CPU
                sqlx::query("INSERT INTO server_cpus (server_id, component_cpu_id, socket_number, slot) VALUES (?, ?, ?, ?)")
                    .bind(server_id)
                    .bind(cpu_type_id)
                    .bind(cpu.socket)
                    .bind(&cpu.slot)
                    .execute(&mut **tx)
                    .await?;
            }
        }

        // Delete CPUs no longer present
        for (cpu_id, _) in existing_sockets.values() {
            sqlx::query("DELETE FROM server_cpus WHERE cpu_id = ?")
                .bind(cpu_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }

    async fn sync_server_memory(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        inventory_dimms: &[DimmDetail]
    ) -> Result<(), sqlx::Error> {
        // Get existing DIMMs
        let existing: Vec<(i32, String, Option<String>)> = sqlx::query_as(
            "SELECT dimm_id, slot, serial_number FROM server_memory_dimms WHERE server_id = ?"
        )
        .bind(server_id)
        .fetch_all(&mut **tx)
        .await?;

        let mut existing_slots: HashMap<String, (i32, Option<String>)> = existing.into_iter()
            .map(|(dimm_id, slot, serial)| (slot, (dimm_id, serial)))
            .collect();

        // Process inventory DIMMs
        for dimm in inventory_dimms {
            let memory_type_id = self.find_or_create_memory_type(tx, dimm).await?;

            if let Some((dimm_id, existing_serial)) = existing_slots.remove(&dimm.slot) {
                // Update if serial or type changed
                if existing_serial.as_ref() != dimm.serial_number.as_ref() {
                    sqlx::query("UPDATE server_memory_dimms SET component_memory_id = ?, serial_number = ? WHERE dimm_id = ?")
                        .bind(memory_type_id)
                        .bind(&dimm.serial_number)
                        .bind(dimm_id)
                        .execute(&mut **tx)
                        .await?;
                }
            } else {
                // Insert new DIMM
                sqlx::query("INSERT INTO server_memory_dimms (server_id, component_memory_id, slot, serial_number) VALUES (?, ?, ?, ?)")
                    .bind(server_id)
                    .bind(memory_type_id)
                    .bind(&dimm.slot)
                    .bind(&dimm.serial_number)
                    .execute(&mut **tx)
                    .await?;
            }
        }

        // Delete DIMMs no longer present
        for (dimm_id, _) in existing_slots.values() {
            sqlx::query("DELETE FROM server_memory_dimms WHERE dimm_id = ?")
                .bind(dimm_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }

    async fn sync_server_disks(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        inventory_disks: &[DiskInfo]
    ) -> Result<(), sqlx::Error> {
        // Get existing disks
        let existing: Vec<(i32, String, Option<String>, Option<String>, Option<String>)> = sqlx::query_as(
            "SELECT disk_id, name, dev_path, serial, firmware_version FROM server_disks WHERE server_id = ?"
        )
        .bind(server_id)
        .fetch_all(&mut **tx)
        .await?;

        // Match by serial number (most reliable), fallback to name
        let mut existing_disks: HashMap<String, (i32, String, Option<String>, Option<String>, Option<String>)> = HashMap::new();
        for (disk_id, name, dev_path, serial, firmware) in existing {
            let key = serial.clone().unwrap_or_else(|| name.clone());
            existing_disks.insert(key, (disk_id, name, dev_path, serial, firmware));
        }

        // Process inventory disks
        for disk in inventory_disks {
            let disk_type_id = self.find_or_create_disk_type(tx, disk).await?;
            let key = disk.serial.clone().unwrap_or_else(|| disk.name.clone());
            let smart_health = disk.smart.as_ref().and_then(|s| s.health.as_ref()).map(|h| h.as_str());

            if let Some((disk_id, existing_name, existing_dev_path, existing_serial, existing_firmware)) = existing_disks.remove(&key) {
                // Update if any field changed
                let needs_update = existing_name != disk.name
                    || existing_dev_path != disk.dev_path
                    || existing_serial != disk.serial
                    || existing_firmware != disk.firmware_version;

                if needs_update {
                    sqlx::query(r#"
                        UPDATE server_disks SET 
                            component_disk_id = ?,
                            name = ?,
                            dev_path = ?,
                            serial = ?,
                            firmware_version = ?,
                            smart_health = ?
                        WHERE disk_id = ?
                    "#)
                    .bind(disk_type_id)
                    .bind(&disk.name)
                    .bind(&disk.dev_path)
                    .bind(&disk.serial)
                    .bind(&disk.firmware_version)
                    .bind(smart_health)
                    .bind(disk_id)
                    .execute(&mut **tx)
                    .await?;
                }
            } else {
                // Insert new disk
                sqlx::query(r#"
                    INSERT INTO server_disks (
                        server_id, component_disk_id, name, dev_path, serial, 
                        firmware_version, smart_health
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                "#)
                .bind(server_id)
                .bind(disk_type_id)
                .bind(&disk.name)
                .bind(&disk.dev_path)
                .bind(&disk.serial)
                .bind(&disk.firmware_version)
                .bind(smart_health)
                .execute(&mut **tx)
                .await?;
            }
        }

        // Delete disks no longer present
        for (disk_id, _, _, _, _) in existing_disks.values() {
            sqlx::query("DELETE FROM server_disks WHERE disk_id = ?")
                .bind(disk_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }

    async fn sync_server_network_interfaces(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        inventory_interfaces: &[NetworkInterface]
    ) -> Result<(), sqlx::Error> {
        // Get existing interfaces
        let existing: Vec<(i32, String, Option<String>, Option<String>, Option<i32>, Option<i32>, Option<String>, Option<String>, Option<bool>)> = sqlx::query_as(
            "SELECT interface_id, name, mac_address, ip_address, mtu, speed_mbps, firmware_version, pci_address, is_primary FROM server_network_interfaces WHERE server_id = ?"
        )
        .bind(server_id)
        .fetch_all(&mut **tx)
        .await?;

        // Match by MAC address (most reliable)
        let mut existing_interfaces: HashMap<String, (i32, String, Option<String>, Option<i32>, Option<i32>, Option<String>, Option<String>, Option<bool>)> = HashMap::new();
        for (iface_id, name, mac, ip, mtu, speed, firmware, pci, is_primary) in existing {
            if let Some(mac_addr) = mac {
                existing_interfaces.insert(mac_addr.to_lowercase(), (iface_id, name, ip, mtu, speed, firmware, pci, is_primary));
            }
        }

        // Process inventory interfaces
        for iface in inventory_interfaces {
            if let Some(mac) = &iface.mac_address {
                let network_type_id = self.find_or_create_network_type(tx, iface).await?;
                let ip_address = iface.addresses.first().map(|addr| addr.address.clone());
                let mac_lower = mac.to_lowercase();

                if let Some((iface_id, existing_name, existing_ip, existing_mtu, existing_speed, existing_firmware, existing_pci, existing_is_primary)) = existing_interfaces.remove(&mac_lower) {
                    // Update if any field changed
                    let needs_update = existing_name != iface.name
                        || existing_ip != ip_address
                        || existing_mtu != iface.mtu
                        || existing_speed != iface.speed_mbps
                        || existing_firmware != iface.firmware_version
                        || existing_pci != iface.pci_address
                        || existing_is_primary != Some(iface.is_primary);

                    if needs_update {
                        sqlx::query(r#"
                            UPDATE server_network_interfaces SET
                                component_network_id = ?,
                                name = ?,
                                ip_address = ?,
                                mtu = ?,
                                speed_mbps = ?,
                                firmware_version = ?,
                                pci_address = ?,
                                is_primary = ?,
                                bond_group = ?,
                                bond_master = ?
                            WHERE interface_id = ?
                        "#)
                        .bind(network_type_id)
                        .bind(&iface.name)
                        .bind(ip_address)
                        .bind(iface.mtu)
                        .bind(iface.speed_mbps)
                        .bind(&iface.firmware_version)
                        .bind(&iface.pci_address)
                        .bind(iface.is_primary)
                        .bind(&iface.bond_group)
                        .bind(&iface.bond_master)
                        .bind(iface_id)
                        .execute(&mut **tx)
                        .await?;
                    }
                } else {
                    // Insert new interface
                    sqlx::query(r#"
                        INSERT INTO server_network_interfaces (
                            server_id, component_network_id, name, mac_address, ip_address,
                            mtu, speed_mbps, firmware_version, pci_address, is_primary,
                            bond_group, bond_master, interface_type
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGULAR')
                    "#)
                    .bind(server_id)
                    .bind(network_type_id)
                    .bind(&iface.name)
                    .bind(&iface.mac_address)
                    .bind(ip_address)
                    .bind(iface.mtu)
                    .bind(iface.speed_mbps)
                    .bind(&iface.firmware_version)
                    .bind(&iface.pci_address)
                    .bind(iface.is_primary)
                    .bind(&iface.bond_group)
                    .bind(&iface.bond_master)
                    .execute(&mut **tx)
                    .await?;
                }
            }
        }

        // Delete interfaces no longer present
        for (iface_id, _, _, _, _, _, _, _) in existing_interfaces.values() {
            sqlx::query("DELETE FROM server_network_interfaces WHERE interface_id = ?")
                .bind(iface_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }

    async fn sync_server_bmc(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        bmc_info: &BmcInfo
    ) -> Result<(), sqlx::Error> {
        if let Some(mac) = &bmc_info.mac_address {
            // Check if BMC already exists
            let existing: Option<(i32,)> = sqlx::query_as(
                "SELECT bmc_interface_id FROM server_bmc_interfaces WHERE server_id = ? LIMIT 1"
            )
            .bind(server_id)
            .fetch_optional(&mut **tx)
            .await?;

            let bmc_release_date = bmc_info.release_date.as_ref()
                .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());

            if let Some((bmc_id,)) = existing {
                // Update existing BMC
                sqlx::query(r#"
                    UPDATE server_bmc_interfaces SET
                        mac_address = ?,
                        ip_address = ?,
                        firmware_version = ?,
                        release_date = ?
                    WHERE bmc_interface_id = ?
                "#)
                .bind(mac)
                .bind(&bmc_info.ip_address)
                .bind(&bmc_info.firmware_version)
                .bind(bmc_release_date)
                .bind(bmc_id)
                .execute(&mut **tx)
                .await?;
            } else {
                // Insert new BMC
                sqlx::query(r#"
                    INSERT INTO server_bmc_interfaces (
                        server_id, name, mac_address, ip_address, firmware_version,
                        release_date, supports_ipmi, supports_redfish, supports_web_interface,
                        is_accessible
                    )
                    VALUES (?, 'bmc0', ?, ?, ?, ?, 1, 1, 1, 0)
                "#)
                .bind(server_id)
                .bind(mac)
                .bind(&bmc_info.ip_address)
                .bind(&bmc_info.firmware_version)
                .bind(bmc_release_date)
                .execute(&mut **tx)
                .await?;
            }
        } else {
            // No BMC in inventory, remove if exists
            sqlx::query("DELETE FROM server_bmc_interfaces WHERE server_id = ?")
                .bind(server_id)
                .execute(&mut **tx)
                .await?;
        }

        Ok(())
    }

    /// Create or update server from inventory data
    /// Returns (server_id, was_created) where was_created is true if server was newly created
    pub async fn upsert_server_from_inventory(
        &self,
        inventory: ServerInventory
    ) -> Result<(i32, bool), sqlx::Error> {
        // Find primary NIC MAC address
        let primary_nic = inventory.network.interfaces.iter()
            .find(|iface| iface.is_primary)
            .ok_or_else(|| sqlx::Error::Protocol("No primary network interface found".to_string()))?;

        let primary_mac = primary_nic.mac_address.as_ref()
            .ok_or_else(|| sqlx::Error::Protocol("Primary network interface has no MAC address".to_string()))?;

        // Check if server already exists
        if let Some(existing_id) = self.check_server_exists_by_mac(primary_mac).await? {
            // Update existing server
            self.update_server_from_inventory(existing_id, inventory).await?;
            Ok((existing_id, false))
        } else {
            // Create new server
            let server_id = self.create_server_from_inventory(inventory).await?;
            Ok((server_id, true))
        }
    }

    // Helper methods for finding or creating component types
    
    /// Insert all components for a server from inventory
    /// This is used by both create and update operations
    async fn insert_server_components(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        server_id: i32,
        inventory: &ServerInventory
    ) -> Result<(), sqlx::Error> {
        // 1. Add Motherboard
        if let Some(ref mb_info) = inventory.node.motherboard {
            let motherboard_type_id = self.find_or_create_motherboard_type(tx, mb_info).await?;
            
            let bios_release_date = inventory.node.bios.as_ref()
                .and_then(|bios| bios.release_date.as_ref())
                .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());
            
            sqlx::query(r#"
                INSERT INTO server_motherboards (
                    server_id, component_motherboard_id, serial_number,
                    bios_vendor, bios_version, bios_release_date
                )
                VALUES (?, ?, ?, ?, ?, ?)
            "#)
            .bind(server_id)
            .bind(motherboard_type_id)
            .bind(&mb_info.serial_number)
            .bind(inventory.node.bios.as_ref().and_then(|b| b.vendor.as_ref()))
            .bind(inventory.node.bios.as_ref().and_then(|b| b.version.as_ref()))
            .bind(bios_release_date)
            .execute(&mut **tx)
            .await?;
        }

        // 2. Add CPUs
        for cpu in &inventory.cpu.cpus {
            let cpu_type_id = self.find_or_create_cpu_type(tx, cpu).await?;
            
            sqlx::query(r#"
                INSERT INTO server_cpus (server_id, component_cpu_id, socket_number, slot)
                VALUES (?, ?, ?, ?)
            "#)
            .bind(server_id)
            .bind(cpu_type_id)
            .bind(cpu.socket)
            .bind(&cpu.slot)
            .execute(&mut **tx)
            .await?;
        }

        // 3. Add Memory DIMMs
        for dimm in &inventory.memory.dimms {
            let memory_type_id = self.find_or_create_memory_type(tx, dimm).await?;
            
            sqlx::query(r#"
                INSERT INTO server_memory_dimms (server_id, component_memory_id, slot, serial_number)
                VALUES (?, ?, ?, ?)
            "#)
            .bind(server_id)
            .bind(memory_type_id)
            .bind(&dimm.slot)
            .bind(&dimm.serial_number)
            .execute(&mut **tx)
            .await?;
        }

        // 4. Add Disks
        for disk in &inventory.disks {
            let disk_type_id = self.find_or_create_disk_type(tx, disk).await?;
            
            let smart_health = disk.smart.as_ref()
                .and_then(|s| s.health.as_ref())
                .map(|h| h.as_str());
            
            sqlx::query(r#"
                INSERT INTO server_disks (
                    server_id, component_disk_id, name, dev_path, serial, 
                    firmware_version, smart_health
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#)
            .bind(server_id)
            .bind(disk_type_id)
            .bind(&disk.name)
            .bind(&disk.dev_path)
            .bind(&disk.serial)
            .bind(&disk.firmware_version)
            .bind(smart_health)
            .execute(&mut **tx)
            .await?;
        }

        // 4. Add Network Interfaces
        for iface in &inventory.network.interfaces {
            let network_type_id = self.find_or_create_network_type(tx, iface).await?;
            
            let ip_address = iface.addresses.first()
                .map(|addr| addr.address.clone());
            
            sqlx::query(r#"
                INSERT INTO server_network_interfaces (
                    server_id, component_network_id, name, mac_address, ip_address,
                    mtu, speed_mbps, firmware_version, pci_address, is_primary,
                    bond_group, bond_master, interface_type
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGULAR')
            "#)
            .bind(server_id)
            .bind(network_type_id)
            .bind(&iface.name)
            .bind(&iface.mac_address)
            .bind(ip_address)
            .bind(iface.mtu)
            .bind(iface.speed_mbps)
            .bind(&iface.firmware_version)
            .bind(&iface.pci_address)
            .bind(iface.is_primary)
            .bind(&iface.bond_group)
            .bind(&iface.bond_master)
            .execute(&mut **tx)
            .await?;
        }

        // 6. Add BMC interface if present
        if inventory.node.bmc.mac_address.is_some() {
            let bmc_release_date = inventory.node.bmc.release_date.as_ref()
                .and_then(|date_str| chrono::NaiveDate::parse_from_str(date_str, "%m/%d/%Y").ok());

            sqlx::query(r#"
                INSERT INTO server_bmc_interfaces (
                    server_id, name, mac_address, ip_address, firmware_version,
                    release_date, supports_ipmi, supports_redfish, supports_web_interface,
                    is_accessible
                )
                VALUES (?, 'bmc0', ?, ?, ?, ?, 1, 1, 1, 0)
            "#)
            .bind(server_id)
            .bind(&inventory.node.bmc.mac_address)
            .bind(&inventory.node.bmc.ip_address)
            .bind(&inventory.node.bmc.firmware_version)
            .bind(bmc_release_date)
            .execute(&mut **tx)
            .await?;
        }

        Ok(())
    }

    async fn find_or_create_motherboard_type(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        motherboard: &MotherboardInfo
    ) -> Result<Option<i32>, sqlx::Error> {
        if motherboard.manufacturer.is_none() && motherboard.product_name.is_none() {
            return Ok(None);
        }

        // Try to find existing
        let existing: Option<(i32,)> = sqlx::query_as(r#"
            SELECT component_motherboard_id
            FROM component_motherboard_types
            WHERE manufacturer = ? AND product_name = ?
            LIMIT 1
        "#)
        .bind(&motherboard.manufacturer)
        .bind(&motherboard.product_name)
        .fetch_optional(&mut **tx)
        .await?;

        if let Some((id,)) = existing {
            return Ok(Some(id));
        }

        // Create new
        let result = sqlx::query(r#"
            INSERT INTO component_motherboard_types (manufacturer, product_name, version)
            VALUES (?, ?, ?)
        "#)
        .bind(&motherboard.manufacturer)
        .bind(&motherboard.product_name)
        .bind(&motherboard.version)
        .execute(&mut **tx)
        .await?;

        Ok(Some(result.last_insert_id() as i32))
    }

    async fn find_or_create_cpu_type(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        cpu: &CpuDetail
    ) -> Result<i32, sqlx::Error> {
        // Try to find existing
        let existing: Option<(i32,)> = sqlx::query_as(r#"
            SELECT component_cpu_id
            FROM component_cpu_types
            WHERE manufacturer = ? AND model_name = ?
            LIMIT 1
        "#)
        .bind(&cpu.manufacturer)
        .bind(&cpu.model_name)
        .fetch_optional(&mut **tx)
        .await?;

        if let Some((id,)) = existing {
            return Ok(id);
        }

        // Create new
        let result = sqlx::query(r#"
            INSERT INTO component_cpu_types (
                manufacturer, model_name, num_cores, num_threads, capacity_mhz,
                l1_cache_kb, l2_cache_kb, l3_cache_kb
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#)
        .bind(&cpu.manufacturer)
        .bind(&cpu.model_name)
        .bind(cpu.num_cores)
        .bind(cpu.num_threads)
        .bind(cpu.capacity_mhz)
        .bind(cpu.l1_cache_kb)
        .bind(cpu.l2_cache_kb)
        .bind(cpu.l3_cache_kb)
        .execute(&mut **tx)
        .await?;

        Ok(result.last_insert_id() as i32)
    }

    async fn find_or_create_memory_type(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        dimm: &DimmDetail
    ) -> Result<i32, sqlx::Error> {
        // Try to find existing by part number (most specific)
        if let Some(part_number) = &dimm.part_number {
            let existing: Option<(i32,)> = sqlx::query_as(r#"
                SELECT component_memory_id
                FROM component_memory_types
                WHERE part_number = ?
                LIMIT 1
            "#)
            .bind(part_number.trim())
            .fetch_optional(&mut **tx)
            .await?;

            if let Some((id,)) = existing {
                return Ok(id);
            }
        }

        // Create new
        let result = sqlx::query(r#"
            INSERT INTO component_memory_types (
                manufacturer, part_number, size_bytes, mem_type, speed_mt_s
            )
            VALUES (?, ?, ?, ?, ?)
        "#)
        .bind(&dimm.manufacturer)
        .bind(dimm.part_number.as_ref().map(|s| s.trim()))
        .bind(dimm.size_bytes)
        .bind(&dimm.mem_type)
        .bind(dimm.speed_mt_s)
        .execute(&mut **tx)
        .await?;

        Ok(result.last_insert_id() as i32)
    }

    async fn find_or_create_disk_type(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        disk: &DiskInfo
    ) -> Result<i32, sqlx::Error> {
        // Try to find existing by model
        if let Some(model) = &disk.model {
            let existing: Option<(i32,)> = sqlx::query_as(r#"
                SELECT component_disk_id
                FROM component_disk_types
                WHERE model = ?
                LIMIT 1
            "#)
            .bind(model)
            .fetch_optional(&mut **tx)
            .await?;

            if let Some((id,)) = existing {
                return Ok(id);
            }
        }

        // Extract manufacturer from model or use generic
        let manufacturer = disk.model.as_ref()
            .and_then(|m| m.split_whitespace().next())
            .map(|s| s.to_string());

        // Create new
        let result = sqlx::query(r#"
            INSERT INTO component_disk_types (
                manufacturer, model, size_bytes, bus_type
            )
            VALUES (?, ?, ?, ?)
        "#)
        .bind(manufacturer)
        .bind(&disk.model)
        .bind(disk.size_bytes)
        .bind(&disk.bus_type)
        .execute(&mut **tx)
        .await?;

        Ok(result.last_insert_id() as i32)
    }

    async fn find_or_create_network_type(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::MySql>,
        iface: &NetworkInterface
    ) -> Result<i32, sqlx::Error> {
        // Try to find existing by vendor and device name
        if let (Some(vendor), Some(device)) = (&iface.vendor_name, &iface.device_name) {
            let existing: Option<(i32,)> = sqlx::query_as(r#"
                SELECT component_network_id
                FROM component_network_types
                WHERE vendor_name = ? AND device_name = ?
                LIMIT 1
            "#)
            .bind(vendor)
            .bind(device)
            .fetch_optional(&mut **tx)
            .await?;

            if let Some((id,)) = existing {
                return Ok(id);
            }
        }

        // Create new
        let result = sqlx::query(r#"
            INSERT INTO component_network_types (
                vendor_name, device_name, max_speed_mbps
            )
            VALUES (?, ?, ?)
        "#)
        .bind(&iface.vendor_name)
        .bind(&iface.device_name)
        .bind(iface.speed_mbps)
        .execute(&mut **tx)
        .await?;

        Ok(result.last_insert_id() as i32)
    }
}

#[async_trait]
impl ServerRepo for ServerRepository {
    async fn get_all_servers(&self, query: CommonPaginationQuery) -> Result<Vec<Server>, sqlx::Error> {
        ServerRepository::get_all_servers(self, query).await
    }

    async fn get_by_id(&self, id: i64) -> Result<Option<Server>, sqlx::Error> {
        ServerRepository::get_by_id(self, id).await
    }

    async fn get_server_with_all_components(&self, server_id: i32) -> Result<Option<ServerWithAllComponents>, sqlx::Error> {
        ServerRepository::get_server_with_all_components(self, server_id).await
    }

    async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        ServerRepository::get_overview_stats(self).await
    }

    async fn get_server_counts_by_type(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        ServerRepository::get_server_counts_by_type(self).await
    }

    async fn get_server_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        ServerRepository::get_server_counts_by_status(self).await
    }

    async fn get_server_counts_by_environment(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        ServerRepository::get_server_counts_by_environment(self).await
    }

    async fn update_server(&self, server_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        ServerRepository::update_server(self, server_id, updates).await
    }

    async fn check_server_exists_by_mac(&self, mac_address: &str) -> Result<Option<i32>, sqlx::Error> {
        ServerRepository::check_server_exists_by_mac(self, mac_address).await
    }

    async fn create_server_from_inventory(&self, inventory: ServerInventory) -> Result<i32, sqlx::Error> {
        ServerRepository::create_server_from_inventory(self, inventory).await
    }

    async fn update_server_from_inventory(&self, server_id: i32, inventory: ServerInventory) -> Result<bool, sqlx::Error> {
        ServerRepository::update_server_from_inventory(self, server_id, inventory).await
    }

    async fn upsert_server_from_inventory(&self, inventory: ServerInventory) -> Result<(i32, bool), sqlx::Error> {
        ServerRepository::upsert_server_from_inventory(self, inventory).await
    }
}