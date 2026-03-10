use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    ServerCluster, ServerSubCluster, ClusterWithSubClusters,
    ClusterWithServers, QueryOptions, Server
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};


#[async_trait]
pub trait ClusterRepo: Send + Sync {
    // Cluster CRUD operations
    async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<ServerCluster>, sqlx::Error>;
    async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<ServerCluster>, sqlx::Error>;
    async fn get_cluster_with_sub_clusters(&self, cluster_id: i32) -> Result<Option<ClusterWithSubClusters>, sqlx::Error>;
    async fn get_cluster_with_servers(&self, cluster_id: i32) -> Result<Option<ClusterWithServers>, sqlx::Error>;
    async fn create_cluster(&self, cluster: ServerCluster) -> Result<i32, sqlx::Error>;
    async fn update_cluster(&self, cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_cluster(&self, cluster_id: i32) -> Result<bool, sqlx::Error>;
    
    // Sub-Cluster CRUD operations
    async fn get_sub_clusters_by_cluster(&self, cluster_id: i32) -> Result<Vec<ServerSubCluster>, sqlx::Error>;
    async fn get_sub_cluster_by_id(&self, sub_cluster_id: i32) -> Result<Option<ServerSubCluster>, sqlx::Error>;
    async fn create_sub_cluster(&self, sub_cluster: ServerSubCluster) -> Result<i32, sqlx::Error>;
    async fn update_sub_cluster(&self, sub_cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn delete_sub_cluster(&self, sub_cluster_id: i32) -> Result<bool, sqlx::Error>;
    
    // Statistics and reporting
    async fn get_cluster_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_all_clusters_stats(&self) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_sub_cluster_stats(&self, sub_cluster_id: i32) -> Result<serde_json::Value, sqlx::Error>;
}

#[derive(Clone)]
pub struct ClusterRepository {
    pool: MySqlPool,
}

impl ClusterRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }


    /// Get all clusters with pagination and filtering
    pub async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<ServerCluster>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("cluster_name ASC".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            order_by: Some("cluster_name ASC".to_string()),
            limit: Some(per_page as i64),
            offset: Some(offset as i64),
        };

