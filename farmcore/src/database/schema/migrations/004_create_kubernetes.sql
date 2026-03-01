-- Create Kubernetes management tables
-- Description: Creates Kubernetes schema including clusters, nodes, node groups,
--              namespaces, workloads, services, ingresses, pods, events, metrics,
--              secrets, and configmaps.

-- ===================================================================
-- KUBERNETES CLUSTERS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_clusters (
    cluster_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Cluster Identity
    cluster_name VARCHAR(255) NOT NULL UNIQUE,
    cluster_uuid VARCHAR(100) UNIQUE,
    description TEXT,
    
    -- Cluster Configuration
    cluster_version VARCHAR(50) NOT NULL, -- Kubernetes version (e.g., v1.28.2)
    api_server_endpoint VARCHAR(512) NOT NULL, -- API server URL
    cluster_domain VARCHAR(255) DEFAULT 'cluster.local',
    
    -- Distribution Information
    distribution ENUM('vanilla', 'k3s', 'k0s', 'rke', 'rke2', 'eks', 'aks', 'gke', 'openshift', 'rancher', 'microk8s', 'kubeadm') DEFAULT 'vanilla',
    distribution_version VARCHAR(50),
    
    -- Network Configuration
    service_cidr VARCHAR(50), -- Service CIDR (e.g., 10.96.0.0/12)
    pod_cidr VARCHAR(50), -- Pod CIDR (e.g., 10.244.0.0/16)
    cni_plugin ENUM('calico', 'flannel', 'weave', 'cilium', 'canal', 'antrea', 'kindnet', 'kubenet') DEFAULT 'calico',
    cni_version VARCHAR(50),
    
    -- Container Runtime
    container_runtime ENUM('containerd', 'docker', 'cri-o', 'podman') DEFAULT 'containerd',
    runtime_version VARCHAR(50),
    
    -- Cluster State
    cluster_state ENUM('initializing', 'ready', 'degraded', 'offline', 'upgrading', 'error') DEFAULT 'initializing',
    cluster_status ENUM('active', 'inactive', 'maintenance', 'archived') DEFAULT 'active',
    
    -- High Availability
    is_ha_enabled BOOLEAN DEFAULT FALSE,
    control_plane_nodes INT DEFAULT 1,
    
    -- Access Configuration
    kubeconfig_path VARCHAR(512),
    certificate_authority_data TEXT,
    
    -- Cluster Features
    rbac_enabled BOOLEAN DEFAULT TRUE,
    network_policy_enabled BOOLEAN DEFAULT FALSE,
    pod_security_policy_enabled BOOLEAN DEFAULT FALSE,
    admission_controllers TEXT, -- Comma-separated list
    
    -- Monitoring & Logging
    monitoring_enabled BOOLEAN DEFAULT FALSE,
    monitoring_stack VARCHAR(100), -- prometheus, grafana, etc.
    logging_enabled BOOLEAN DEFAULT FALSE,
    logging_stack VARCHAR(100), -- efk, elk, loki, etc.
    
    -- Cluster Management
    created_by VARCHAR(100),
    managed_by VARCHAR(100),
    organization VARCHAR(255),
    environment ENUM('development', 'staging', 'production', 'testing') DEFAULT 'development',
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    provisioned_at DATETIME NULL,
    last_health_check DATETIME NULL,
    
    -- Metadata
    labels JSON, -- Custom labels
    annotations JSON, -- Custom annotations
    tags VARCHAR(512), -- Comma-separated tags
    
    INDEX idx_cluster_name (cluster_name),
    INDEX idx_cluster_uuid (cluster_uuid),
    INDEX idx_cluster_state (cluster_state),
    INDEX idx_cluster_status (cluster_status),
    INDEX idx_distribution (distribution),
    INDEX idx_environment (environment),
    INDEX idx_created_by (created_by),
    INDEX idx_managed_by (managed_by)
);

