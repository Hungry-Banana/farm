use sqlx::MySqlPool;
use async_trait::async_trait;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    Server, ServerWithAllComponents, QueryOptions,
    ServerBmcDetail
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

#[async_trait]
pub trait ServerRepo: Send + Sync {
    async fn get_all_servers(&self, query: CommonPaginationQuery) -> Result<Vec<Server>, sqlx::Error>;
    async fn get_by_id(&self, id: i64) -> Result<Option<Server>, sqlx::Error>;
    async fn get_server_with_all_components(&self, server_id: i32) -> Result<Option<ServerWithAllComponents>, sqlx::Error>;
    async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_server_counts_by_type(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_server_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_server_counts_by_environment(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
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
                s.component_motherboard_id,
                s.motherboard_serial_number,
                s.bios_vendor,
                s.bios_version,
                s.bios_release_date,
                cmt.manufacturer,
                cmt.product_name,
                cmt.version,
                cmt.bios_version as recommended_bios_version,
                cmt.bmc_firmware_version as recommended_bmc_version
            FROM servers s
            LEFT JOIN component_motherboard_types cmt ON s.component_motherboard_id = cmt.component_motherboard_id
            WHERE s.server_id = ?
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
}