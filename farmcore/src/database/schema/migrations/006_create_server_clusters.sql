-- Create server cluster tables with proper relationships
-- Description: Creates cluster hierarchy tables to organize servers into clusters and sub-clusters
--              with metadata, capacity tracking, and proper foreign key relationships.
-- Note: This migration depends on 005_create_datacenters.sql being run first.

-- ===================================================================
-- SERVER CLUSTER TABLES
-- ===================================================================

-- Main Clusters Table
-- Represents the top-level cluster grouping for servers
CREATE TABLE IF NOT EXISTS server_clusters (
    cluster_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Information
    cluster_name VARCHAR(255) NOT NULL UNIQUE,
    cluster_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    
    -- Location Information
    data_center_id INT DEFAULT 0,
    region VARCHAR(100),
    availability_zone VARCHAR(100),
    
    -- Management Fields
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
    environment_type ENUM('PRODUCTION', 'DEVELOPMENT', 'QA', 'STAGING', 'TESTING') DEFAULT 'PRODUCTION',
    
    -- Capacity Tracking
    total_servers INT DEFAULT 0,
    active_servers INT DEFAULT 0,
    max_capacity INT,
    
    -- Metadata
    owner VARCHAR(255),
    contact_email VARCHAR(255),
    tags JSON,
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cluster_name (cluster_name),
    INDEX idx_cluster_code (cluster_code),
    INDEX idx_status (status),
    INDEX idx_environment (environment_type)
);

-- Sub-Clusters Table
-- Represents logical groupings within a cluster (e.g., compute pool, storage pool, etc.)
CREATE TABLE IF NOT EXISTS server_sub_clusters (
    sub_cluster_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    
    -- Basic Information
    sub_cluster_name VARCHAR(255) NOT NULL,
    sub_cluster_code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Sub-cluster Type/Purpose
    sub_cluster_type ENUM('COMPUTE', 'STORAGE', 'MIXED', 'MANAGEMENT', 'NETWORK', 'OTHER') DEFAULT 'MIXED',
    
    -- Management Fields
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
    
    -- Capacity Tracking
    total_servers INT DEFAULT 0,
    active_servers INT DEFAULT 0,
    max_capacity INT,
    
    -- Workload Information
    workload_type VARCHAR(100),
    priority_level ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
    
    -- Metadata
    tags JSON,
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cluster_id) REFERENCES server_clusters(cluster_id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_sub_cluster (cluster_id, sub_cluster_code),
    INDEX idx_sub_cluster_name (sub_cluster_name),
    INDEX idx_cluster_id (cluster_id),
    INDEX idx_status (status),
    INDEX idx_type (sub_cluster_type)
);