use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    Datacenter, DatacenterRack, DatacenterRackPosition,
    DatacenterWithRacks, RackWithPositions, QueryOptions
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

#[async_trait]
pub trait DatacenterRepo: Send + Sync {
    // Datacenter CRUD operations
    async fn get_all_datacenters(&self, query: CommonPaginationQuery) -> Result<Vec<Datacenter>, sqlx::Error>;
    async fn get_datacenter_by_id(&self, datacenter_id: i32) -> Result<Option<Datacenter>, sqlx::Error>;
    async fn get_datacenter_with_racks(&self, datacenter_id: i32) -> Result<Option<DatacenterWithRacks>, sqlx::Error>;
    async fn create_datacenter(&self, datacenter: Datacenter) -> Result<i32, sqlx::Error>;
    async fn update_datacenter(&self, datacenter_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_datacenter(&self, datacenter_id: i32) -> Result<bool, sqlx::Error>;
    
    // Rack CRUD operations
    async fn get_racks_by_datacenter(&self, datacenter_id: i32) -> Result<Vec<DatacenterRack>, sqlx::Error>;
    async fn get_rack_by_id(&self, rack_id: i32) -> Result<Option<DatacenterRack>, sqlx::Error>;
    async fn get_rack_with_positions(&self, rack_id: i32) -> Result<Option<RackWithPositions>, sqlx::Error>;
    async fn create_rack(&self, rack: DatacenterRack) -> Result<i32, sqlx::Error>;
    async fn update_rack(&self, rack_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_rack(&self, rack_id: i32) -> Result<bool, sqlx::Error>;
    
    // Rack Position CRUD operations
    async fn get_positions_by_rack(&self, rack_id: i32) -> Result<Vec<DatacenterRackPosition>, sqlx::Error>;
    async fn get_position_by_id(&self, position_id: i32) -> Result<Option<DatacenterRackPosition>, sqlx::Error>;
    async fn create_position(&self, position: DatacenterRackPosition) -> Result<i32, sqlx::Error>;
    async fn update_position(&self, position_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_position(&self, position_id: i32) -> Result<bool, sqlx::Error>;
    
    // Statistics and reporting
    async fn get_datacenter_stats(&self, datacenter_id: i32) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_all_datacenters_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_rack_utilization(&self, rack_id: i32) -> Result<serde_json::Value, sqlx::Error>;
}

#[derive(Clone)]
pub struct DatacenterRepository {
    pool: MySqlPool,
}

impl DatacenterRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    /// Get all datacenters with pagination and filtering
    pub async fn get_all_datacenters(&self, query: CommonPaginationQuery) -> Result<Vec<Datacenter>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("data_center_name ASC".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            order_by: Some("data_center_name ASC".to_string()),
            limit: Some(per_page as i64),
            offset: Some(offset as i64),
        };

        QueryBuilderHelper::select(&self.pool, Datacenter::TABLE, options).await
    }

    /// Get a single datacenter by ID
    pub async fn get_datacenter_by_id(&self, datacenter_id: i32) -> Result<Option<Datacenter>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, Datacenter::TABLE, Datacenter::KEY, datacenter_id as i64).await
    }

    /// Get datacenter with all its racks
    pub async fn get_datacenter_with_racks(&self, datacenter_id: i32) -> Result<Option<DatacenterWithRacks>, sqlx::Error> {
        let datacenter = match self.get_datacenter_by_id(datacenter_id).await? {
            Some(dc) => dc,
            None => return Ok(None),
        };

        let racks = self.get_racks_by_datacenter(datacenter_id).await?;

        Ok(Some(DatacenterWithRacks {
            datacenter,
            racks,
        }))
    }

    /// Create a new datacenter
    pub async fn create_datacenter(&self, datacenter: Datacenter) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO datacenters (
                data_center_name, data_center_code, description,
                address, city, state_province, country, postal_code, region,
                latitude, longitude,
                provider, provider_facility_id,
                tier_level, total_floor_space_sqm, power_capacity_kw, cooling_capacity_kw,
                status,
                facility_manager, contact_phone, contact_email, emergency_contact, emergency_phone,
                timezone, operating_hours,
                tags, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(&datacenter.data_center_name)
            .bind(&datacenter.data_center_code)
            .bind(&datacenter.description)
            .bind(&datacenter.address)
            .bind(&datacenter.city)
            .bind(&datacenter.state_province)
            .bind(&datacenter.country)
            .bind(&datacenter.postal_code)
            .bind(&datacenter.region)
            .bind(datacenter.latitude)
            .bind(datacenter.longitude)
            .bind(&datacenter.provider)
            .bind(&datacenter.provider_facility_id)
            .bind(&datacenter.tier_level)
            .bind(datacenter.total_floor_space_sqm)
            .bind(datacenter.power_capacity_kw)
            .bind(datacenter.cooling_capacity_kw)
            .bind(&datacenter.status)
            .bind(&datacenter.facility_manager)
            .bind(&datacenter.contact_phone)
            .bind(&datacenter.contact_email)
            .bind(&datacenter.emergency_contact)
            .bind(&datacenter.emergency_phone)
            .bind(&datacenter.timezone)
            .bind(&datacenter.operating_hours)
            .bind(&datacenter.tags)
            .bind(&datacenter.metadata)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    /// Update datacenter with dynamic field updates
    pub async fn update_datacenter(
        &self,
        datacenter_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        let blacklisted_fields = ["data_center_id", "created_at"];
        
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in updates.iter() {
            if blacklisted_fields.contains(&field.as_str()) {
                continue;
            }

            let value_str = match value {
                serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''")),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                serde_json::Value::Null => "NULL".to_string(),
                _ => format!("'{}'", value.to_string().replace("'", "''")),
            };

            set_clauses.push(format!("{} = ?", field));
            values.push(value_str);
        }

        if set_clauses.is_empty() {
            return Ok(false);
        }

        let query = format!(
            "UPDATE {} SET {}, updated_at = CURRENT_TIMESTAMP WHERE data_center_id = {}",
            Datacenter::TABLE,
            set_clauses.join(", "),
            datacenter_id
        );

        let mut final_query = query;
        for value in values {
            final_query = final_query.replacen("?", &value, 1);
        }

        let result = sqlx::query(&final_query)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Delete a datacenter (cascade will handle racks)
    pub async fn delete_datacenter(&self, datacenter_id: i32) -> Result<bool, sqlx::Error> {
        let query = format!(
            "DELETE FROM {} WHERE data_center_id = ?",
            Datacenter::TABLE
        );

        let result = sqlx::query(&query)
            .bind(datacenter_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Get all racks for a datacenter
    pub async fn get_racks_by_datacenter(&self, datacenter_id: i32) -> Result<Vec<DatacenterRack>, sqlx::Error> {
        let query = format!(
            "SELECT * FROM {} WHERE data_center_id = ? ORDER BY rack_name",
            DatacenterRack::TABLE
        );

        sqlx::query_as(&query)
            .bind(datacenter_id)
            .fetch_all(&self.pool)
            .await
    }

    /// Get a single rack by ID
    pub async fn get_rack_by_id(&self, rack_id: i32) -> Result<Option<DatacenterRack>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, DatacenterRack::TABLE, DatacenterRack::KEY, rack_id as i64).await
    }

    /// Get rack with all its positions
    pub async fn get_rack_with_positions(&self, rack_id: i32) -> Result<Option<RackWithPositions>, sqlx::Error> {
        let rack = match self.get_rack_by_id(rack_id).await? {
            Some(r) => r,
            None => return Ok(None),
        };

        let positions = self.get_positions_by_rack(rack_id).await?;

        Ok(Some(RackWithPositions {
            rack,
            positions,
        }))
    }

    /// Create a new rack
    pub async fn create_rack(&self, rack: DatacenterRack) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO datacenter_racks (
                data_center_id, rack_name, rack_code, description,
                rack_height_u, rack_width_mm, rack_depth_mm,
                row_name, aisle_name, room_name, floor_level,
                power_capacity_w, power_usage_w, cooling_type,
                network_zone, status,
                total_u_available, occupied_u, reserved_u, free_u,
                access_level, tags, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(rack.data_center_id)
            .bind(&rack.rack_name)
            .bind(&rack.rack_code)
            .bind(&rack.description)
            .bind(rack.rack_height_u)
            .bind(rack.rack_width_mm)
            .bind(rack.rack_depth_mm)
            .bind(&rack.row_name)
            .bind(&rack.aisle_name)
            .bind(&rack.room_name)
            .bind(rack.floor_level)
            .bind(rack.power_capacity_w)
            .bind(rack.power_usage_w)
            .bind(&rack.cooling_type)
            .bind(&rack.network_zone)
            .bind(&rack.status)
            .bind(rack.total_u_available)
            .bind(rack.occupied_u)
            .bind(rack.reserved_u)
            .bind(rack.free_u)
            .bind(&rack.access_level)
            .bind(&rack.tags)
            .bind(&rack.metadata)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    /// Update rack with dynamic field updates
    pub async fn update_rack(
        &self,
        rack_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        let blacklisted_fields = ["rack_id", "created_at"];
        
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in updates.iter() {
            if blacklisted_fields.contains(&field.as_str()) {
                continue;
            }

            let value_str = match value {
                serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''")),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                serde_json::Value::Null => "NULL".to_string(),
                _ => format!("'{}'", value.to_string().replace("'", "''")),
            };

            set_clauses.push(format!("{} = ?", field));
            values.push(value_str);
        }

        if set_clauses.is_empty() {
            return Ok(false);
        }

        let query = format!(
            "UPDATE {} SET {}, updated_at = CURRENT_TIMESTAMP WHERE rack_id = {}",
            DatacenterRack::TABLE,
            set_clauses.join(", "),
            rack_id
        );

        let mut final_query = query;
        for value in values {
            final_query = final_query.replacen("?", &value, 1);
        }

        let result = sqlx::query(&final_query)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Delete a rack (cascade will handle positions)
    pub async fn delete_rack(&self, rack_id: i32) -> Result<bool, sqlx::Error> {
        let query = format!(
            "DELETE FROM {} WHERE rack_id = ?",
            DatacenterRack::TABLE
        );

        let result = sqlx::query(&query)
            .bind(rack_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Get all positions for a rack
    pub async fn get_positions_by_rack(&self, rack_id: i32) -> Result<Vec<DatacenterRackPosition>, sqlx::Error> {
        let query = format!(
            "SELECT * FROM {} WHERE rack_id = ? ORDER BY u_position",
            DatacenterRackPosition::TABLE
        );

        sqlx::query_as(&query)
            .bind(rack_id)
            .fetch_all(&self.pool)
            .await
    }

    /// Get a single position by ID
    pub async fn get_position_by_id(&self, position_id: i32) -> Result<Option<DatacenterRackPosition>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, DatacenterRackPosition::TABLE, DatacenterRackPosition::KEY, position_id as i64).await
    }

    /// Create a new position
    pub async fn create_position(&self, position: DatacenterRackPosition) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO datacenter_rack_positions (
                rack_id, u_position, u_height, status,
                reserved_for, reservation_notes,
                server_id, device_type, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(position.rack_id)
            .bind(position.u_position)
            .bind(position.u_height)
            .bind(&position.status)
            .bind(&position.reserved_for)
            .bind(&position.reservation_notes)
            .bind(position.server_id)
            .bind(&position.device_type)
            .bind(&position.notes)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    /// Update position with dynamic field updates
    pub async fn update_position(
        &self,
        position_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        let blacklisted_fields = ["rack_position_id", "created_at"];
        
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in updates.iter() {
            if blacklisted_fields.contains(&field.as_str()) {
                continue;
            }

            let value_str = match value {
                serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''")),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                serde_json::Value::Null => "NULL".to_string(),
                _ => format!("'{}'", value.to_string().replace("'", "''")),
            };

            set_clauses.push(format!("{} = ?", field));
            values.push(value_str);
        }

        if set_clauses.is_empty() {
            return Ok(false);
        }

        let query = format!(
            "UPDATE {} SET {}, updated_at = CURRENT_TIMESTAMP WHERE rack_position_id = {}",
            DatacenterRackPosition::TABLE,
            set_clauses.join(", "),
            position_id
        );

        let mut final_query = query;
        for value in values {
            final_query = final_query.replacen("?", &value, 1);
        }

        let result = sqlx::query(&final_query)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Delete a position
    pub async fn delete_position(&self, position_id: i32) -> Result<bool, sqlx::Error> {
        let query = format!(
            "DELETE FROM {} WHERE rack_position_id = ?",
            DatacenterRackPosition::TABLE
        );

        let result = sqlx::query(&query)
            .bind(position_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Get statistics for a specific datacenter
    pub async fn get_datacenter_stats(&self, datacenter_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let datacenter = self.get_datacenter_by_id(datacenter_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        // Get rack count
        let rack_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM datacenter_racks WHERE data_center_id = ?"
        )
        .bind(datacenter_id)
        .fetch_one(&self.pool)
        .await?;

        // Get server count
        let server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE data_center_id = ?"
        )
        .bind(datacenter_id)
        .fetch_one(&self.pool)
        .await?;

        // Get active server count
        let active_server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE data_center_id = ? AND status = 'ACTIVE'"
        )
        .bind(datacenter_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "datacenter": datacenter,
            "total_racks": rack_count.0,
            "total_servers": server_count.0,
            "active_servers": active_server_count.0,
            "rack_utilization_pct": if datacenter.total_racks.unwrap_or(0) > 0 {
                (rack_count.0 as f64 / datacenter.total_racks.unwrap() as f64) * 100.0
            } else {
                0.0
            }
        }))
    }

    /// Get statistics for all datacenters
    pub async fn get_all_datacenters_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        let total_datacenters: i64 = DatabaseHelper::get_total_count(&self.pool, Datacenter::TABLE).await?;
        
        let total_racks: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM datacenter_racks"
        )
        .fetch_one(&self.pool)
        .await?;

        let total_servers: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE data_center_id > 0"
        )
        .fetch_one(&self.pool)
        .await?;

        // Get datacenters by status
        let status_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT status, COUNT(*) as count FROM datacenters GROUP BY status"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "total_datacenters": total_datacenters,
            "total_racks": total_racks.0,
            "total_servers": total_servers.0,
            "by_status": status_counts
        }))
    }

    /// Get rack utilization details
    pub async fn get_rack_utilization(&self, rack_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let rack = self.get_rack_by_id(rack_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let position_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM datacenter_rack_positions WHERE rack_id = ?"
        )
        .bind(rack_id)
        .fetch_one(&self.pool)
        .await?;

        let occupied_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM datacenter_rack_positions WHERE rack_id = ? AND status = 'OCCUPIED'"
        )
        .bind(rack_id)
        .fetch_one(&self.pool)
        .await?;

        let available_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM datacenter_rack_positions WHERE rack_id = ? AND status = 'AVAILABLE'"
        )
        .bind(rack_id)
        .fetch_one(&self.pool)
        .await?;

        let total_u = rack.rack_height_u;
        let occupied_u = rack.occupied_u.unwrap_or(0);
        let free_u = total_u - occupied_u;

        Ok(serde_json::json!({
            "rack": rack,
            "total_positions": position_count.0,
            "occupied_positions": occupied_count.0,
            "available_positions": available_count.0,
            "total_u": total_u,
            "occupied_u": occupied_u,
            "free_u": free_u,
            "utilization_pct": if total_u > 0 {
                (occupied_u as f64 / total_u as f64) * 100.0
            } else {
                0.0
            }
        }))
    }
}

