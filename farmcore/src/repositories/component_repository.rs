use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::models::{
    ComponentCpuType, ComponentMemoryType, ComponentMotherboardType,
    ComponentDiskType, ComponentNetworkType, ComponentGpuType, ComponentBmcType,
    ComponentCatalog, ComponentCatalogStats, QueryOptions
};
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

#[async_trait]
pub trait ComponentRepo: Send + Sync {
    // CPU Types
    async fn get_all_cpu_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentCpuType>, sqlx::Error>;
    async fn get_cpu_type_by_id(&self, id: i32) -> Result<Option<ComponentCpuType>, sqlx::Error>;
    async fn create_cpu_type(&self, cpu_type: &ComponentCpuType) -> Result<i32, sqlx::Error>;
    
    // Memory Types
    async fn get_all_memory_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentMemoryType>, sqlx::Error>;
    async fn get_memory_type_by_id(&self, id: i32) -> Result<Option<ComponentMemoryType>, sqlx::Error>;
    async fn create_memory_type(&self, memory_type: &ComponentMemoryType) -> Result<i32, sqlx::Error>;
    
    // Motherboard Types
    async fn get_all_motherboard_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentMotherboardType>, sqlx::Error>;
    async fn get_motherboard_type_by_id(&self, id: i32) -> Result<Option<ComponentMotherboardType>, sqlx::Error>;
    async fn create_motherboard_type(&self, motherboard_type: &ComponentMotherboardType) -> Result<i32, sqlx::Error>;
    
    // Disk Types
    async fn get_all_disk_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentDiskType>, sqlx::Error>;
    async fn get_disk_type_by_id(&self, id: i32) -> Result<Option<ComponentDiskType>, sqlx::Error>;
    async fn create_disk_type(&self, disk_type: &ComponentDiskType) -> Result<i32, sqlx::Error>;
    
    // Network Types
    async fn get_all_network_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentNetworkType>, sqlx::Error>;
    async fn get_network_type_by_id(&self, id: i32) -> Result<Option<ComponentNetworkType>, sqlx::Error>;
    async fn create_network_type(&self, network_type: &ComponentNetworkType) -> Result<i32, sqlx::Error>;
    
    // GPU Types
    async fn get_all_gpu_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentGpuType>, sqlx::Error>;
    async fn get_gpu_type_by_id(&self, id: i32) -> Result<Option<ComponentGpuType>, sqlx::Error>;
    async fn create_gpu_type(&self, gpu_type: &ComponentGpuType) -> Result<i32, sqlx::Error>;
    
    // BMC Types
    async fn get_all_bmc_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentBmcType>, sqlx::Error>;
    async fn get_bmc_type_by_id(&self, id: i32) -> Result<Option<ComponentBmcType>, sqlx::Error>;
    async fn create_bmc_type(&self, bmc_type: &ComponentBmcType) -> Result<i32, sqlx::Error>;
    
    // Catalog Operations
    async fn get_complete_catalog(&self) -> Result<ComponentCatalog, sqlx::Error>;
    async fn get_catalog_stats(&self) -> Result<ComponentCatalogStats, sqlx::Error>;
}

pub struct ComponentRepository {
    pool: MySqlPool,
}

impl ComponentRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl ComponentRepo for ComponentRepository {
    // ===================================================================
    // CPU TYPES
    // ===================================================================
    
    async fn get_all_cpu_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentCpuType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("manufacturer, model_name".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("manufacturer, model_name".to_string()),
        };