-- ===================================================================
-- KUBERNETES NODE GROUPS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_node_groups (
    node_group_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    
    -- Node Group Identity
    node_group_name VARCHAR(255) NOT NULL,
    node_group_uuid VARCHAR(100),
    description TEXT,
    
    -- Node Group Type
    node_group_type ENUM('control-plane', 'worker', 'etcd', 'mixed') DEFAULT 'worker',
    
    -- Scaling Configuration
    min_nodes INT DEFAULT 1,
    max_nodes INT DEFAULT 10,
    desired_nodes INT DEFAULT 1,
    current_nodes INT DEFAULT 0,
    auto_scaling_enabled BOOLEAN DEFAULT FALSE,
    
    -- Node Configuration
    node_instance_type VARCHAR(100), -- VM flavor or hardware type
    node_image VARCHAR(255), -- OS image for nodes
    node_disk_size_gb INT DEFAULT 50,
    
    -- Taints and Labels
    node_labels JSON, -- Labels to apply to nodes in this group
    node_taints JSON, -- Taints to apply to nodes in this group
    
    -- Node Group State
    node_group_state ENUM('creating', 'active', 'updating', 'deleting', 'error') DEFAULT 'creating',
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_node_group_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_cluster_node_group (cluster_id, node_group_name),
    INDEX idx_node_group_name (node_group_name),
    INDEX idx_node_group_type (node_group_type),
    INDEX idx_node_group_state (node_group_state),
    INDEX idx_auto_scaling (auto_scaling_enabled)
);

-- ===================================================================
-- KUBERNETES NODES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_nodes (
    k8s_node_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    node_group_id INT NULL,
    server_id INT NULL, -- Reference to physical server
    vm_id INT NULL, -- Reference to virtual machine (if node runs on VM)
    
    -- Node Identity
    node_name VARCHAR(255) NOT NULL,
    node_uuid VARCHAR(100),
    node_uid VARCHAR(100), -- Kubernetes UID
    
    -- Node Information
    node_type ENUM('control-plane', 'master', 'worker', 'etcd') DEFAULT 'worker',
    internal_ip VARCHAR(45),
    external_ip VARCHAR(45),
    hostname VARCHAR(255),
    
    -- Node Resources
    cpu_capacity INT, -- Total CPU cores
    memory_capacity_mb BIGINT, -- Total memory in MB
    pod_capacity INT, -- Maximum number of pods
    ephemeral_storage_gb INT, -- Ephemeral storage capacity
    
    -- Node Allocatable (resources available for scheduling)
    cpu_allocatable INT,
    memory_allocatable_mb BIGINT,
    pod_allocatable INT,
    
    -- Node Status
    node_state ENUM('ready', 'not-ready', 'unknown', 'scheduling-disabled') DEFAULT 'unknown',
    is_schedulable BOOLEAN DEFAULT TRUE,
    is_cordoned BOOLEAN DEFAULT FALSE,
    
    -- Node Conditions
    ready_condition VARCHAR(50),
    memory_pressure BOOLEAN DEFAULT FALSE,
    disk_pressure BOOLEAN DEFAULT FALSE,
    pid_pressure BOOLEAN DEFAULT FALSE,
    network_unavailable BOOLEAN DEFAULT FALSE,
    
    -- Operating System
    os_image VARCHAR(255),
    os_architecture VARCHAR(50),
    kernel_version VARCHAR(100),
    
    -- Container Runtime
    container_runtime_version VARCHAR(100),
    
    -- Kubelet Information
    kubelet_version VARCHAR(50),
    kube_proxy_version VARCHAR(50),
    
    -- Node Roles
    roles VARCHAR(255), -- Comma-separated roles
    
    -- Labels and Taints
    labels JSON,
    taints JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    registered_at DATETIME NULL,
    last_heartbeat DATETIME NULL,
    
    CONSTRAINT fk_k8s_node_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_k8s_node_group
        FOREIGN KEY (node_group_id) REFERENCES kubernetes_node_groups(node_group_id)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_k8s_node_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_k8s_node_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE SET NULL,
    
    UNIQUE KEY uk_cluster_node_name (cluster_id, node_name),
    INDEX idx_node_name (node_name),
    INDEX idx_node_uuid (node_uuid),
    INDEX idx_node_uid (node_uid),
    INDEX idx_node_type (node_type),
    INDEX idx_node_state (node_state),
    INDEX idx_internal_ip (internal_ip),
    INDEX idx_external_ip (external_ip),
    INDEX idx_is_schedulable (is_schedulable)
);

