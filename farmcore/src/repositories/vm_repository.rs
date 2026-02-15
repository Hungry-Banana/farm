use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    VirtualMachine, VmWithAllComponents, VmDisk, VmNetworkInterface, VmSnapshot, QueryOptions
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

#[async_trait]
pub trait VmRepo: Send + Sync {
    async fn get_all_vms(&self, query: CommonPaginationQuery) -> Result<Vec<VirtualMachine>, sqlx::Error>;
    async fn get_by_id(&self, id: i64) -> Result<Option<VirtualMachine>, sqlx::Error>;
    async fn get_vms_by_server_id(&self, server_id: i32) -> Result<Vec<VirtualMachine>, sqlx::Error>;
    async fn get_vm_with_all_components(&self, vm_id: i32) -> Result<Option<VmWithAllComponents>, sqlx::Error>;
    async fn get_vm_disks(&self, vm_id: i32) -> Result<Vec<VmDisk>, sqlx::Error>;
    async fn get_vm_network_interfaces(&self, vm_id: i32) -> Result<Vec<VmNetworkInterface>, sqlx::Error>;
    async fn get_vm_snapshots(&self, vm_id: i32) -> Result<Vec<VmSnapshot>, sqlx::Error>;
    async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_vm_counts_by_hypervisor(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_vm_counts_by_state(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_vm_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn update_vm(&self, vm_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
}

#[derive(Clone)]
pub struct VmRepository {
    pool: MySqlPool,
}

impl VmRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    /// Get all VMs with pagination
    pub async fn get_all_vms(&self, query: CommonPaginationQuery) -> Result<Vec<VirtualMachine>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("vm_id DESC".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("vm_id DESC".to_string()),
        };

        QueryBuilderHelper::select(&self.pool, VirtualMachine::TABLE, options).await
    }

    /// Get single VM by ID
    pub async fn get_by_id(&self, id: i64) -> Result<Option<VirtualMachine>, sqlx::Error> {
        let vm: Option<VirtualMachine> = sqlx::query_as(&format!("SELECT * FROM {} WHERE vm_id = ?", VirtualMachine::TABLE))
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        
        Ok(vm)
    }

    /// Get all VMs for a specific server
    pub async fn get_vms_by_server_id(&self, server_id: i32) -> Result<Vec<VirtualMachine>, sqlx::Error> {
        let vms: Vec<VirtualMachine> = sqlx::query_as(&format!("SELECT * FROM {} WHERE server_id = ? ORDER BY vm_name", VirtualMachine::TABLE))
            .bind(server_id)
            .fetch_all(&self.pool)
            .await?;
        
        Ok(vms)
    }

    /// Get VM with all related components (disks, network interfaces, snapshots)
    pub async fn get_vm_with_all_components(&self, vm_id: i32) -> Result<Option<VmWithAllComponents>, sqlx::Error> {
        let vm = match self.get_by_id(vm_id as i64).await? {
            Some(vm) => vm,
            None => return Ok(None),
        };

        let disks = self.get_vm_disks(vm_id).await?;
        let network_interfaces = self.get_vm_network_interfaces(vm_id).await?;
        let snapshots = self.get_vm_snapshots(vm_id).await?;

        Ok(Some(VmWithAllComponents {
            vm,
            disks,
            network_interfaces,
            snapshots,
        }))
    }

    /// Get all disks for a VM
    pub async fn get_vm_disks(&self, vm_id: i32) -> Result<Vec<VmDisk>, sqlx::Error> {
        let disks: Vec<VmDisk> = sqlx::query_as(
            "SELECT * FROM vm_disks WHERE vm_id = ? ORDER BY boot_order, disk_name"
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(disks)
    }

    /// Get all network interfaces for a VM
    pub async fn get_vm_network_interfaces(&self, vm_id: i32) -> Result<Vec<VmNetworkInterface>, sqlx::Error> {
        let interfaces: Vec<VmNetworkInterface> = sqlx::query_as(
            "SELECT * FROM vm_network_interfaces WHERE vm_id = ? ORDER BY nic_name"
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(interfaces)
    }

    /// Get all snapshots for a VM
    pub async fn get_vm_snapshots(&self, vm_id: i32) -> Result<Vec<VmSnapshot>, sqlx::Error> {
        let snapshots: Vec<VmSnapshot> = sqlx::query_as(
            "SELECT * FROM vm_snapshots WHERE vm_id = ? ORDER BY created_at DESC"
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(snapshots)
    }

    /// Get overview statistics for VMs
    pub async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        let total_vms: i64 = sqlx::query_scalar("SELECT CAST(COUNT(*) AS SIGNED) FROM virtual_machines")
            .fetch_one(&self.pool)
            .await?;

        let running_vms: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM virtual_machines WHERE vm_state = 'running'"
        )
        .fetch_one(&self.pool)
        .await?;

        let stopped_vms: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM virtual_machines WHERE vm_state = 'stopped'"
        )
        .fetch_one(&self.pool)
        .await?;

        let total_vcpus: i64 = sqlx::query_scalar(
            "SELECT CAST(COALESCE(SUM(vcpu_count), 0) AS SIGNED) FROM virtual_machines"
        )
        .fetch_one(&self.pool)
        .await?;

        let total_memory_gb: i64 = sqlx::query_scalar(
            "SELECT CAST(COALESCE(SUM(memory_mb), 0) / 1024 AS SIGNED) FROM virtual_machines"
        )
        .fetch_one(&self.pool)
        .await?;

        let total_storage_gb: i64 = sqlx::query_scalar(
            "SELECT CAST(COALESCE(SUM(storage_gb), 0) AS SIGNED) FROM virtual_machines"
        )
        .fetch_one(&self.pool)
        .await?;

        let by_hypervisor = self.get_vm_counts_by_hypervisor().await?;
        let by_state = self.get_vm_counts_by_state().await?;
        let by_status = self.get_vm_counts_by_status().await?;

        let stats = serde_json::json!({
            "total_vms": total_vms,
            "running_vms": running_vms,
            "stopped_vms": stopped_vms,
            "total_vcpus": total_vcpus,
            "total_memory_gb": total_memory_gb,
            "total_storage_gb": total_storage_gb,
            "by_hypervisor": by_hypervisor,
            "by_state": by_state,
            "by_status": by_status
        });

        Ok(stats)
    }

    /// Get VM counts grouped by hypervisor type
    pub async fn get_vm_counts_by_hypervisor(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        let counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT hypervisor_type, CAST(COUNT(*) AS SIGNED) as count FROM virtual_machines GROUP BY hypervisor_type"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(counts)
    }

    /// Get VM counts grouped by state
    pub async fn get_vm_counts_by_state(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        let counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT vm_state, CAST(COUNT(*) AS SIGNED) as count FROM virtual_machines GROUP BY vm_state"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(counts)
    }

    /// Get VM counts grouped by status
    pub async fn get_vm_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        let counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT vm_status, CAST(COUNT(*) AS SIGNED) as count FROM virtual_machines GROUP BY vm_status"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(counts)
    }