        QueryBuilderHelper::select(&self.pool, ServerCluster::TABLE, options).await
    }

    /// Get a single cluster by ID
    pub async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<ServerCluster>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, ServerCluster::TABLE, ServerCluster::KEY, cluster_id as i64).await
    }

    /// Get cluster with all its sub-clusters
    pub async fn get_cluster_with_sub_clusters(&self, cluster_id: i32) -> Result<Option<ClusterWithSubClusters>, sqlx::Error> {
        let cluster = match self.get_cluster_by_id(cluster_id).await? {
            Some(c) => c,
            None => return Ok(None),
        };

        let sub_clusters = self.get_sub_clusters_by_cluster(cluster_id).await?;

        Ok(Some(ClusterWithSubClusters {
            cluster,
            sub_clusters,
        }))
    }

    /// Get cluster with all its servers
    pub async fn get_cluster_with_servers(&self, cluster_id: i32) -> Result<Option<ClusterWithServers>, sqlx::Error> {
        let cluster = match self.get_cluster_by_id(cluster_id).await? {
            Some(c) => c,
            None => return Ok(None),
        };

        let query = "SELECT * FROM servers WHERE cluster_id = ? ORDER BY server_name";
        let servers: Vec<Server> = sqlx::query_as(query)
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await?;

        Ok(Some(ClusterWithServers {
            cluster,
            servers,
        }))
    }

    /// Create a new cluster
    pub async fn create_cluster(&self, cluster: ServerCluster) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO server_clusters (
                cluster_name, cluster_code, description,
                data_center_id, region, availability_zone,
                status, environment_type,
                max_capacity,
                owner, contact_email,
                tags, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(&cluster.cluster_name)
            .bind(&cluster.cluster_code)
            .bind(&cluster.description)
            .bind(cluster.data_center_id)
            .bind(&cluster.region)
            .bind(&cluster.availability_zone)
            .bind(&cluster.status)
            .bind(&cluster.environment_type)
            .bind(cluster.max_capacity)
            .bind(&cluster.owner)
            .bind(&cluster.contact_email)
            .bind(&cluster.tags)
            .bind(&cluster.metadata)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    /// Update cluster with dynamic field updates
    pub async fn update_cluster(
        &self,
        cluster_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        let blacklisted_fields = ["cluster_id", "created_at", "total_servers", "active_servers"];
        
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
            "UPDATE {} SET {}, updated_at = CURRENT_TIMESTAMP WHERE cluster_id = {}",
            ServerCluster::TABLE,
            set_clauses.join(", "),
            cluster_id
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

    /// Delete a cluster (cascade will handle sub-clusters)
    pub async fn delete_cluster(&self, cluster_id: i32) -> Result<bool, sqlx::Error> {
        let query = format!(
            "DELETE FROM {} WHERE cluster_id = ?",
            ServerCluster::TABLE
        );

        let result = sqlx::query(&query)
            .bind(cluster_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Get all sub-clusters for a cluster
    pub async fn get_sub_clusters_by_cluster(&self, cluster_id: i32) -> Result<Vec<ServerSubCluster>, sqlx::Error> {
        let query = format!(
            "SELECT * FROM {} WHERE cluster_id = ? ORDER BY sub_cluster_name",
            ServerSubCluster::TABLE
        );

        sqlx::query_as(&query)
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await
    }

    /// Get a single sub-cluster by ID
    pub async fn get_sub_cluster_by_id(&self, sub_cluster_id: i32) -> Result<Option<ServerSubCluster>, sqlx::Error> {
        DatabaseHelper::get_by_id(&self.pool, ServerSubCluster::TABLE, ServerSubCluster::KEY, sub_cluster_id as i64).await
    }

    /// Create a new sub-cluster
    pub async fn create_sub_cluster(&self, sub_cluster: ServerSubCluster) -> Result<i32, sqlx::Error> {
        let query = r#"
            INSERT INTO server_sub_clusters (
                cluster_id, sub_cluster_name, sub_cluster_code, description,
                sub_cluster_type, status,
                max_capacity,
                workload_type, priority_level,
                tags, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#;

        let result = sqlx::query(query)
            .bind(sub_cluster.cluster_id)
            .bind(&sub_cluster.sub_cluster_name)
            .bind(&sub_cluster.sub_cluster_code)
            .bind(&sub_cluster.description)
            .bind(&sub_cluster.sub_cluster_type)
            .bind(&sub_cluster.status)
            .bind(sub_cluster.max_capacity)
            .bind(&sub_cluster.workload_type)
            .bind(&sub_cluster.priority_level)
            .bind(&sub_cluster.tags)
            .bind(&sub_cluster.metadata)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    /// Update sub-cluster with dynamic field updates
    pub async fn update_sub_cluster(
        &self,
        sub_cluster_id: i32,
        updates: HashMap<String, serde_json::Value>
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        let blacklisted_fields = ["sub_cluster_id", "created_at", "total_servers", "active_servers"];
        
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
            "UPDATE {} SET {}, updated_at = CURRENT_TIMESTAMP WHERE sub_cluster_id = {}",
            ServerSubCluster::TABLE,
            set_clauses.join(", "),
            sub_cluster_id
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

    /// Delete a sub-cluster
    pub async fn delete_sub_cluster(&self, sub_cluster_id: i32) -> Result<bool, sqlx::Error> {
        let query = format!(
            "DELETE FROM {} WHERE sub_cluster_id = ?",
            ServerSubCluster::TABLE
        );

        let result = sqlx::query(&query)
            .bind(sub_cluster_id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // ===================================================================
    // STATISTICS AND REPORTING
    // ===================================================================

    /// Get statistics for a specific cluster
    pub async fn get_cluster_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let cluster = self.get_cluster_by_id(cluster_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        // Get sub-cluster count
        let sub_cluster_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM server_sub_clusters WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        // Get server count
        let server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        // Get active server count
        let active_server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE cluster_id = ? AND status = 'ACTIVE'"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        // Get server counts by environment
        let env_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT environment_type, COUNT(*) as count 
             FROM servers 
             WHERE cluster_id = ? 
             GROUP BY environment_type"
        )
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;

        // Get server counts by status
        let status_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT status, COUNT(*) as count 
             FROM servers 
             WHERE cluster_id = ? 
             GROUP BY status"
        )
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "cluster": cluster,
            "total_sub_clusters": sub_cluster_count.0,
            "total_servers": server_count.0,
            "active_servers": active_server_count.0,
            "capacity_utilization_pct": if let Some(max_cap) = cluster.max_capacity {
                if max_cap > 0 {
                    (server_count.0 as f64 / max_cap as f64) * 100.0
                } else {
                    0.0
                }
            } else {
                0.0
            },
            "by_environment": env_counts,
            "by_status": status_counts
        }))
    }

    /// Get statistics for all clusters
    pub async fn get_all_clusters_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        let total_clusters: i64 = DatabaseHelper::get_total_count(&self.pool, ServerCluster::TABLE).await?;
        
        let total_sub_clusters: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM server_sub_clusters"
        )
        .fetch_one(&self.pool)
        .await?;

        let total_servers: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE cluster_id > 0"
        )
        .fetch_one(&self.pool)
        .await?;

        let active_servers: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE cluster_id > 0 AND status = 'ACTIVE'"
        )
        .fetch_one(&self.pool)
        .await?;

        // Get clusters by status
        let status_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT status, COUNT(*) as count FROM server_clusters GROUP BY status"
        )
        .fetch_all(&self.pool)
        .await?;

        // Get clusters by environment type
        let env_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT environment_type, COUNT(*) as count FROM server_clusters GROUP BY environment_type"
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "total_clusters": total_clusters,
            "total_sub_clusters": total_sub_clusters.0,
            "total_servers": total_servers.0,
            "active_servers": active_servers.0,
            "by_status": status_counts,
            "by_environment": env_counts
        }))
    }

    /// Get statistics for a specific sub-cluster
    pub async fn get_sub_cluster_stats(&self, sub_cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let sub_cluster = self.get_sub_cluster_by_id(sub_cluster_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        // Get server count
        let server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE sub_cluster_id = ?"
        )
        .bind(sub_cluster_id)
        .fetch_one(&self.pool)
        .await?;

        // Get active server count
        let active_server_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM servers WHERE sub_cluster_id = ? AND status = 'ACTIVE'"
        )
        .bind(sub_cluster_id)
        .fetch_one(&self.pool)
        .await?;

        // Get server counts by status
        let status_counts: Vec<(String, i64)> = sqlx::query_as(
            "SELECT status, COUNT(*) as count 
             FROM servers 
             WHERE sub_cluster_id = ? 
             GROUP BY status"
        )
        .bind(sub_cluster_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "sub_cluster": sub_cluster,
            "total_servers": server_count.0,
            "active_servers": active_server_count.0,
            "capacity_utilization_pct": if let Some(max_cap) = sub_cluster.max_capacity {
                if max_cap > 0 {
                    (server_count.0 as f64 / max_cap as f64) * 100.0
                } else {
                    0.0
                }
            } else {
                0.0
            },
            "by_status": status_counts
        }))
    }
}