-- ===================================================================
-- KUBERNETES NAMESPACES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_namespaces (
    namespace_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    
    -- Namespace Identity
    namespace_name VARCHAR(255) NOT NULL,
    namespace_uid VARCHAR(100),
    description TEXT,
    
    -- Namespace Configuration
    namespace_state ENUM('active', 'terminating', 'inactive') DEFAULT 'active',
    
    -- Resource Quotas
    resource_quota_enabled BOOLEAN DEFAULT FALSE,
    cpu_limit VARCHAR(50), -- e.g., "100", "1000m"
    memory_limit VARCHAR(50), -- e.g., "1Gi", "500Mi"
    storage_limit VARCHAR(50),
    pod_limit INT,
    service_limit INT,
    
    -- Network Policies
    network_policy_enabled BOOLEAN DEFAULT FALSE,
    default_deny_ingress BOOLEAN DEFAULT FALSE,
    default_deny_egress BOOLEAN DEFAULT FALSE,
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    -- Management
    created_by VARCHAR(100),
    team VARCHAR(255),
    owner VARCHAR(100),
    
    CONSTRAINT fk_namespace_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_cluster_namespace (cluster_id, namespace_name),
    INDEX idx_namespace_name (namespace_name),
    INDEX idx_namespace_uid (namespace_uid),
    INDEX idx_namespace_state (namespace_state),
    INDEX idx_team (team),
    INDEX idx_owner (owner)
);

-- ===================================================================
-- KUBERNETES WORKLOADS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_workloads (
    workload_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    
    -- Workload Identity
    workload_name VARCHAR(255) NOT NULL,
    workload_uid VARCHAR(100),
    
    -- Workload Type
    workload_type ENUM('deployment', 'statefulset', 'daemonset', 'job', 'cronjob', 'replicaset') NOT NULL,
    
    -- Workload Configuration
    replicas_desired INT DEFAULT 1,
    replicas_current INT DEFAULT 0,
    replicas_ready INT DEFAULT 0,
    replicas_available INT DEFAULT 0,
    replicas_updated INT DEFAULT 0,
    
    -- Container Configuration
    container_image VARCHAR(512),
    container_images JSON, -- Array of all container images in pod template
    
    -- Update Strategy
    strategy_type VARCHAR(50), -- RollingUpdate, Recreate, OnDelete
    max_surge INT,
    max_unavailable INT,
    
    -- Workload State
    workload_state ENUM('running', 'pending', 'failed', 'succeeded', 'unknown') DEFAULT 'unknown',
    is_paused BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    node_selector JSON,
    node_affinity JSON,
    pod_affinity JSON,
    tolerations JSON,
    
    -- Resource Requests and Limits
    cpu_request VARCHAR(50),
    memory_request VARCHAR(50),
    cpu_limit VARCHAR(50),
    memory_limit VARCHAR(50),
    
    -- CronJob specific
    schedule VARCHAR(255), -- Cron schedule for CronJobs
    last_schedule_time DATETIME NULL,
    next_schedule_time DATETIME NULL,
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    selector JSON, -- Label selector for pods
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_workload_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_workload_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_namespace_workload (namespace_id, workload_name, workload_type),
    INDEX idx_workload_name (workload_name),
    INDEX idx_workload_uid (workload_uid),
    INDEX idx_workload_type (workload_type),
    INDEX idx_workload_state (workload_state),
    INDEX idx_container_image (container_image)
);

-- ===================================================================
-- KUBERNETES PODS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_pods (
    pod_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    workload_id INT NULL,
    k8s_node_id INT NULL,
    
    -- Pod Identity
    pod_name VARCHAR(255) NOT NULL,
    pod_uid VARCHAR(100),
    
    -- Pod Configuration
    pod_ip VARCHAR(45),
    host_ip VARCHAR(45),
    
    -- Pod Status
    pod_phase ENUM('pending', 'running', 'succeeded', 'failed', 'unknown') DEFAULT 'pending',
    pod_state ENUM('waiting', 'running', 'terminated') DEFAULT 'waiting',
    is_ready BOOLEAN DEFAULT FALSE,
    
    -- Pod Conditions
    initialized BOOLEAN DEFAULT FALSE,
    containers_ready BOOLEAN DEFAULT FALSE,
    pod_scheduled BOOLEAN DEFAULT FALSE,
    
    -- Container Information
    container_count INT DEFAULT 1,
    init_container_count INT DEFAULT 0,
    restart_count INT DEFAULT 0,
    
    -- QoS Class
    qos_class ENUM('Guaranteed', 'Burstable', 'BestEffort') DEFAULT 'BestEffort',
    
    -- Resource Usage
    cpu_request VARCHAR(50),
    memory_request VARCHAR(50),
    cpu_limit VARCHAR(50),
    memory_limit VARCHAR(50),
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    finished_at DATETIME NULL,
    deleted_at DATETIME NULL,
    
    CONSTRAINT fk_pod_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_pod_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_pod_workload
        FOREIGN KEY (workload_id) REFERENCES kubernetes_workloads(workload_id)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_pod_node
        FOREIGN KEY (k8s_node_id) REFERENCES kubernetes_nodes(k8s_node_id)
        ON DELETE SET NULL,
    
    UNIQUE KEY uk_cluster_pod_uid (cluster_id, pod_uid),
    INDEX idx_pod_name (pod_name),
    INDEX idx_pod_uid (pod_uid),
    INDEX idx_pod_phase (pod_phase),
    INDEX idx_pod_state (pod_state),
    INDEX idx_pod_ip (pod_ip),
    INDEX idx_is_ready (is_ready)
);

