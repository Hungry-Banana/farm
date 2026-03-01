use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    VirtualMachine, VmWithAllComponents, VmDisk, VmNetworkInterface, VmSnapshot, QueryOptions
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

// Inventory data structures matching the JSON format from farmmanager
#[derive(Debug, serde::Deserialize)]
pub struct VmInventory {
    pub host_mac_address: String,
    pub hypervisor_type: String,
    pub vms: Vec<VmInventoryDetail>,
}

#[derive(Debug, serde::Deserialize)]
pub struct VmInventoryDetail {
    pub vm_name: String,
    pub vm_uuid: Option<String>,
    pub vm_state: Option<String>,
    pub hypervisor_type: String,
    pub vcpu_count: Option<i32>,
    pub memory_mb: Option<i32>,
    pub guest_os_family: Option<String>,
    pub disks: Vec<VmDiskInventory>,
    pub network_interfaces: Vec<VmNetworkInventory>,
}

#[derive(Debug, serde::Deserialize)]
pub struct VmDiskInventory {
    pub disk_name: String,
    pub disk_type: Option<String>,
    pub disk_format: Option<String>,
    pub disk_size_gb: Option<i32>,
    pub disk_path: String,
    pub is_bootable: Option<bool>,
    pub storage_type: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct VmNetworkInventory {
    pub interface_name: String,
    pub mac_address: Option<String>,
    pub interface_type: Option<String>,
    pub network_bridge: Option<String>,
}


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
    async fn upsert_vm_from_inventory(&self, inventory: VmInventory) -> Result<Vec<(i32, bool)>, sqlx::Error>;
}

#[derive(Clone)]
pub struct VmRepository {
    pool: MySqlPool,
    server_repo: crate::repositories::server_repository::ServerRepository,
}

impl VmRepository {
    pub fn new(pool: MySqlPool) -> Self {
        let server_repo = crate::repositories::server_repository::ServerRepository::new(pool.clone());
        Self { pool, server_repo }
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
            "SELECT * FROM vm_disks WHERE vm_id = ? "
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(disks)
    }

    /// Get all network interfaces for a VM
    pub async fn get_vm_network_interfaces(&self, vm_id: i32) -> Result<Vec<VmNetworkInterface>, sqlx::Error> {
        let interfaces: Vec<VmNetworkInterface> = sqlx::query_as(
            "SELECT * FROM vm_network_interfaces WHERE vm_id = ?"
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
        let blacklisted_fields = ["vm_id", "created_at", "updated_at"];
        DatabaseHelper::update(
            &self.pool,
            VirtualMachine::TABLE,
            "vm_id",
            vm_id,
            updates,
            &blacklisted_fields,
        ).await
    }
    
    /// Upsert VMs from inventory data
    /// Creates or updates VMs based on vm_name and server_id combination
    /// Returns a list of (vm_id, was_created) tuples for each VM processed
    pub async fn upsert_vm_from_inventory(
        &self,
        inventory: VmInventory
    ) -> Result<Vec<(i32, bool)>, sqlx::Error> {
        // Look up server_id by MAC address using ServerRepository
        let server_id = self.server_repo.check_server_exists_by_mac(&inventory.host_mac_address)
            .await?
            .ok_or_else(|| {
                sqlx::Error::Protocol(format!(
                    "Server not found with MAC address: {}. Please ensure the hardware inventory has been posted first.",
                    inventory.host_mac_address
                ))
            })?;
        
        let mut results = Vec::new();
        
        for vm_detail in inventory.vms {
            let result = self.upsert_single_vm(server_id, &inventory.hypervisor_type, vm_detail).await?;
            results.push(result);
        }
        
        Ok(results)
    }
    
    /// Upsert a single VM
    async fn upsert_single_vm(
        &self,
        server_id: i32,
        hypervisor_type: &str,
        vm_detail: VmInventoryDetail
    ) -> Result<(i32, bool), sqlx::Error> {
        // Check if VM exists by vm_name and server_id
        let existing_vm: Option<(i32,)> = sqlx::query_as(
            "SELECT vm_id FROM virtual_machines WHERE server_id = ? AND vm_name = ?"
        )
        .bind(server_id)
        .bind(&vm_detail.vm_name)
        .fetch_optional(&self.pool)
        .await?;
        
        let (vm_id, was_created) = if let Some((existing_id,)) = existing_vm {
            // Update existing VM
            self.update_vm_from_inventory(existing_id, &vm_detail).await?;
            (existing_id, false)
        } else {
            // Create new VM
            let new_id = self.create_vm_from_inventory(server_id, hypervisor_type, &vm_detail).await?;
            (new_id, true)
        };
        
        // Sync VM disks
        self.sync_vm_disks(vm_id, &vm_detail.disks).await?;
        
        // Sync VM network interfaces
        self.sync_vm_network_interfaces(vm_id, &vm_detail.network_interfaces).await?;
        
        Ok((vm_id, was_created))
    }
    
    /// Create a new VM from inventory data
    async fn create_vm_from_inventory(
        &self,
        server_id: i32,
        hypervisor_type: &str,
        vm_detail: &VmInventoryDetail
    ) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO virtual_machines (
                server_id, vm_name, vm_uuid, hypervisor_type,
                vcpu_count, memory_mb, vm_state, vm_status,
                guest_os_family, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())
        "#;
        
        let result = sqlx::query(query)
            .bind(server_id)
            .bind(&vm_detail.vm_name)
            .bind(&vm_detail.vm_uuid)
            .bind(hypervisor_type)
            .bind(vm_detail.vcpu_count)
            .bind(vm_detail.memory_mb)
            .bind(&vm_detail.vm_state)
            .bind(&vm_detail.guest_os_family)
            .execute(&self.pool)
            .await?;
        
        Ok(result.last_insert_id() as i32)
    }
    
