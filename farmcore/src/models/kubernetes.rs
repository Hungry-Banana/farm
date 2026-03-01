use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ===================================================================
// KUBERNETES CLUSTER MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesCluster {
    pub cluster_id: i32,
    pub cluster_name: String,
    pub cluster_uuid: Option<String>,
    pub description: Option<String>,
    pub cluster_version: String,
    pub api_server_endpoint: String,
    pub cluster_domain: Option<String>,
    pub distribution: Option<String>,
    pub distribution_version: Option<String>,
    pub service_cidr: Option<String>,
    pub pod_cidr: Option<String>,
    pub cni_plugin: Option<String>,
    pub cni_version: Option<String>,
    pub container_runtime: Option<String>,
    pub runtime_version: Option<String>,
    pub cluster_state: String,
    pub cluster_status: String,
    pub is_ha_enabled: Option<bool>,
    pub control_plane_nodes: Option<i32>,
    pub kubeconfig_path: Option<String>,
    pub certificate_authority_data: Option<String>,
    pub rbac_enabled: Option<bool>,
    pub network_policy_enabled: Option<bool>,
    pub pod_security_policy_enabled: Option<bool>,
    pub admission_controllers: Option<String>,
    pub monitoring_enabled: Option<bool>,
    pub monitoring_stack: Option<String>,
    pub logging_enabled: Option<bool>,
    pub logging_stack: Option<String>,
    pub created_by: Option<String>,
    pub managed_by: Option<String>,
    pub organization: Option<String>,
    pub environment: Option<String>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub provisioned_at: Option<chrono::NaiveDateTime>,
    pub last_health_check: Option<chrono::NaiveDateTime>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub tags: Option<String>,
}

impl KubernetesCluster {
    pub const TABLE: &'static str = "kubernetes_clusters";
}

// ===================================================================
// KUBERNETES NODE GROUP MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesNodeGroup {
    pub node_group_id: i32,
    pub cluster_id: i32,
    pub node_group_name: String,
    pub node_group_uuid: Option<String>,
    pub description: Option<String>,
    pub node_group_type: String,
    pub min_nodes: Option<i32>,
    pub max_nodes: Option<i32>,
    pub desired_nodes: Option<i32>,
    pub current_nodes: Option<i32>,
    pub auto_scaling_enabled: Option<bool>,
    pub node_instance_type: Option<String>,
    pub node_image: Option<String>,
    pub node_disk_size_gb: Option<i32>,
    pub node_labels: Option<serde_json::Value>,
    pub node_taints: Option<serde_json::Value>,
    pub node_group_state: String,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
}

impl KubernetesNodeGroup {
    pub const TABLE: &'static str = "kubernetes_node_groups";
}

// ===================================================================
// KUBERNETES NODE MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesNode {
    pub k8s_node_id: i32,
    pub cluster_id: i32,
    pub node_group_id: Option<i32>,
    pub server_id: Option<i32>,
    pub vm_id: Option<i32>,
    pub node_name: String,
    pub node_uuid: Option<String>,
    pub node_uid: Option<String>,
    pub node_type: String,
    pub internal_ip: Option<String>,
    pub external_ip: Option<String>,
    pub hostname: Option<String>,
    pub cpu_capacity: Option<i32>,
    pub memory_capacity_mb: Option<i64>,
    pub pod_capacity: Option<i32>,
    pub ephemeral_storage_gb: Option<i32>,
    pub cpu_allocatable: Option<i32>,
    pub memory_allocatable_mb: Option<i64>,
    pub pod_allocatable: Option<i32>,
    pub node_state: String,
    pub is_schedulable: Option<bool>,
    pub is_cordoned: Option<bool>,
    pub ready_condition: Option<String>,
    pub memory_pressure: Option<bool>,
    pub disk_pressure: Option<bool>,
    pub pid_pressure: Option<bool>,
    pub network_unavailable: Option<bool>,
    pub os_image: Option<String>,
    pub os_architecture: Option<String>,
    pub kernel_version: Option<String>,
    pub container_runtime_version: Option<String>,
    pub kubelet_version: Option<String>,
    pub kube_proxy_version: Option<String>,
    pub roles: Option<String>,
    pub labels: Option<serde_json::Value>,
    pub taints: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub registered_at: Option<chrono::NaiveDateTime>,
    pub last_heartbeat: Option<chrono::NaiveDateTime>,
}

impl KubernetesNode {
    pub const TABLE: &'static str = "kubernetes_nodes";
}