-- ===================================================================
-- KUBERNETES SERVICES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    
    -- Service Identity
    service_name VARCHAR(255) NOT NULL,
    service_uid VARCHAR(100),
    
    -- Service Type
    service_type ENUM('ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName') DEFAULT 'ClusterIP',
    
    -- Service Configuration
    cluster_ip VARCHAR(45),
    external_ips JSON, -- Array of external IPs
    load_balancer_ip VARCHAR(45),
    external_name VARCHAR(255), -- For ExternalName type
    
    -- Port Configuration
    ports JSON, -- Array of port configurations {port, targetPort, protocol, nodePort}
    
    -- Session Affinity
    session_affinity ENUM('None', 'ClientIP') DEFAULT 'None',
    session_affinity_timeout_seconds INT,
    
    -- Selector
    selector JSON, -- Label selector for pods
    
    -- External Traffic Policy
    external_traffic_policy ENUM('Cluster', 'Local') DEFAULT 'Cluster',
    
    -- Health Check
    health_check_node_port INT,
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_service_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_service_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_namespace_service (namespace_id, service_name),
    INDEX idx_service_name (service_name),
    INDEX idx_service_uid (service_uid),
    INDEX idx_service_type (service_type),
    INDEX idx_cluster_ip (cluster_ip),
    INDEX idx_load_balancer_ip (load_balancer_ip)
);

-- ===================================================================
-- KUBERNETES INGRESSES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_ingresses (
    ingress_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    
    -- Ingress Identity
    ingress_name VARCHAR(255) NOT NULL,
    ingress_uid VARCHAR(100),
    
    -- Ingress Controller
    ingress_class VARCHAR(100), -- nginx, traefik, haproxy, etc.
    
    -- Ingress Configuration
    rules JSON, -- Array of ingress rules {host, paths[{path, pathType, serviceName, servicePort}]}
    tls_config JSON, -- TLS configuration {hosts[], secretName}
    
    -- Default Backend
    default_backend_service VARCHAR(255),
    default_backend_port INT,
    
    -- Load Balancer
    load_balancer_ingress JSON, -- Array of {ip, hostname}
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_ingress_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_ingress_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_namespace_ingress (namespace_id, ingress_name),
    INDEX idx_ingress_name (ingress_name),
    INDEX idx_ingress_uid (ingress_uid),
    INDEX idx_ingress_class (ingress_class)
);

-- ===================================================================
-- KUBERNETES EVENTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NULL,
    
    -- Event Identity
    event_name VARCHAR(255),
    event_uid VARCHAR(100),
    
    -- Event Details
    event_type ENUM('Normal', 'Warning', 'Error') DEFAULT 'Normal',
    reason VARCHAR(255), -- Event reason (e.g., Started, Failed, Created)
    message TEXT, -- Event message
    
    -- Involved Object
    involved_object_kind VARCHAR(100), -- Pod, Node, Service, etc.
    involved_object_name VARCHAR(255),
    involved_object_uid VARCHAR(100),
    involved_object_namespace VARCHAR(255),
    
    -- Source
    source_component VARCHAR(255), -- kubelet, kube-scheduler, etc.
    source_host VARCHAR(255),
    
    -- Count
    event_count INT DEFAULT 1,
    first_occurrence DATETIME NULL,
    last_occurrence DATETIME NULL,
    
    -- Action
    action VARCHAR(255),
    reporting_controller VARCHAR(255),
    reporting_instance VARCHAR(255),
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_event_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_event_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    INDEX idx_event_type (event_type),
    INDEX idx_reason (reason),
    INDEX idx_involved_object (involved_object_kind, involved_object_name),
    INDEX idx_involved_object_uid (involved_object_uid),
    INDEX idx_source_component (source_component),
    INDEX idx_created_at (created_at),
    INDEX idx_last_occurrence (last_occurrence)
);

