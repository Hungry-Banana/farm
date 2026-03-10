-- Name: Server Cluster Organization Data
-- Description: Loads sample cluster and sub-cluster data for organizing servers into logical groups. Creates development, production, and disaster recovery clusters with various sub-cluster types.
-- Dependencies: 005_datacenters
-- Environment: development
-- Server Cluster Seed Data

-- ===================================================================
-- SERVER CLUSTERS
-- ===================================================================
INSERT IGNORE INTO server_clusters (
    cluster_id,
    cluster_name,
    cluster_code,
    description,
    data_center_id,
    region,
    availability_zone,
    status,
    environment_type,
    total_servers,
    active_servers,
    max_capacity,
    owner,
    contact_email,
    tags,
    metadata
) VALUES 
-- Cluster 1: Development Cluster
(1,
 'Development Lab Cluster',
 'DEV-SFO-01',
 'Primary development and testing cluster in San Francisco lab',
 1,
 'US-West',
 'us-west-1a',
 'ACTIVE',
 'DEVELOPMENT',
 0,
 0,
 50,
 'Development Team',
 'dev-team@example.com',
 '{"environment": "development", "cost_center": "DEV-001", "project": "lab"}',
 '{"ansible_group": "dev_cluster", "monitoring": "enabled", "backup": "daily"}'
),

-- Cluster 2: Production Cluster
(2,
 'Production Dallas Cluster',
 'PROD-DFW-01',
 'Primary production cluster in Dallas datacenter',
 2,
 'US-Central',
 'us-central-1a',
 'ACTIVE',
 'PRODUCTION',
 0,
 0,
 100,
 'Operations Team',
 'ops-team@example.com',
 '{"environment": "production", "cost_center": "PROD-001", "criticality": "high"}',
 '{"ansible_group": "prod_cluster", "monitoring": "enabled", "backup": "hourly", "sla": "99.99"}'
),

-- Cluster 3: DR Cluster
(3,
 'Disaster Recovery NYC Cluster',
 'DR-NYC-01',
 'Disaster recovery cluster in New York',
 3,
 'US-East',
 'us-east-1a',
 'ACTIVE',
 'PRODUCTION',
 0,
 0,
 50,
 'DR Team',
 'dr-team@example.com',
 '{"environment": "disaster_recovery", "cost_center": "DR-001", "failover": "automatic"}',
 '{"ansible_group": "dr_cluster", "monitoring": "enabled", "backup": "realtime", "replication_mode": "async"}'
),

-- Cluster 4: QA/Testing Cluster
(4,
 'QA Testing Cluster',
 'QA-SFO-01',
 'Quality assurance and testing cluster',
 1,
 'US-West',
 'us-west-1b',
 'ACTIVE',
 'QA',
 0,
 0,
 30,
 'QA Team',
 'qa-team@example.com',
 '{"environment": "qa", "cost_center": "QA-001", "auto_reset": "nightly"}',
 '{"ansible_group": "qa_cluster", "monitoring": "enabled", "backup": "weekly"}'
),

-- Cluster 5: Staging Cluster
(5,
 'Staging Pre-Production Cluster',
 'STAGE-DFW-01',
 'Staging environment for pre-production testing',
 2,
 'US-Central',
 'us-central-1b',
 'ACTIVE',
 'STAGING',
 0,
 0,
 40,
 'Release Team',
 'release-team@example.com',
 '{"environment": "staging", "cost_center": "STAGE-001", "prod_mirror": true}',
 '{"ansible_group": "staging_cluster", "monitoring": "enabled", "backup": "daily"}'
);

-- ===================================================================
-- SERVER SUB-CLUSTERS
-- ===================================================================
INSERT IGNORE INTO server_sub_clusters (
    sub_cluster_id,
    cluster_id,
    sub_cluster_name,
    sub_cluster_code,
    description,
    sub_cluster_type,
    status,
    total_servers,
    active_servers,
    max_capacity,
    workload_type,
    priority_level,
    tags,
    metadata
) VALUES 
-- Development Cluster Sub-Clusters
(1, 1, 'Dev Compute Pool', 'COMPUTE-01', 'General compute servers for development', 
 'COMPUTE', 'ACTIVE', 0, 0, 25, 'web_applications', 'MEDIUM',
 '{"workload": "web", "autoscaling": false}',
 '{"cpu_overcommit": 2, "memory_overcommit": 1.5}'
),