#[async_trait]
impl ClusterRepo for ClusterRepository {
    async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<ServerCluster>, sqlx::Error> {
        self.get_all_clusters(query).await
    }

    async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<ServerCluster>, sqlx::Error> {
        self.get_cluster_by_id(cluster_id).await
    }

    async fn get_cluster_with_sub_clusters(&self, cluster_id: i32) -> Result<Option<ClusterWithSubClusters>, sqlx::Error> {
        self.get_cluster_with_sub_clusters(cluster_id).await
    }

    async fn get_cluster_with_servers(&self, cluster_id: i32) -> Result<Option<ClusterWithServers>, sqlx::Error> {
        self.get_cluster_with_servers(cluster_id).await
    }

    async fn create_cluster(&self, cluster: ServerCluster) -> Result<i32, sqlx::Error> {
        self.create_cluster(cluster).await
    }

    async fn update_cluster(&self, cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_cluster(cluster_id, updates).await
    }

    async fn delete_cluster(&self, cluster_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_cluster(cluster_id).await
    }

    async fn get_sub_clusters_by_cluster(&self, cluster_id: i32) -> Result<Vec<ServerSubCluster>, sqlx::Error> {
        self.get_sub_clusters_by_cluster(cluster_id).await
    }

    async fn get_sub_cluster_by_id(&self, sub_cluster_id: i32) -> Result<Option<ServerSubCluster>, sqlx::Error> {
        self.get_sub_cluster_by_id(sub_cluster_id).await
    }

    async fn create_sub_cluster(&self, sub_cluster: ServerSubCluster) -> Result<i32, sqlx::Error> {
        self.create_sub_cluster(sub_cluster).await
    }

    async fn update_sub_cluster(&self, sub_cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_sub_cluster(sub_cluster_id, updates).await
    }

    async fn delete_sub_cluster(&self, sub_cluster_id: i32) -> Result<bool, sqlx::Error> {
        self.delete_sub_cluster(sub_cluster_id).await
    }

    async fn get_cluster_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_cluster_stats(cluster_id).await
    }

    async fn get_all_clusters_stats(&self) -> Result<serde_json::Value, sqlx::Error> {
        self.get_all_clusters_stats().await
    }

    async fn get_sub_cluster_stats(&self, sub_cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_sub_cluster_stats(sub_cluster_id).await
    }
}