    /// Update an existing VM from inventory data
    async fn update_vm_from_inventory(
        &self,
        vm_id: i32,
        vm_detail: &VmInventoryDetail
    ) -> Result<(), sqlx::Error> {
        let query = r#"
            UPDATE virtual_machines SET
                vm_uuid = ?,
                vcpu_count = ?,
                memory_mb = ?,
                vm_state = ?,
                guest_os_family = ?,
                updated_at = NOW()
            WHERE vm_id = ?
        "#;
        
        sqlx::query(query)
            .bind(&vm_detail.vm_uuid)
            .bind(vm_detail.vcpu_count)
            .bind(vm_detail.memory_mb)
            .bind(&vm_detail.vm_state)
            .bind(&vm_detail.guest_os_family)
            .bind(vm_id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }
    
    /// Sync VM disks - add/update/remove disks based on inventory
    async fn sync_vm_disks(
        &self,
        vm_id: i32,
        inventory_disks: &[VmDiskInventory]
    ) -> Result<(), sqlx::Error> {
        // Get existing disks
        let existing: Vec<(i32, String)> = sqlx::query_as(
            "SELECT vm_disk_id, disk_name FROM vm_disks WHERE vm_id = ?"
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;
        
        let mut existing_disks: HashMap<String, i32> = existing
            .into_iter()
            .map(|(id, name)| (name, id))
            .collect();
        
        // Process inventory disks
        for disk in inventory_disks {
            if let Some(disk_id) = existing_disks.remove(&disk.disk_name) {
                // Update existing disk
                sqlx::query(r#"
                    UPDATE vm_disks SET
                        disk_type = ?,
                        disk_format = ?,
                        disk_size_gb = ?,
                        disk_path = ?,
                        is_bootable = ?,
                        storage_type = ?,
                        updated_at = NOW()
                    WHERE vm_disk_id = ?
                "#)
                .bind(&disk.disk_type)
                .bind(&disk.disk_format)
                .bind(disk.disk_size_gb)
                .bind(&disk.disk_path)
                .bind(disk.is_bootable)
                .bind(&disk.storage_type)
                .bind(disk_id)
                .execute(&self.pool)
                .await?;
            } else {
                // Insert new disk
                sqlx::query(r#"
                    INSERT INTO vm_disks (
                        vm_id, disk_name, disk_type, disk_format,
                        disk_size_gb, disk_path, is_bootable, storage_type,
                        created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                "#)
                .bind(vm_id)
                .bind(&disk.disk_name)
                .bind(&disk.disk_type)
                .bind(&disk.disk_format)
                .bind(disk.disk_size_gb)
                .bind(&disk.disk_path)
                .bind(disk.is_bootable)
                .bind(&disk.storage_type)
                .execute(&self.pool)
                .await?;
            }
        }
        
        // Delete disks no longer present
        for disk_id in existing_disks.values() {
            sqlx::query("DELETE FROM vm_disks WHERE vm_disk_id = ?")
                .bind(disk_id)
                .execute(&self.pool)
                .await?;
        }
        
        Ok(())
    }
    
    /// Sync VM network interfaces - add/update/remove interfaces based on inventory
    async fn sync_vm_network_interfaces(
        &self,
        vm_id: i32,
        inventory_interfaces: &[VmNetworkInventory]
    ) -> Result<(), sqlx::Error> {
        // Get existing interfaces
        let existing: Vec<(i32, String)> = sqlx::query_as(
            "SELECT vm_interface_id, interface_name FROM vm_network_interfaces WHERE vm_id = ?"
        )
        .bind(vm_id)
        .fetch_all(&self.pool)
        .await?;
        
        let mut existing_interfaces: HashMap<String, i32> = existing
            .into_iter()
            .map(|(id, name)| (name, id))
            .collect();
        
        // Process inventory interfaces
        for (index, iface) in inventory_interfaces.iter().enumerate() {
            let is_primary = index == 0; // First interface is primary
            
            if let Some(iface_id) = existing_interfaces.remove(&iface.interface_name) {
                // Update existing interface
                sqlx::query(r#"
                    UPDATE vm_network_interfaces SET
                        mac_address = ?,
                        interface_type = ?,
                        network_bridge = ?,
                        is_primary = ?,
                        updated_at = NOW()
                    WHERE vm_interface_id = ?
                "#)
                .bind(&iface.mac_address)
                .bind(&iface.interface_type)
                .bind(&iface.network_bridge)
                .bind(is_primary)
                .bind(iface_id)
                .execute(&self.pool)
                .await?;
            } else {
                // Insert new interface
                sqlx::query(r#"
                    INSERT INTO vm_network_interfaces (
                        vm_id, interface_name, mac_address, interface_type,
                        network_bridge, is_primary, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                "#)
                .bind(vm_id)
                .bind(&iface.interface_name)
                .bind(&iface.mac_address)
                .bind(&iface.interface_type)
                .bind(&iface.network_bridge)
                .bind(is_primary)
                .execute(&self.pool)
                .await?;
            }
        }
        
        // Delete interfaces no longer present
        for iface_id in existing_interfaces.values() {
            sqlx::query("DELETE FROM vm_network_interfaces WHERE vm_interface_id = ?")
                .bind(iface_id)
                .execute(&self.pool)
                .await?;
        }
        
        Ok(())
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
    
    async fn upsert_vm_from_inventory(&self, inventory: VmInventory) -> Result<Vec<(i32, bool)>, sqlx::Error> {
        self.upsert_vm_from_inventory(inventory).await
    }
}