        QueryBuilderHelper::select::<ComponentCpuType>(
            &self.pool,
            "component_cpu_types",
            options
        ).await
    }

    async fn get_cpu_type_by_id(&self, id: i32) -> Result<Option<ComponentCpuType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentCpuType>(
            &self.pool,
            "component_cpu_types",
            "component_cpu_id",
            id as i64
        ).await
    }

    async fn create_cpu_type(&self, cpu_type: &ComponentCpuType) -> Result<i32, sqlx::Error> {
        let columns = &["manufacturer", "model_name", "num_cores", "num_threads", "capacity_mhz", "l1_cache_kb", "l2_cache_kb", "l3_cache_kb"];
        let sql = DatabaseHelper::build_insert_sql("component_cpu_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&cpu_type.manufacturer)
            .bind(&cpu_type.model_name)
            .bind(cpu_type.num_cores)
            .bind(cpu_type.num_threads)
            .bind(cpu_type.capacity_mhz)
            .bind(cpu_type.l1_cache_kb)
            .bind(cpu_type.l2_cache_kb)
            .bind(cpu_type.l3_cache_kb)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // MEMORY TYPES
    // ===================================================================
    
    async fn get_all_memory_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentMemoryType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("manufacturer, part_number".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("manufacturer, part_number".to_string()),
        };

        QueryBuilderHelper::select::<ComponentMemoryType>(
            &self.pool,
            "component_memory_types",
            options
        ).await
    }

    async fn get_memory_type_by_id(&self, id: i32) -> Result<Option<ComponentMemoryType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentMemoryType>(
            &self.pool,
            "component_memory_types",
            "component_memory_id",
            id as i64
        ).await
    }

    async fn create_memory_type(&self, memory_type: &ComponentMemoryType) -> Result<i32, sqlx::Error> {
        let columns = &["manufacturer", "part_number", "size_bytes", "mem_type", "speed_mt_s"];
        let sql = DatabaseHelper::build_insert_sql("component_memory_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&memory_type.manufacturer)
            .bind(&memory_type.part_number)
            .bind(memory_type.size_bytes)
            .bind(&memory_type.mem_type)
            .bind(memory_type.speed_mt_s)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // MOTHERBOARD TYPES
    // ===================================================================
    
    async fn get_all_motherboard_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentMotherboardType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("manufacturer, product_name".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("manufacturer, product_name".to_string()),
        };

        QueryBuilderHelper::select::<ComponentMotherboardType>(
            &self.pool,
            "component_motherboard_types",
            options
        ).await
    }

    async fn get_motherboard_type_by_id(&self, id: i32) -> Result<Option<ComponentMotherboardType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentMotherboardType>(
            &self.pool,
            "component_motherboard_types",
            "component_motherboard_id",
            id as i64
        ).await
    }

    async fn create_motherboard_type(&self, motherboard_type: &ComponentMotherboardType) -> Result<i32, sqlx::Error> {
        let columns = &["manufacturer", "product_name", "version", "bios_version", "bmc_firmware_version"];
        
        let sql = DatabaseHelper::build_insert_sql("component_motherboard_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&motherboard_type.manufacturer)
            .bind(&motherboard_type.product_name)
            .bind(&motherboard_type.version)
            .bind(&motherboard_type.bios_version)
            .bind(&motherboard_type.bmc_firmware_version)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // DISK TYPES
    // ===================================================================
    
    async fn get_all_disk_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentDiskType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("manufacturer, model".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("manufacturer, model".to_string()),
        };

        QueryBuilderHelper::select::<ComponentDiskType>(
            &self.pool,
            "component_disk_types",
            options
        ).await
    }

    async fn get_disk_type_by_id(&self, id: i32) -> Result<Option<ComponentDiskType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentDiskType>(
            &self.pool,
            "component_disk_types",
            "component_disk_id",
            id as i64
        ).await
    }

    async fn create_disk_type(&self, disk_type: &ComponentDiskType) -> Result<i32, sqlx::Error> {
        let columns = &["manufacturer", "model", "size_bytes", "rotational", "bus_type"];
        let sql = DatabaseHelper::build_insert_sql("component_disk_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&disk_type.manufacturer)
            .bind(&disk_type.model)
            .bind(disk_type.size_bytes)
            .bind(disk_type.rotational)
            .bind(&disk_type.bus_type)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // NETWORK TYPES
    // ===================================================================
    
    async fn get_all_network_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentNetworkType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("vendor_name, device_name".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("vendor_name, device_name".to_string()),
        };

        QueryBuilderHelper::select::<ComponentNetworkType>(
            &self.pool,
            "component_network_types",
            options
        ).await
    }

    async fn get_network_type_by_id(&self, id: i32) -> Result<Option<ComponentNetworkType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentNetworkType>(
            &self.pool,
            "component_network_types",
            "component_network_id",
            id as i64
        ).await
    }

    async fn create_network_type(&self, network_type: &ComponentNetworkType) -> Result<i32, sqlx::Error> {
        let columns = &["vendor_name", "device_name", "driver", "max_speed_mbps"];
        let sql = DatabaseHelper::build_insert_sql("component_network_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&network_type.vendor_name)
            .bind(&network_type.device_name)
            .bind(&network_type.driver)
            .bind(network_type.max_speed_mbps)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // GPU TYPES
    // ===================================================================
    
    async fn get_all_gpu_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentGpuType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("vendor, model".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("vendor, model".to_string()),
        };

        QueryBuilderHelper::select::<ComponentGpuType>(
            &self.pool,
            "component_gpu_types",
            options
        ).await
    }

    async fn get_gpu_type_by_id(&self, id: i32) -> Result<Option<ComponentGpuType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentGpuType>(
            &self.pool,
            "component_gpu_types",
            "component_gpu_id",
            id as i64
        ).await
    }

    async fn create_gpu_type(&self, gpu_type: &ComponentGpuType) -> Result<i32, sqlx::Error> {
        let columns = &["vendor", "model", "vram_mb"];
        let sql = DatabaseHelper::build_insert_sql("component_gpu_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&gpu_type.vendor)
            .bind(&gpu_type.model)
            .bind(gpu_type.vram_mb)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // BMC TYPES
    // ===================================================================
    
    async fn get_all_bmc_types(&self, query: CommonPaginationQuery) -> Result<Vec<ComponentBmcType>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("vendor, model".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("vendor, model".to_string()),
        };

        QueryBuilderHelper::select::<ComponentBmcType>(
            &self.pool,
            "component_bmc_types",
            options
        ).await
    }

    async fn get_bmc_type_by_id(&self, id: i32) -> Result<Option<ComponentBmcType>, sqlx::Error> {
        DatabaseHelper::get_by_id::<ComponentBmcType>(
            &self.pool,
            "component_bmc_types",
            "component_bmc_id",
            id as i64
        ).await
    }

    async fn create_bmc_type(&self, bmc_type: &ComponentBmcType) -> Result<i32, sqlx::Error> {
        let columns = &["vendor", "model", "firmware_version", "supports_ipmi", "supports_redfish", 
                       "supports_web_interface", "supports_kvm", "supports_virtual_media", 
                       "has_dedicated_port", "max_speed_mbps"];
        let sql = DatabaseHelper::build_insert_sql("component_bmc_types", columns);
        
        let result = sqlx::query(&sql)
            .bind(&bmc_type.vendor)
            .bind(&bmc_type.model)
            .bind(&bmc_type.firmware_version)
            .bind(bmc_type.supports_ipmi)
            .bind(bmc_type.supports_redfish)
            .bind(bmc_type.supports_web_interface)
            .bind(bmc_type.supports_kvm)
            .bind(bmc_type.supports_virtual_media)
            .bind(bmc_type.has_dedicated_port)
            .bind(bmc_type.max_speed_mbps)
            .execute(&self.pool)
            .await?;

        Ok(result.last_insert_id() as i32)
    }

    // ===================================================================
    // CATALOG OPERATIONS
    // ===================================================================
    
    async fn get_complete_catalog(&self) -> Result<ComponentCatalog, sqlx::Error> {
        let empty_query = CommonPaginationQuery {
            page: Some(1),
            per_page: Some(1000), // Large number to get all items
            columns: None,
            search: None,
            filters: HashMap::new(),
        };
        
        let cpus = self.get_all_cpu_types(empty_query.clone()).await?;
        let memory = self.get_all_memory_types(empty_query.clone()).await?;
        let disks = self.get_all_disk_types(empty_query.clone()).await?;
        let network_interfaces = self.get_all_network_types(empty_query.clone()).await?;
        let gpus = self.get_all_gpu_types(empty_query.clone()).await?;
        let motherboards = self.get_all_motherboard_types(empty_query.clone()).await?;
        let bmcs = self.get_all_bmc_types(empty_query).await?;

        Ok(ComponentCatalog {
            cpus,
            memory,
            disks,
            network_interfaces,
            gpus,
            motherboards,
            bmcs,
        })
    }

    async fn get_catalog_stats(&self) -> Result<ComponentCatalogStats, sqlx::Error> {
        let cpu_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_cpu_types")
            .fetch_one(&self.pool).await?;
        
        let memory_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_memory_types")
            .fetch_one(&self.pool).await?;
        
        let disk_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_disk_types")
            .fetch_one(&self.pool).await?;
        
        let network_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_network_types")
            .fetch_one(&self.pool).await?;
        
        let gpu_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_gpu_types")
            .fetch_one(&self.pool).await?;
        
        let motherboard_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_motherboard_types")
            .fetch_one(&self.pool).await?;
        
        let bmc_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM component_bmc_types")
            .fetch_one(&self.pool).await?;

        Ok(ComponentCatalogStats {
            total_cpu_types: cpu_count.0 as i32,
            total_memory_types: memory_count.0 as i32,
            total_disk_types: disk_count.0 as i32,
            total_network_types: network_count.0 as i32,
            total_gpu_types: gpu_count.0 as i32,
            total_motherboard_types: motherboard_count.0 as i32,
            total_bmc_types: bmc_count.0 as i32,
        })
    }
}