#[async_trait]
impl DatacenterRepo for DatacenterRepository {
    async fn get_all_datacenters(&self, query: CommonPaginationQuery) -> Result<Vec<Datacenter>, sqlx::Error> {
        self.get_all_datacenters(query).await
    }

    async fn get_datacenter_by_id(&self, datacenter_id: i32) -> Result<Option<Datacenter>, sqlx::Error> {
        self.get_datacenter_by_id(datacenter_id).await
    }

    async fn get_datacenter_with_racks(&self, datacenter_id: i32) -> Result<Option<DatacenterWithRacks>, sqlx::Error> {
        self.get_datacenter_with_racks(datacenter_id).await
    }

    async fn create_datacenter(&self, datacenter: Datacenter) -> Result<i32, sqlx::Error> {
        self.create_datacenter(datacenter).await
    }

    async fn update_datacenter(&self, datacenter_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_datacenter(datacenter_id, updates).await
    }

    async fn delete_datacenter(&self, datacenter_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_datacenter(datacenter_id).await
    }

    async fn get_racks_by_datacenter(&self, datacenter_id: i32) -> Result<Vec<DatacenterRack>, sqlx::Error> {
        self.get_racks_by_datacenter(datacenter_id).await
    }

    async fn get_rack_by_id(&self, rack_id: i32) -> Result<Option<DatacenterRack>, sqlx::Error> {
        self.get_rack_by_id(rack_id).await
    }