    /// Update VM fields dynamically
    pub async fn update_vm(&self, vm_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        // Get all field names from VirtualMachine struct using serde
        let vm_fields: std::collections::HashSet<String> = {
            let default_vm = VirtualMachine::default();
            match serde_json::to_value(&default_vm) {
                Ok(serde_json::Value::Object(map)) => {
                    map.keys().cloned().collect()
                },
                _ => return Err(sqlx::Error::Protocol(
                    "Failed to extract VirtualMachine field names".to_string()
                ))
            }
        };

        // Blacklist of fields that should never be updated (auto-managed or immutable)
        let blacklisted_fields = [
            "vm_id", "created_at", "updated_at"
        ];

        // Filter and validate updates
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in &updates {
            // Check if field exists in struct
            if !vm_fields.contains(field) {
                return Err(sqlx::Error::Protocol(
                    format!("Field '{}' does not exist in VirtualMachine", field)
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
            "UPDATE {} SET {}, updated_at = NOW() WHERE vm_id = {}",
            VirtualMachine::TABLE,
            set_clauses.join(", ").replace("?", "&"),
            vm_id
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
}

#[async_trait]
impl VmRepo for VmRepository {
    async fn get_all_vms(&self, query: CommonPaginationQuery) -> Result<Vec<VirtualMachine>, sqlx::Error> {
        self.get_all_vms(query).await
    }

    async fn get_by_id(&self, id: i64) -> Result<Option<VirtualMachine>, sqlx::Error> {
        self.get_by_id(id).await
    }

    async fn get_vms_by_server_id(&self, server_id: i32) -> Result<Vec<VirtualMachine>, sqlx::Error> {
        self.get_vms_by_server_id(server_id).await
    }

    async fn get_vm_with_all_components(&self, vm_id: i32) -> Result<Option<VmWithAllComponents>, sqlx::Error> {
        self.get_vm_with_all_components(vm_id).await
    }

    async fn get_vm_disks(&self, vm_id: i32) -> Result<Vec<VmDisk>, sqlx::Error> {
        self.get_vm_disks(vm_id).await
    }

    async fn get_vm_network_interfaces(&self, vm_id: i32) -> Result<Vec<VmNetworkInterface>, sqlx::Error> {
        self.get_vm_network_interfaces(vm_id).await
    }

    async fn get_vm_snapshots(&self, vm_id: i32) -> Result<Vec<VmSnapshot>, sqlx::Error> {
        self.get_vm_snapshots(vm_id).await
    }

    async fn get_overview_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        self.get_overview_stats().await
    }

    async fn get_vm_counts_by_hypervisor(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        self.get_vm_counts_by_hypervisor().await
    }

    async fn get_vm_counts_by_state(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        self.get_vm_counts_by_state().await
    }

    async fn get_vm_counts_by_status(&self) -> Result<Vec<(String, i64)>, sqlx::Error> {
        self.get_vm_counts_by_status().await
    }

    async fn update_vm(&self, vm_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_vm(vm_id, updates).await
    }
}