(2, 1, 'Dev Storage Pool', 'STORAGE-01', 'Storage and database servers for development',
 'STORAGE', 'ACTIVE', 0, 0, 15, 'databases', 'MEDIUM',
 '{"workload": "database", "replication": false}',
 '{"disk_type": "mixed", "backup_tier": "standard"}'
),

(3, 1, 'Dev Management', 'MGMT-01', 'Management and monitoring servers',
 'MANAGEMENT', 'ACTIVE', 0, 0, 10, 'monitoring', 'LOW',
 '{"workload": "monitoring", "critical": false}',
 '{"monitoring_tools": ["prometheus", "grafana"]}'
),

-- Production Cluster Sub-Clusters
(4, 2, 'Prod Web Frontend', 'WEB-01', 'Production web frontend servers',
 'COMPUTE', 'ACTIVE', 0, 0, 30, 'web_frontend', 'HIGH',
 '{"workload": "web", "autoscaling": true, "criticality": "high"}',
 '{"load_balancer": "haproxy", "ssl_termination": true}'
),

(5, 2, 'Prod API Backend', 'API-01', 'Production API backend servers',
 'COMPUTE', 'ACTIVE', 0, 0, 30, 'api_services', 'HIGH',
 '{"workload": "api", "autoscaling": true, "criticality": "high"}',
 '{"rate_limiting": true, "cache": "redis"}'
),

(6, 2, 'Prod Database Primary', 'DB-PRIMARY-01', 'Production primary database servers',
 'STORAGE', 'ACTIVE', 0, 0, 20, 'database_primary', 'HIGH',
 '{"workload": "database", "replication": "async", "criticality": "critical"}',
 '{"database_type": "postgresql", "high_availability": true}'
),

(7, 2, 'Prod Database Replica', 'DB-REPLICA-01', 'Production read replica database servers',
 'STORAGE', 'ACTIVE', 0, 0, 20, 'database_replica', 'MEDIUM',
 '{"workload": "database", "read_only": true}',
 '{"database_type": "postgresql", "replication_lag_max_seconds": 5}'
),

-- DR Cluster Sub-Clusters
(8, 3, 'DR Standby Compute', 'DR-COMPUTE-01', 'Disaster recovery standby compute pool',
 'COMPUTE', 'ACTIVE', 0, 0, 20, 'web_applications', 'MEDIUM',
 '{"workload": "web", "standby": true, "failover": "automatic"}',
 '{"warm_standby": true, "sync_interval": "5m"}'
),

(9, 3, 'DR Database Standby', 'DR-DB-01', 'Disaster recovery database standby',
 'STORAGE', 'ACTIVE', 0, 0, 15, 'database_standby', 'HIGH',
 '{"workload": "database", "standby": true, "criticality": "high"}',
 '{"replication_type": "async", "rpo_minutes": 5, "rto_minutes": 15}'
),

-- QA Cluster Sub-Clusters
(10, 4, 'QA Functional Testing', 'QA-FUNC-01', 'Functional testing environment',
 'COMPUTE', 'ACTIVE', 0, 0, 15, 'testing', 'LOW',
 '{"workload": "qa", "reset_schedule": "nightly"}',
 '{"test_framework": "selenium", "parallel_tests": 10}'
),

(11, 4, 'QA Performance Testing', 'QA-PERF-01', 'Performance and load testing environment',
 'COMPUTE', 'ACTIVE', 0, 0, 10, 'performance_testing', 'MEDIUM',
 '{"workload": "load_testing", "monitoring": "detailed"}',
 '{"test_tools": ["jmeter", "locust"], "metrics_retention": "30d"}'
),

-- Staging Cluster Sub-Clusters
(12, 5, 'Staging Application', 'STAGE-APP-01', 'Staging application servers',
 'COMPUTE', 'ACTIVE', 0, 0, 20, 'web_applications', 'MEDIUM',
 '{"workload": "web", "prod_mirror": true}',
 '{"config_sync": "production", "data_refresh": "weekly"}'
),

(13, 5, 'Staging Database', 'STAGE-DB-01', 'Staging database servers',
 'STORAGE', 'ACTIVE', 0, 0, 10, 'databases', 'MEDIUM',
 '{"workload": "database", "prod_mirror": true}',
 '{"data_subset": true, "anonymization": true}'
),

-- Mixed Purpose Sub-Cluster
(14, 1, 'Dev GPU Compute', 'GPU-01', 'GPU compute for ML development',
 'OTHER', 'ACTIVE', 0, 0, 5, 'machine_learning', 'LOW',
 '{"workload": "ml", "gpu": true, "jupyter": true}',
 '{"gpu_type": "nvidia_tesla", "shared_storage": true}'
);