// ===================================================================
// KUBERNETES NAMESPACE MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesNamespace {
    pub namespace_id: i32,
    pub cluster_id: i32,
    pub namespace_name: String,
    pub namespace_uid: Option<String>,
    pub description: Option<String>,
    pub namespace_state: String,
    pub resource_quota_enabled: Option<bool>,
    pub cpu_limit: Option<String>,
    pub memory_limit: Option<String>,
    pub storage_limit: Option<String>,
    pub pod_limit: Option<i32>,
    pub service_limit: Option<i32>,
    pub network_policy_enabled: Option<bool>,
    pub default_deny_ingress: Option<bool>,
    pub default_deny_egress: Option<bool>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
    pub team: Option<String>,
    pub owner: Option<String>,
    // Additional fields for API responses
    #[sqlx(default)]
    pub status: Option<String>,
}

impl KubernetesNamespace {
    pub const TABLE: &'static str = "kubernetes_namespaces";
}

// ===================================================================
// KUBERNETES WORKLOAD MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesWorkload {
    pub workload_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub workload_name: String,
    pub workload_uid: Option<String>,
    pub workload_type: String,
    pub replicas_desired: Option<i32>,
    pub replicas_current: Option<i32>,
    pub replicas_ready: Option<i32>,
    pub replicas_available: Option<i32>,
    pub replicas_updated: Option<i32>,
    pub container_image: Option<String>,
    pub container_images: Option<serde_json::Value>,
    pub strategy_type: Option<String>,
    pub max_surge: Option<i32>,
    pub max_unavailable: Option<i32>,
    pub workload_state: String,
    pub is_paused: Option<bool>,
    pub node_selector: Option<serde_json::Value>,
    pub node_affinity: Option<serde_json::Value>,
    pub pod_affinity: Option<serde_json::Value>,
    pub tolerations: Option<serde_json::Value>,
    pub cpu_request: Option<String>,
    pub memory_request: Option<String>,
    pub cpu_limit: Option<String>,
    pub memory_limit: Option<String>,
    pub schedule: Option<String>,
    pub last_schedule_time: Option<chrono::NaiveDateTime>,
    pub next_schedule_time: Option<chrono::NaiveDateTime>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub selector: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
    // Additional fields for API responses (joined data)
    #[sqlx(default)]
    pub namespace: Option<String>,
    #[sqlx(default)]
    pub replicas: Option<i32>,
}

impl KubernetesWorkload {
    pub const TABLE: &'static str = "kubernetes_workloads";
}

// ===================================================================
// KUBERNETES POD MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesPod {
    pub pod_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub workload_id: Option<i32>,
    pub k8s_node_id: Option<i32>,
    pub pod_name: String,
    pub pod_uid: Option<String>,
    pub pod_ip: Option<String>,
    pub host_ip: Option<String>,
    pub pod_phase: String,
    pub pod_state: String,
    pub is_ready: Option<bool>,
    pub initialized: Option<bool>,
    pub containers_ready: Option<bool>,
    pub pod_scheduled: Option<bool>,
    pub container_count: Option<i32>,
    pub init_container_count: Option<i32>,
    pub restart_count: Option<i32>,
    pub qos_class: Option<String>,
    pub cpu_request: Option<String>,
    pub memory_request: Option<String>,
    pub cpu_limit: Option<String>,
    pub memory_limit: Option<String>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub started_at: Option<chrono::NaiveDateTime>,
    pub finished_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
    // Additional fields for API responses (joined data)
    #[sqlx(default)]
    pub namespace: Option<String>,
    #[sqlx(default)]
    pub status: Option<String>,
    #[sqlx(default)]
    pub node_name: Option<String>,
}

impl KubernetesPod {
    pub const TABLE: &'static str = "kubernetes_pods";
}

// ===================================================================
// KUBERNETES SERVICE MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesService {
    pub service_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub service_name: String,
    pub service_uid: Option<String>,
    pub service_type: String,
    pub cluster_ip: Option<String>,
    pub external_ips: Option<serde_json::Value>,
    pub load_balancer_ip: Option<String>,
    pub external_name: Option<String>,
    pub ports: Option<serde_json::Value>,
    pub session_affinity: Option<String>,
    pub session_affinity_timeout_seconds: Option<i32>,
    pub selector: Option<serde_json::Value>,
    pub external_traffic_policy: Option<String>,
    pub health_check_node_port: Option<i32>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
    // Additional fields for API responses (joined data)
    #[sqlx(default)]
    pub namespace: Option<String>,
}

impl KubernetesService {
    pub const TABLE: &'static str = "kubernetes_services";
}