-- ===================================================================
-- KUBERNETES METRICS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    
    -- Metric Target
    resource_type ENUM('cluster', 'node', 'namespace', 'pod', 'workload') NOT NULL,
    resource_id INT NOT NULL, -- ID of the related resource
    resource_name VARCHAR(255),
    
    -- CPU Metrics
    cpu_usage_cores DECIMAL(10,3), -- CPU usage in cores
    cpu_usage_percent DECIMAL(5,2),
    cpu_request_cores DECIMAL(10,3),
    cpu_limit_cores DECIMAL(10,3),
    
    -- Memory Metrics
    memory_usage_bytes BIGINT,
    memory_usage_mb INT,
    memory_usage_percent DECIMAL(5,2),
    memory_request_mb INT,
    memory_limit_mb INT,
    memory_working_set_bytes BIGINT,
    
    -- Storage Metrics
    storage_usage_bytes BIGINT,
    storage_usage_gb DECIMAL(10,2),
    storage_available_bytes BIGINT,
    
    -- Network Metrics
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT,
    network_rx_errors INT,
    network_tx_errors INT,
    
    -- File System Metrics
    fs_reads BIGINT,
    fs_writes BIGINT,
    fs_read_bytes BIGINT,
    fs_write_bytes BIGINT,
    
    -- Timestamp
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_metric_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    INDEX idx_resource_metrics (resource_type, resource_id, collected_at),
    INDEX idx_collected_at (collected_at),
    INDEX idx_resource_name (resource_name)
);

-- ===================================================================
-- KUBERNETES SECRETS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_secrets (
    secret_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    
    -- Secret Identity
    secret_name VARCHAR(255) NOT NULL,
    secret_uid VARCHAR(100),
    
    -- Secret Type
    secret_type ENUM('Opaque', 'kubernetes.io/service-account-token', 'kubernetes.io/dockercfg', 
                     'kubernetes.io/dockerconfigjson', 'kubernetes.io/basic-auth', 
                     'kubernetes.io/ssh-auth', 'kubernetes.io/tls', 'bootstrap.kubernetes.io/token') DEFAULT 'Opaque',
    
    -- Secret Data
    data_keys JSON, -- Array of key names (not the actual secret values)
    data_size_bytes INT, -- Total size of secret data
    
    -- Immutability
    is_immutable BOOLEAN DEFAULT FALSE,
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_secret_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_secret_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_namespace_secret (namespace_id, secret_name),
    INDEX idx_secret_name (secret_name),
    INDEX idx_secret_uid (secret_uid),
    INDEX idx_secret_type (secret_type),
    INDEX idx_is_immutable (is_immutable)
);

-- ===================================================================
-- KUBERNETES CONFIGMAPS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS kubernetes_configmaps (
    configmap_id INT PRIMARY KEY AUTO_INCREMENT,
    cluster_id INT NOT NULL,
    namespace_id INT NOT NULL,
    
    -- ConfigMap Identity
    configmap_name VARCHAR(255) NOT NULL,
    configmap_uid VARCHAR(100),
    
    -- ConfigMap Data
    data_keys JSON, -- Array of configuration key names
    binary_data_keys JSON, -- Array of binary data key names
    data_size_bytes INT, -- Total size of config data
    
    -- Immutability
    is_immutable BOOLEAN DEFAULT FALSE,
    
    -- Labels and Annotations
    labels JSON,
    annotations JSON,
    
    -- Lifecycle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT fk_configmap_cluster
        FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(cluster_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_configmap_namespace
        FOREIGN KEY (namespace_id) REFERENCES kubernetes_namespaces(namespace_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_namespace_configmap (namespace_id, configmap_name),
    INDEX idx_configmap_name (configmap_name),
    INDEX idx_configmap_uid (configmap_uid),
    INDEX idx_is_immutable (is_immutable)
);