    async fn get_rack_with_positions(&self, rack_id: i32) -> Result<Option<RackWithPositions>, sqlx::Error> {
        self.get_rack_with_positions(rack_id).await
    }

    async fn create_rack(&self, rack: DatacenterRack) -> Result<i32, sqlx::Error> {
        self.create_rack(rack).await
    }

    async fn update_rack(&self, rack_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_rack(rack_id, updates).await
    }

    async fn delete_rack(&self, rack_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_rack(rack_id).await
    }

    async fn get_positions_by_rack(&self, rack_id: i32) -> Result<Vec<DatacenterRackPosition>, sqlx::Error> {
        self.get_positions_by_rack(rack_id).await
    }

    async fn get_position_by_id(&self, position_id: i32) -> Result<Option<DatacenterRackPosition>, sqlx::Error> {
        self.get_position_by_id(position_id).await
    }

    async fn create_position(&self, position: DatacenterRackPosition) -> Result<i32, sqlx::Error> {
        self.create_position(position).await
    }

    async fn update_position(&self, position_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_position(position_id, updates).await
    }

    async fn delete_position(&self, position_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_position(position_id).await
    }

    async fn get_datacenter_stats(&self, datacenter_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_datacenter_stats(datacenter_id).await
    }

    async fn get_all_datacenters_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        self.get_all_datacenters_stats().await
    }

    async fn get_rack_utilization(&self, rack_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_rack_utilization(rack_id).await
    }
}
