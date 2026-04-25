use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{Switch, SwitchPort, SwitchVlan, SwitchWithPorts, QueryOptions};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

#[async_trait]
pub trait SwitchRepo: Send + Sync {
    // Switch CRUD
    async fn get_all_switches(&self, query: CommonPaginationQuery) -> Result<Vec<Switch>, sqlx::Error>;
    async fn get_switch_by_id(&self, switch_id: i32) -> Result<Option<Switch>, sqlx::Error>;
    async fn get_switch_with_ports(&self, switch_id: i32) -> Result<Option<SwitchWithPorts>, sqlx::Error>;
    async fn create_switch(&self, switch: Switch) -> Result<i32, sqlx::Error>;
    async fn update_switch(&self, switch_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_switch(&self, switch_id: i32) -> Result<bool, sqlx::Error>;

    // Port operations
    async fn get_ports_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchPort>, sqlx::Error>;
    async fn get_port_by_id(&self, port_id: i32) -> Result<Option<SwitchPort>, sqlx::Error>;
    async fn create_port(&self, port: SwitchPort) -> Result<i32, sqlx::Error>;
    async fn update_port(&self, port_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_port(&self, port_id: i32) -> Result<bool, sqlx::Error>;

    // VLAN operations
    async fn get_vlans_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchVlan>, sqlx::Error>;
    async fn create_vlan(&self, vlan: SwitchVlan) -> Result<i32, sqlx::Error>;
    async fn delete_vlan(&self, vlan_db_id: i32) -> Result<bool, sqlx::Error>;

    // Stats
    async fn get_switch_stats(&self, switch_id: i32) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_all_switches_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
}

#[derive(Clone)]
pub struct SwitchRepository {
    pool: MySqlPool,
}

impl SwitchRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    // ===================================================================
    // SWITCH OPERATIONS
    // ===================================================================

    pub async fn get_all_switches(&self, query: CommonPaginationQuery) -> Result<Vec<Switch>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("switch_id ASC".to_string()),
        )
        .map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            order_by: Some("switch_id ASC".to_string()),
            limit: Some(per_page),
            offset: Some(offset),
        };

        QueryBuilderHelper::select(&self.pool, Switch::TABLE, options).await
    }

    pub async fn get_switch_by_id(&self, switch_id: i32) -> Result<Option<Switch>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, Switch::TABLE, Switch::KEY, switch_id as i64).await
    }

    pub async fn get_switch_with_ports(&self, switch_id: i32) -> Result<Option<SwitchWithPorts>, sqlx::Error> {
        let switch = match self.get_switch_by_id(switch_id).await? {
            Some(s) => s,
            None => return Ok(None),
        };

        let (ports, vlans) = tokio::try_join!(
            self.get_ports_by_switch(switch_id),
            self.get_vlans_by_switch(switch_id)
        )?;

        Ok(Some(SwitchWithPorts { switch, ports, vlans }))
    }

    pub async fn create_switch(&self, switch: Switch) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO switches (
                switch_name, component_switch_id, serial_number, asset_tag,
                os_type, os_version, bootrom_version,
                mgmt_ip_address, mgmt_mac_address, mgmt_vlan_id,
                switch_role, status, environment_type,
                cluster_id, sub_cluster_id, data_center_id, rack_id, rack_position_id,
                poll_interval_seconds, auth_method, snmp_version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(&switch.switch_name)
            .bind(switch.component_switch_id)
            .bind(&switch.serial_number)
            .bind(&switch.asset_tag)
            .bind(&switch.os_type)
            .bind(&switch.os_version)
            .bind(&switch.bootrom_version)
            .bind(&switch.mgmt_ip_address)
            .bind(&switch.mgmt_mac_address)
            .bind(switch.mgmt_vlan_id)
            .bind(&switch.switch_role)
            .bind(&switch.status)
            .bind(&switch.environment_type)
            .bind(switch.cluster_id)
            .bind(switch.sub_cluster_id)
            .bind(switch.data_center_id)
            .bind(switch.rack_id)
            .bind(switch.rack_position_id)
            .bind(switch.poll_interval_seconds)
            .bind(&switch.auth_method)
            .bind(&switch.snmp_version)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    pub async fn update_switch(
        &self,
        switch_id: i32,
        updates: HashMap<String, serde_json::Value>,
    ) -> Result<bool, sqlx::Error> {
        let blacklisted = [
            "switch_id",
            "created_at",
            "updated_at",
            // Credential fields must be updated via a dedicated endpoint, not the generic update
            "auth_shared_secret",
            "snmp_community",
            "service_username",
            "service_password",
        ];
        DatabaseHelper::update(
            &self.pool,
            Switch::TABLE,
            Switch::KEY,
            switch_id,
            updates,
            &blacklisted,
        )
        .await
    }

    pub async fn delete_switch(&self, switch_id: i32) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM switches WHERE switch_id = ?")
            .bind(switch_id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }

    // ===================================================================
    // PORT OPERATIONS
    // ===================================================================

    pub async fn get_ports_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchPort>, sqlx::Error> {
        sqlx::query_as(
            "SELECT * FROM switch_ports WHERE switch_id = ? ORDER BY port_index, name",
        )
        .bind(switch_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_port_by_id(&self, port_id: i32) -> Result<Option<SwitchPort>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, SwitchPort::TABLE, SwitchPort::KEY, port_id as i64).await
    }

    pub async fn create_port(&self, port: SwitchPort) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO switch_ports (
                switch_id, name, port_index, port_type,
                admin_status, oper_status, speed_mbps, duplex, mtu,
                access_vlan_id, native_vlan_id, port_mode,
                description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(port.switch_id)
            .bind(&port.name)
            .bind(port.port_index)
            .bind(&port.port_type)
            .bind(&port.admin_status)
            .bind(&port.oper_status)
            .bind(port.speed_mbps)
            .bind(&port.duplex)
            .bind(port.mtu)
            .bind(port.access_vlan_id)
            .bind(port.native_vlan_id)
            .bind(&port.port_mode)
            .bind(&port.description)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    pub async fn update_port(
        &self,
        port_id: i32,
        updates: HashMap<String, serde_json::Value>,
    ) -> Result<bool, sqlx::Error> {
        let blacklisted = ["switch_port_id", "switch_id", "created_at"];
        DatabaseHelper::update(
            &self.pool,
            SwitchPort::TABLE,
            SwitchPort::KEY,
            port_id,
            updates,
            &blacklisted,
        )
        .await
    }

    pub async fn delete_port(&self, port_id: i32) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM switch_ports WHERE switch_port_id = ?")
            .bind(port_id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }

    // ===================================================================
    // VLAN OPERATIONS
    // ===================================================================

    pub async fn get_vlans_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchVlan>, sqlx::Error> {
        sqlx::query_as(
            "SELECT * FROM switch_vlans WHERE switch_id = ? ORDER BY vlan_id",
        )
        .bind(switch_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create_vlan(&self, vlan: SwitchVlan) -> Result<i32, sqlx::Error> {
        let result = sqlx::query(
            "INSERT INTO switch_vlans (switch_id, vlan_id, vlan_name, vlan_status) VALUES (?, ?, ?, ?)",
        )
        .bind(vlan.switch_id)
        .bind(vlan.vlan_id)
        .bind(&vlan.vlan_name)
        .bind(&vlan.vlan_status)
        .execute(&self.pool)
        .await?;

        Ok(result.last_insert_id() as i32)
    }

    pub async fn delete_vlan(&self, vlan_db_id: i32) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM switch_vlans WHERE vlan_db_id = ?")
            .bind(vlan_db_id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }

    // ===================================================================
    // STATISTICS
    // ===================================================================

    pub async fn get_switch_stats(&self, switch_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let switch = self
            .get_switch_by_id(switch_id)
            .await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let port_count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM switch_ports WHERE switch_id = ?")
                .bind(switch_id)
                .fetch_one(&self.pool)
                .await?;

        let up_ports: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM switch_ports WHERE switch_id = ? AND oper_status = 'UP'",
        )
        .bind(switch_id)
        .fetch_one(&self.pool)
        .await?;

        let vlan_count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM switch_vlans WHERE switch_id = ?")
                .bind(switch_id)
                .fetch_one(&self.pool)
                .await?;

        let port_type_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT port_type, COUNT(*) as count FROM switch_ports WHERE switch_id = ? GROUP BY port_type",
        )
        .bind(switch_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "switch": switch,
            "total_ports": port_count.0,
            "up_ports": up_ports.0,
            "down_ports": port_count.0 - up_ports.0,
            "port_utilization_pct": if port_count.0 > 0 {
                (up_ports.0 as f64 / port_count.0 as f64) * 100.0
            } else {
                0.0
            },
            "total_vlans": vlan_count.0,
            "ports_by_type": port_type_counts,
        }))
    }

    pub async fn get_all_switches_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        let total_switches: i64 =
            DatabaseHelper::get_total_count(&self.pool, Switch::TABLE).await?;

        let status_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT status, COUNT(*) as count FROM switches GROUP BY status",
        )
        .fetch_all(&self.pool)
        .await?;

        let role_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT switch_role, COUNT(*) as count FROM switches GROUP BY switch_role",
        )
        .fetch_all(&self.pool)
        .await?;

        let total_ports: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM switch_ports").fetch_one(&self.pool).await?;

        let up_ports: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM switch_ports WHERE oper_status = 'UP'")
                .fetch_one(&self.pool)
                .await?;

        Ok(serde_json::json!({
            "total_switches": total_switches,
            "by_status": status_counts,
            "by_role": role_counts,
            "total_ports": total_ports.0,
            "up_ports": up_ports.0,
        }))
    }
}