// ===================================================================
// KUBERNETES INGRESS MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesIngress {
    pub ingress_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub ingress_name: String,
    pub ingress_uid: Option<String>,
    pub ingress_class: Option<String>,
    pub rules: Option<serde_json::Value>,
    pub tls_config: Option<serde_json::Value>,
    pub default_backend_service: Option<String>,
    pub default_backend_port: Option<i32>,
    pub load_balancer_ingress: Option<serde_json::Value>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
}

impl KubernetesIngress {
    pub const TABLE: &'static str = "kubernetes_ingresses";
}

// ===================================================================
// KUBERNETES EVENT MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesEvent {
    pub event_id: i32,
    pub cluster_id: i32,
    pub namespace_id: Option<i32>,
    pub event_name: Option<String>,
    pub event_uid: Option<String>,
    pub event_type: String,
    pub reason: Option<String>,
    pub message: Option<String>,
    pub involved_object_kind: Option<String>,
    pub involved_object_name: Option<String>,
    pub involved_object_uid: Option<String>,
    pub involved_object_namespace: Option<String>,
    pub source_component: Option<String>,
    pub source_host: Option<String>,
    pub event_count: Option<i32>,
    pub first_occurrence: Option<chrono::NaiveDateTime>,
    pub last_occurrence: Option<chrono::NaiveDateTime>,
    pub action: Option<String>,
    pub reporting_controller: Option<String>,
    pub reporting_instance: Option<String>,
    pub created_at: Option<chrono::NaiveDateTime>,
}

impl KubernetesEvent {
    pub const TABLE: &'static str = "kubernetes_events";
}

// ===================================================================
// KUBERNETES METRIC MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesMetric {
    pub metric_id: i32,
    pub cluster_id: i32,
    pub resource_type: String,
    pub resource_id: i32,
    pub resource_name: Option<String>,
    pub cpu_usage_cores: Option<f64>,
    pub cpu_usage_percent: Option<f64>,
    pub cpu_request_cores: Option<f64>,
    pub cpu_limit_cores: Option<f64>,
    pub memory_usage_bytes: Option<i64>,
    pub memory_usage_mb: Option<i32>,
    pub memory_usage_percent: Option<f64>,
    pub memory_request_mb: Option<i32>,
    pub memory_limit_mb: Option<i32>,
    pub memory_working_set_bytes: Option<i64>,
    pub storage_usage_bytes: Option<i64>,
    pub storage_usage_gb: Option<f64>,
    pub storage_available_bytes: Option<i64>,
    pub network_rx_bytes: Option<i64>,
    pub network_tx_bytes: Option<i64>,
    pub network_rx_errors: Option<i32>,
    pub network_tx_errors: Option<i32>,
    pub fs_reads: Option<i64>,
    pub fs_writes: Option<i64>,
    pub fs_read_bytes: Option<i64>,
    pub fs_write_bytes: Option<i64>,
    pub collected_at: Option<chrono::NaiveDateTime>,
}

impl KubernetesMetric {
    pub const TABLE: &'static str = "kubernetes_metrics";
}

// ===================================================================
// KUBERNETES SECRET MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesSecret {
    pub secret_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub secret_name: String,
    pub secret_uid: Option<String>,
    pub secret_type: String,
    pub data_keys: Option<serde_json::Value>,
    pub data_size_bytes: Option<i32>,
    pub is_immutable: Option<bool>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
}

impl KubernetesSecret {
    pub const TABLE: &'static str = "kubernetes_secrets";
}

// ===================================================================
// KUBERNETES CONFIGMAP MODEL
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KubernetesConfigMap {
    pub configmap_id: i32,
    pub cluster_id: i32,
    pub namespace_id: i32,
    pub configmap_name: String,
    pub configmap_uid: Option<String>,
    pub data_keys: Option<serde_json::Value>,
    pub binary_data_keys: Option<serde_json::Value>,
    pub data_size_bytes: Option<i32>,
    pub is_immutable: Option<bool>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub created_by: Option<String>,
}

impl KubernetesConfigMap {
    pub const TABLE: &'static str = "kubernetes_configmaps";
}

// ===================================================================
// COMPOSITE STRUCTURES
// ===================================================================
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterWithDetails {
    pub cluster: KubernetesCluster,
    pub node_groups: Vec<KubernetesNodeGroup>,
    pub nodes: Vec<KubernetesNode>,
    pub namespaces: Vec<KubernetesNamespace>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamespaceWithResources {
    pub namespace: KubernetesNamespace,
    pub workloads: Vec<KubernetesWorkload>,
    pub services: Vec<KubernetesService>,
    pub ingresses: Vec<KubernetesIngress>,
    pub pods: Vec<KubernetesPod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeWithMetrics {
    pub node: KubernetesNode,
    pub metrics: Option<KubernetesMetric>,
    pub pods: Vec<KubernetesPod>,
}