#[async_trait]
impl SwitchRepo for SwitchRepository {
    async fn get_all_switches(&self, query: CommonPaginationQuery) -> Result<Vec<Switch>, sqlx::Error> {
        self.get_all_switches(query).await
    }
    async fn get_switch_by_id(&self, switch_id: i32) -> Result<Option<Switch>, sqlx::Error> {
        self.get_switch_by_id(switch_id).await
    }
    async fn get_switch_with_ports(&self, switch_id: i32) -> Result<Option<SwitchWithPorts>, sqlx::Error> {
        self.get_switch_with_ports(switch_id).await
    }
    async fn create_switch(&self, switch: Switch) -> Result<i32, sqlx::Error> {
        self.create_switch(switch).await
    }
    async fn update_switch(&self, switch_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_switch(switch_id, updates).await
    }
    async fn delete_switch(&self, switch_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_switch(switch_id).await
    }
    async fn get_ports_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchPort>, sqlx::Error> {
        self.get_ports_by_switch(switch_id).await
    }
    async fn get_port_by_id(&self, port_id: i32) -> Result<Option<SwitchPort>, sqlx::Error> {
        self.get_port_by_id(port_id).await
    }
    async fn create_port(&self, port: SwitchPort) -> Result<i32, sqlx::Error> {
        self.create_port(port).await
    }
    async fn update_port(&self, port_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_port(port_id, updates).await
    }
    async fn delete_port(&self, port_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_port(port_id).await
    }
    async fn get_vlans_by_switch(&self, switch_id: i32) -> Result<Vec<SwitchVlan>, sqlx::Error> {
        self.get_vlans_by_switch(switch_id).await
    }
    async fn create_vlan(&self, vlan: SwitchVlan) -> Result<i32, sqlx::Error> {
        self.create_vlan(vlan).await
    }
    async fn delete_vlan(&self, vlan_db_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_vlan(vlan_db_id).await
    }
    async fn get_switch_stats(&self, switch_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_switch_stats(switch_id).await
    }
    async fn get_all_switches_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        self.get_all_switches_stats().await
    }
}
