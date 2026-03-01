use sqlx::MySqlPool;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::database::{QueryBuilderHelper, DatabaseHelper};
use crate::models::{
    KubernetesCluster, KubernetesNode, KubernetesNodeGroup, KubernetesNamespace,
    KubernetesWorkload, KubernetesPod, KubernetesService, KubernetesIngress,
    KubernetesEvent, KubernetesMetric, KubernetesSecret, KubernetesConfigMap,
    ClusterWithDetails, NamespaceWithResources, NodeWithMetrics, QueryOptions
};
use crate::api::query_parser::{CommonPaginationQuery, QueryParser};

// Inventory data structures matching the JSON format from farmmanager
#[derive(Debug, serde::Deserialize)]
pub struct K8sInventory {
    pub cluster_name: String,
    pub cluster_version: String,
    pub api_server: String,
    pub nodes: Vec<K8sNodeInventory>,
    pub namespaces: Vec<K8sNamespaceInventory>,
    pub pods: Option<Vec<K8sPodInventory>>,
    pub services: Option<Vec<K8sServiceInventory>>,
    pub workloads: Option<Vec<K8sWorkloadInventory>>,
}

#[derive(Debug, serde::Deserialize)]
pub struct K8sNodeInventory {
    pub node_name: String,
    pub node_uid: Option<String>,
    pub node_type: Option<String>,
    pub internal_ip: Option<String>,
    pub external_ip: Option<String>,
    pub hostname: Option<String>,
    pub cpu_capacity: Option<i32>,
    pub memory_capacity_mb: Option<i64>,
    pub pod_capacity: Option<i32>,
    pub node_state: Option<String>,
    pub kubelet_version: Option<String>,
    pub os_image: Option<String>,
    pub kernel_version: Option<String>,
    pub container_runtime_version: Option<String>,
    pub roles: Option<String>,
    pub labels: Option<serde_json::Value>,
    pub taints: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct K8sNamespaceInventory {
    pub namespace_name: String,
    pub namespace_uid: Option<String>,
    pub namespace_state: Option<String>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct K8sPodInventory {
    pub pod_name: String,
    pub pod_uid: Option<String>,
    pub namespace: String,
    pub pod_phase: Option<String>,
    pub node_name: Option<String>,
    pub pod_ip: Option<String>,
    pub host_ip: Option<String>,
    pub start_time: Option<String>,
    pub labels: Option<serde_json::Value>,
    pub annotations: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct K8sServiceInventory {
    pub service_name: String,
    pub service_uid: Option<String>,
    pub namespace: String,
    pub service_type: Option<String>,
    pub cluster_ip: Option<String>,
    pub external_ip: Option<String>,
    pub ports: Option<serde_json::Value>,
    pub selector: Option<serde_json::Value>,
    pub labels: Option<serde_json::Value>,
}

#[derive(Debug, serde::Deserialize)]
pub struct K8sWorkloadInventory {
    pub workload_name: String,
    pub workload_uid: Option<String>,
    pub namespace: String,
    pub workload_type: String,
    pub replicas_desired: Option<i32>,
    pub replicas_ready: Option<i32>,
    pub replicas_available: Option<i32>,
    pub labels: Option<serde_json::Value>,
    pub selector: Option<serde_json::Value>,
}

#[async_trait]
pub trait K8sRepo: Send + Sync {
    // Cluster operations
    async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<KubernetesCluster>, sqlx::Error>;
    async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<KubernetesCluster>, sqlx::Error>;
    async fn get_cluster_by_name(&self, cluster_name: &str) -> Result<Option<KubernetesCluster>, sqlx::Error>;
    async fn get_cluster_with_details(&self, cluster_id: i32) -> Result<Option<ClusterWithDetails>, sqlx::Error>;
    
    // Node operations
    async fn get_all_nodes(&self, cluster_id: i32) -> Result<Vec<KubernetesNode>, sqlx::Error>;
    async fn get_node_by_id(&self, node_id: i32) -> Result<Option<KubernetesNode>, sqlx::Error>;
    async fn get_node_with_metrics(&self, node_id: i32) -> Result<Option<NodeWithMetrics>, sqlx::Error>;
    async fn get_nodes_by_state(&self, cluster_id: i32, state: &str) -> Result<Vec<KubernetesNode>, sqlx::Error>;
    
    // Node Group operations
    async fn get_node_groups(&self, cluster_id: i32) -> Result<Vec<KubernetesNodeGroup>, sqlx::Error>;
    async fn get_node_group_by_id(&self, node_group_id: i32) -> Result<Option<KubernetesNodeGroup>, sqlx::Error>;
    
    // Namespace operations
    async fn get_all_namespaces(&self, cluster_id: i32) -> Result<Vec<KubernetesNamespace>, sqlx::Error>;
    async fn get_namespace_by_id(&self, namespace_id: i32) -> Result<Option<KubernetesNamespace>, sqlx::Error>;
    async fn get_namespace_with_resources(&self, namespace_id: i32) -> Result<Option<NamespaceWithResources>, sqlx::Error>;
    
    // Workload operations
    async fn get_all_workloads(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesWorkload>, sqlx::Error>;
    async fn get_workload_by_id(&self, workload_id: i32) -> Result<Option<KubernetesWorkload>, sqlx::Error>;
    async fn get_workloads_by_type(&self, cluster_id: i32, workload_type: &str) -> Result<Vec<KubernetesWorkload>, sqlx::Error>;
    
    // Pod operations
    async fn get_all_pods(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesPod>, sqlx::Error>;
    async fn get_pod_by_id(&self, pod_id: i32) -> Result<Option<KubernetesPod>, sqlx::Error>;
    async fn get_pods_by_node(&self, node_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error>;
    async fn get_pods_by_workload(&self, workload_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error>;
    
    // Service operations
    async fn get_all_services(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesService>, sqlx::Error>;
    async fn get_service_by_id(&self, service_id: i32) -> Result<Option<KubernetesService>, sqlx::Error>;
    
    // Ingress operations
    async fn get_all_ingresses(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesIngress>, sqlx::Error>;
    async fn get_ingress_by_id(&self, ingress_id: i32) -> Result<Option<KubernetesIngress>, sqlx::Error>;
    
    // Event operations
    async fn get_recent_events(&self, cluster_id: i32, limit: i64) -> Result<Vec<KubernetesEvent>, sqlx::Error>;
    async fn get_events_by_object(&self, cluster_id: i32, object_kind: &str, object_name: &str) -> Result<Vec<KubernetesEvent>, sqlx::Error>;
    
    // Metrics operations
    async fn get_latest_cluster_metrics(&self, cluster_id: i32) -> Result<Option<KubernetesMetric>, sqlx::Error>;
    async fn get_node_metrics(&self, node_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error>;
    async fn get_pod_metrics(&self, pod_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error>;
    
    // Secret and ConfigMap operations
    async fn get_secrets(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesSecret>, sqlx::Error>;
    async fn get_configmaps(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesConfigMap>, sqlx::Error>;
    
    // Statistics
    async fn get_cluster_overview_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error>;
    async fn get_pod_counts_by_phase(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error>;
    async fn get_workload_counts_by_type(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error>;
    
    // Update operations
    async fn update_cluster(&self, cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    async fn update_node(&self, node_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error>;
    
    // Inventory upsert
    async fn upsert_cluster_from_inventory(&self, inventory: K8sInventory) -> Result<i32, sqlx::Error>;
}

#[derive(Clone)]
pub struct KubernetesRepository {
    pool: MySqlPool,
}

impl KubernetesRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    // ===================================================================
    // CLUSTER OPERATIONS
    // ===================================================================
    
    /// Get all clusters with pagination
    pub async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<KubernetesCluster>, sqlx::Error> {
        let (_, per_page, offset, columns, where_conditions, _) = QueryParser::parse_all(
            &query,
            Some("cluster_id DESC".to_string())
        ).map_err(|e| sqlx::Error::Protocol(format!("Query parsing error: {}", e)))?;

        let options = QueryOptions {
            columns,
            where_conditions,
            limit: Some(per_page),
            offset: Some(offset),
            order_by: Some("cluster_id DESC".to_string()),
        };

        QueryBuilderHelper::select(&self.pool, KubernetesCluster::TABLE, options).await
    }

    /// Get cluster by ID
    pub async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<KubernetesCluster>, sqlx::Error> {
        let cluster: Option<KubernetesCluster> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ?", 
            KubernetesCluster::TABLE
        ))
        .bind(cluster_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(cluster)
    }

    /// Get cluster by name
    pub async fn get_cluster_by_name(&self, cluster_name: &str) -> Result<Option<KubernetesCluster>, sqlx::Error> {
        let cluster: Option<KubernetesCluster> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_name = ?", 
            KubernetesCluster::TABLE
        ))
        .bind(cluster_name)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(cluster)
    }

    /// Get cluster with all related details
    pub async fn get_cluster_with_details(&self, cluster_id: i32) -> Result<Option<ClusterWithDetails>, sqlx::Error> {
        let cluster = match self.get_cluster_by_id(cluster_id).await? {
            Some(c) => c,
            None => return Ok(None),
        };

        let node_groups = self.get_node_groups(cluster_id).await?;
        let nodes = self.get_all_nodes(cluster_id).await?;
        let namespaces = self.get_all_namespaces(cluster_id).await?;

        Ok(Some(ClusterWithDetails {
            cluster,
            node_groups,
            nodes,
            namespaces,
        }))
    }

    // ===================================================================
    // NODE OPERATIONS
    // ===================================================================
    
    /// Get all nodes for a cluster
    pub async fn get_all_nodes(&self, cluster_id: i32) -> Result<Vec<KubernetesNode>, sqlx::Error> {
        let nodes: Vec<KubernetesNode> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? ORDER BY node_name", 
            KubernetesNode::TABLE
        ))
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(nodes)
    }

    /// Get node by ID
    pub async fn get_node_by_id(&self, node_id: i32) -> Result<Option<KubernetesNode>, sqlx::Error> {
        let node: Option<KubernetesNode> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE k8s_node_id = ?", 
            KubernetesNode::TABLE
        ))
        .bind(node_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(node)
    }

    /// Get node with its metrics and pods
    pub async fn get_node_with_metrics(&self, node_id: i32) -> Result<Option<NodeWithMetrics>, sqlx::Error> {
        let node = match self.get_node_by_id(node_id).await? {
            Some(n) => n,
            None => return Ok(None),
        };

        // Get latest metrics for this node
        let metrics: Option<KubernetesMetric> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE resource_type = 'node' AND resource_id = ? ORDER BY collected_at DESC LIMIT 1",
            KubernetesMetric::TABLE
        ))
        .bind(node_id)
        .fetch_optional(&self.pool)
        .await?;

        // Get all pods on this node
        let pods = self.get_pods_by_node(node_id).await?;

        Ok(Some(NodeWithMetrics {
            node,
            metrics,
            pods,
        }))
    }

    /// Get nodes by state
    pub async fn get_nodes_by_state(&self, cluster_id: i32, state: &str) -> Result<Vec<KubernetesNode>, sqlx::Error> {
        let nodes: Vec<KubernetesNode> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND node_state = ? ORDER BY node_name",
            KubernetesNode::TABLE
        ))
        .bind(cluster_id)
        .bind(state)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(nodes)
    }

    // ===================================================================
    // NODE GROUP OPERATIONS
    // ===================================================================
    
    /// Get all node groups for a cluster
    pub async fn get_node_groups(&self, cluster_id: i32) -> Result<Vec<KubernetesNodeGroup>, sqlx::Error> {
        let node_groups: Vec<KubernetesNodeGroup> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? ORDER BY node_group_name",
            KubernetesNodeGroup::TABLE
        ))
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(node_groups)
    }

    /// Get node group by ID
    pub async fn get_node_group_by_id(&self, node_group_id: i32) -> Result<Option<KubernetesNodeGroup>, sqlx::Error> {
        let node_group: Option<KubernetesNodeGroup> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE node_group_id = ?",
            KubernetesNodeGroup::TABLE
        ))
        .bind(node_group_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(node_group)
    }

    // ===================================================================
    // NAMESPACE OPERATIONS
    // ===================================================================
    
    /// Get all namespaces for a cluster
    pub async fn get_all_namespaces(&self, cluster_id: i32) -> Result<Vec<KubernetesNamespace>, sqlx::Error> {
        let namespaces: Vec<KubernetesNamespace> = sqlx::query_as(&format!(
            "SELECT *, namespace_state as status FROM {} WHERE cluster_id = ? ORDER BY namespace_name",
            KubernetesNamespace::TABLE
        ))
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(namespaces)
    }

    /// Get namespace by ID
    pub async fn get_namespace_by_id(&self, namespace_id: i32) -> Result<Option<KubernetesNamespace>, sqlx::Error> {
        let namespace: Option<KubernetesNamespace> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE namespace_id = ?",
            KubernetesNamespace::TABLE
        ))
        .bind(namespace_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(namespace)
    }

    /// Get namespace with all its resources
    pub async fn get_namespace_with_resources(&self, namespace_id: i32) -> Result<Option<NamespaceWithResources>, sqlx::Error> {
        let namespace = match self.get_namespace_by_id(namespace_id).await? {
            Some(ns) => ns,
            None => return Ok(None),
        };

        let workloads: Vec<KubernetesWorkload> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE namespace_id = ?",
            KubernetesWorkload::TABLE
        ))
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;

        let services: Vec<KubernetesService> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE namespace_id = ?",
            KubernetesService::TABLE
        ))
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;

        let ingresses: Vec<KubernetesIngress> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE namespace_id = ?",
            KubernetesIngress::TABLE
        ))
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;

        let pods: Vec<KubernetesPod> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE namespace_id = ?",
            KubernetesPod::TABLE
        ))
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(Some(NamespaceWithResources {
            namespace,
            workloads,
            services,
            ingresses,
            pods,
        }))
    }

    // ===================================================================
    // WORKLOAD OPERATIONS
    // ===================================================================
    
    /// Get all workloads for a cluster, optionally filtered by namespace
    pub async fn get_all_workloads(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesWorkload>, sqlx::Error> {
        let workloads: Vec<KubernetesWorkload> = if let Some(ns_id) = namespace_id {
            sqlx::query_as(&format!(
                "SELECT w.*, n.namespace_name as namespace, 
                 COALESCE(w.replicas_desired, 0) as replicas
                 FROM {} w
                 LEFT JOIN {} n ON w.namespace_id = n.namespace_id
                 WHERE w.cluster_id = ? AND w.namespace_id = ? 
                 ORDER BY w.workload_name",
                KubernetesWorkload::TABLE,
                KubernetesNamespace::TABLE
            ))
            .bind(cluster_id)
            .bind(ns_id)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as(&format!(
                "SELECT w.*, n.namespace_name as namespace,
                 COALESCE(w.replicas_desired, 0) as replicas
                 FROM {} w
                 LEFT JOIN {} n ON w.namespace_id = n.namespace_id
                 WHERE w.cluster_id = ? 
                 ORDER BY w.workload_name",
                KubernetesWorkload::TABLE,
                KubernetesNamespace::TABLE
            ))
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await?
        };
        
        Ok(workloads)
    }

    /// Get workload by ID
    pub async fn get_workload_by_id(&self, workload_id: i32) -> Result<Option<KubernetesWorkload>, sqlx::Error> {
        let workload: Option<KubernetesWorkload> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE workload_id = ?",
            KubernetesWorkload::TABLE
        ))
        .bind(workload_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(workload)
    }

    /// Get workloads by type
    pub async fn get_workloads_by_type(&self, cluster_id: i32, workload_type: &str) -> Result<Vec<KubernetesWorkload>, sqlx::Error> {
        let workloads: Vec<KubernetesWorkload> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND workload_type = ? ORDER BY workload_name",
            KubernetesWorkload::TABLE
        ))
        .bind(cluster_id)
        .bind(workload_type)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(workloads)
    }

    // ===================================================================
    // POD OPERATIONS
    // ===================================================================
    
    /// Get all pods for a cluster, optionally filtered by namespace
    pub async fn get_all_pods(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        let pods: Vec<KubernetesPod> = if let Some(ns_id) = namespace_id {
            sqlx::query_as(&format!(
                "SELECT p.*, ns.namespace_name as namespace, 
                 p.pod_phase as status,
                 n.node_name
                 FROM {} p
                 LEFT JOIN {} ns ON p.namespace_id = ns.namespace_id
                 LEFT JOIN {} n ON p.k8s_node_id = n.k8s_node_id
                 WHERE p.cluster_id = ? AND p.namespace_id = ? 
                 ORDER BY p.pod_name",
                KubernetesPod::TABLE,
                KubernetesNamespace::TABLE,
                KubernetesNode::TABLE
            ))
            .bind(cluster_id)
            .bind(ns_id)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as(&format!(
                "SELECT p.*, ns.namespace_name as namespace,
                 p.pod_phase as status,
                 n.node_name
                 FROM {} p
                 LEFT JOIN {} ns ON p.namespace_id = ns.namespace_id
                 LEFT JOIN {} n ON p.k8s_node_id = n.k8s_node_id
                 WHERE p.cluster_id = ? 
                 ORDER BY p.pod_name",
                KubernetesPod::TABLE,
                KubernetesNamespace::TABLE,
                KubernetesNode::TABLE
            ))
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await?
        };
        
        Ok(pods)
    }

    /// Get pod by ID
    pub async fn get_pod_by_id(&self, pod_id: i32) -> Result<Option<KubernetesPod>, sqlx::Error> {
        let pod: Option<KubernetesPod> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE pod_id = ?",
            KubernetesPod::TABLE
        ))
        .bind(pod_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(pod)
    }

    /// Get all pods running on a specific node
    pub async fn get_pods_by_node(&self, node_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        let pods: Vec<KubernetesPod> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE k8s_node_id = ? ORDER BY pod_name",
            KubernetesPod::TABLE
        ))
        .bind(node_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(pods)
    }

    /// Get all pods belonging to a workload
    pub async fn get_pods_by_workload(&self, workload_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        let pods: Vec<KubernetesPod> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE workload_id = ? ORDER BY pod_name",
            KubernetesPod::TABLE
        ))
        .bind(workload_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(pods)
    }

    // ===================================================================
    // SERVICE OPERATIONS
    // ===================================================================
    
    /// Get all services for a cluster, optionally filtered by namespace
    pub async fn get_all_services(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesService>, sqlx::Error> {
        let services: Vec<KubernetesService> = if let Some(ns_id) = namespace_id {
            sqlx::query_as(&format!(
                "SELECT s.*, ns.namespace_name as namespace
                 FROM {} s
                 LEFT JOIN {} ns ON s.namespace_id = ns.namespace_id
                 WHERE s.cluster_id = ? AND s.namespace_id = ? 
                 ORDER BY s.service_name",
                KubernetesService::TABLE,
                KubernetesNamespace::TABLE
            ))
            .bind(cluster_id)
            .bind(ns_id)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as(&format!(
                "SELECT s.*, ns.namespace_name as namespace
                 FROM {} s
                 LEFT JOIN {} ns ON s.namespace_id = ns.namespace_id
                 WHERE s.cluster_id = ? 
                 ORDER BY s.service_name",
                KubernetesService::TABLE,
                KubernetesNamespace::TABLE
            ))
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await?
        };
        
        Ok(services)
    }

    /// Get service by ID
    pub async fn get_service_by_id(&self, service_id: i32) -> Result<Option<KubernetesService>, sqlx::Error> {
        let service: Option<KubernetesService> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE service_id = ?",
            KubernetesService::TABLE
        ))
        .bind(service_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(service)
    }

    // ===================================================================
    // INGRESS OPERATIONS
    // ===================================================================
    
    /// Get all ingresses for a cluster, optionally filtered by namespace
    pub async fn get_all_ingresses(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesIngress>, sqlx::Error> {
        let ingresses: Vec<KubernetesIngress> = if let Some(ns_id) = namespace_id {
            sqlx::query_as(&format!(
                "SELECT * FROM {} WHERE cluster_id = ? AND namespace_id = ? ORDER BY ingress_name",
                KubernetesIngress::TABLE
            ))
            .bind(cluster_id)
            .bind(ns_id)
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as(&format!(
                "SELECT * FROM {} WHERE cluster_id = ? ORDER BY ingress_name",
                KubernetesIngress::TABLE
            ))
            .bind(cluster_id)
            .fetch_all(&self.pool)
            .await?
        };
        
        Ok(ingresses)
    }

    /// Get ingress by ID
    pub async fn get_ingress_by_id(&self, ingress_id: i32) -> Result<Option<KubernetesIngress>, sqlx::Error> {
        let ingress: Option<KubernetesIngress> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE ingress_id = ?",
            KubernetesIngress::TABLE
        ))
        .bind(ingress_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(ingress)
    }

    // ===================================================================
    // EVENT OPERATIONS
    // ===================================================================
    
    /// Get recent events for a cluster
    pub async fn get_recent_events(&self, cluster_id: i32, limit: i64) -> Result<Vec<KubernetesEvent>, sqlx::Error> {
        let events: Vec<KubernetesEvent> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? ORDER BY created_at DESC LIMIT ?",
            KubernetesEvent::TABLE
        ))
        .bind(cluster_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(events)
    }

    /// Get events for a specific Kubernetes object
    pub async fn get_events_by_object(&self, cluster_id: i32, object_kind: &str, object_name: &str) -> Result<Vec<KubernetesEvent>, sqlx::Error> {
        let events: Vec<KubernetesEvent> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND involved_object_kind = ? AND involved_object_name = ? ORDER BY created_at DESC",
            KubernetesEvent::TABLE
        ))
        .bind(cluster_id)
        .bind(object_kind)
        .bind(object_name)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(events)
    }

    // ===================================================================
    // METRICS OPERATIONS
    // ===================================================================
    
    /// Get latest cluster-level metrics
    pub async fn get_latest_cluster_metrics(&self, cluster_id: i32) -> Result<Option<KubernetesMetric>, sqlx::Error> {
        let metrics: Option<KubernetesMetric> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND resource_type = 'cluster' ORDER BY collected_at DESC LIMIT 1",
            KubernetesMetric::TABLE
        ))
        .bind(cluster_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(metrics)
    }

    /// Get metrics for a node
    pub async fn get_node_metrics(&self, node_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error> {
        let metrics: Vec<KubernetesMetric> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE resource_type = 'node' AND resource_id = ? ORDER BY collected_at DESC LIMIT ?",
            KubernetesMetric::TABLE
        ))
        .bind(node_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(metrics)
    }

    /// Get metrics for a pod
    pub async fn get_pod_metrics(&self, pod_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error> {
        let metrics: Vec<KubernetesMetric> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE resource_type = 'pod' AND resource_id = ? ORDER BY collected_at DESC LIMIT ?",
            KubernetesMetric::TABLE
        ))
        .bind(pod_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(metrics)
    }

    // ===================================================================
    // SECRET AND CONFIGMAP OPERATIONS
    // ===================================================================
    
    /// Get secrets for a namespace
    pub async fn get_secrets(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesSecret>, sqlx::Error> {
        let secrets: Vec<KubernetesSecret> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND namespace_id = ? ORDER BY secret_name",
            KubernetesSecret::TABLE
        ))
        .bind(cluster_id)
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(secrets)
    }

    /// Get configmaps for a namespace
    pub async fn get_configmaps(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesConfigMap>, sqlx::Error> {
        let configmaps: Vec<KubernetesConfigMap> = sqlx::query_as(&format!(
            "SELECT * FROM {} WHERE cluster_id = ? AND namespace_id = ? ORDER BY configmap_name",
            KubernetesConfigMap::TABLE
        ))
        .bind(cluster_id)
        .bind(namespace_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(configmaps)
    }

    // ===================================================================
    // STATISTICS
    // ===================================================================
    
    /// Get overview statistics for a cluster
    pub async fn get_cluster_overview_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        let total_nodes: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_nodes WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let ready_nodes: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_nodes WHERE cluster_id = ? AND node_state = 'ready'"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let total_pods: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_pods WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let running_pods: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_pods WHERE cluster_id = ? AND pod_phase = 'running'"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let total_workloads: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_workloads WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let total_namespaces: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_namespaces WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        let total_services: i64 = sqlx::query_scalar(
            "SELECT CAST(COUNT(*) AS SIGNED) FROM kubernetes_services WHERE cluster_id = ?"
        )
        .bind(cluster_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(serde_json::json!({
            "total_nodes": total_nodes,
            "ready_nodes": ready_nodes,
            "total_pods": total_pods,
            "running_pods": running_pods,
            "total_workloads": total_workloads,
            "total_namespaces": total_namespaces,
            "total_services": total_services,
        }))
    }

    /// Get pod counts grouped by phase
    pub async fn get_pod_counts_by_phase(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error> {
        let results: Vec<(String, i64)> = sqlx::query_as(
            "SELECT pod_phase, CAST(COUNT(*) AS SIGNED) as count 
             FROM kubernetes_pods 
             WHERE cluster_id = ? 
             GROUP BY pod_phase"
        )
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(results)
    }

    /// Get workload counts grouped by type
    pub async fn get_workload_counts_by_type(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error> {
        let results: Vec<(String, i64)> = sqlx::query_as(
            "SELECT workload_type, CAST(COUNT(*) AS SIGNED) as count 
             FROM kubernetes_workloads 
             WHERE cluster_id = ? 
             GROUP BY workload_type"
        )
        .bind(cluster_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(results)
    }

    // ===================================================================
    // UPDATE OPERATIONS
    // ===================================================================
    
    /// Update cluster fields
    pub async fn update_cluster(&self, cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        let blacklisted_fields = ["cluster_id", "created_at", "updated_at"];
        DatabaseHelper::update(
            &self.pool,
            KubernetesCluster::TABLE,
            "cluster_id",
            cluster_id,
            updates,
            &blacklisted_fields,
        ).await
    }

    /// Update node fields
    pub async fn update_node(&self, node_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        let blacklisted_fields = ["k8s_node_id", "created_at", "updated_at"];
        DatabaseHelper::update(
            &self.pool,
            KubernetesNode::TABLE,
            "k8s_node_id",
            node_id,
            updates,
            &blacklisted_fields,
        ).await
    }

    // ===================================================================
    // INVENTORY UPSERT
    // ===================================================================
    
    /// Upsert cluster and nodes from inventory data
    pub async fn upsert_cluster_from_inventory(&self, inventory: K8sInventory) -> Result<i32, sqlx::Error> {
        // Check if cluster exists
        let existing_cluster = self.get_cluster_by_name(&inventory.cluster_name).await?;
        
        let cluster_id = if let Some(cluster) = existing_cluster {
            // Update existing cluster
            let mut updates = HashMap::new();
            updates.insert("cluster_version".to_string(), serde_json::json!(inventory.cluster_version));
            updates.insert("api_server_endpoint".to_string(), serde_json::json!(inventory.api_server));
            updates.insert("last_health_check".to_string(), serde_json::json!(chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()));
            
            self.update_cluster(cluster.cluster_id, updates).await?;
            cluster.cluster_id
        } else {
            // Insert new cluster
            let cluster_id_result = sqlx::query(
                "INSERT INTO kubernetes_clusters (cluster_name, cluster_version, api_server_endpoint, cluster_state, cluster_status) 
                 VALUES (?, ?, ?, 'ready', 'active')"
            )
            .bind(&inventory.cluster_name)
            .bind(&inventory.cluster_version)
            .bind(&inventory.api_server)
            .execute(&self.pool)
            .await?;
            
            cluster_id_result.last_insert_id() as i32
        };

        // Upsert namespaces first (needed for other resources)
        let mut namespace_map: HashMap<String, i32> = HashMap::new();
        for ns_inv in inventory.namespaces {
            let existing_ns: Option<(i32,)> = sqlx::query_as(
                "SELECT namespace_id FROM kubernetes_namespaces WHERE cluster_id = ? AND namespace_name = ?"
            )
            .bind(cluster_id)
            .bind(&ns_inv.namespace_name)
            .fetch_optional(&self.pool)
            .await?;

            let ns_id = if let Some((ns_id,)) = existing_ns {
                // Update existing namespace
                sqlx::query(
                    "UPDATE kubernetes_namespaces SET namespace_state = ?, labels = ?, annotations = ?, updated_at = NOW() WHERE namespace_id = ?"
                )
                .bind(ns_inv.namespace_state.as_deref().unwrap_or("Active"))
                .bind(&ns_inv.labels)
                .bind(&ns_inv.annotations)
                .bind(ns_id)
                .execute(&self.pool)
                .await?;
                ns_id
            } else {
                // Insert new namespace
                let result = sqlx::query(
                    "INSERT INTO kubernetes_namespaces (cluster_id, namespace_name, namespace_uid, namespace_state, labels, annotations) 
                     VALUES (?, ?, ?, ?, ?, ?)"
                )
                .bind(cluster_id)
                .bind(&ns_inv.namespace_name)
                .bind(&ns_inv.namespace_uid)
                .bind(ns_inv.namespace_state.as_deref().unwrap_or("Active"))
                .bind(&ns_inv.labels)
                .bind(&ns_inv.annotations)
                .execute(&self.pool)
                .await?;
                result.last_insert_id() as i32
            };
            namespace_map.insert(ns_inv.namespace_name.clone(), ns_id);
        }

        // Upsert nodes
        for node_inv in inventory.nodes {
            let existing_node: Option<(i32,)> = sqlx::query_as(
                "SELECT k8s_node_id FROM kubernetes_nodes WHERE cluster_id = ? AND node_name = ?"
            )
            .bind(cluster_id)
            .bind(&node_inv.node_name)
            .fetch_optional(&self.pool)
            .await?;

            if let Some((node_id,)) = existing_node {
                // Update existing node
                sqlx::query(
                    "UPDATE kubernetes_nodes SET 
                        node_uid = ?, node_type = ?, internal_ip = ?, external_ip = ?, hostname = ?,
                        cpu_capacity = ?, memory_capacity_mb = ?, pod_capacity = ?, node_state = ?, 
                        kubelet_version = ?, os_image = ?, kernel_version = ?, container_runtime_version = ?,
                        roles = ?, labels = ?, taints = ?, last_heartbeat = NOW(), updated_at = NOW()
                     WHERE k8s_node_id = ?"
                )
                .bind(&node_inv.node_uid)
                .bind(node_inv.node_type.as_deref().unwrap_or("worker"))
                .bind(&node_inv.internal_ip)
                .bind(&node_inv.external_ip)
                .bind(&node_inv.hostname)
                .bind(node_inv.cpu_capacity)
                .bind(node_inv.memory_capacity_mb)
                .bind(node_inv.pod_capacity)
                .bind(node_inv.node_state.as_deref().unwrap_or("unknown"))
                .bind(&node_inv.kubelet_version)
                .bind(&node_inv.os_image)
                .bind(&node_inv.kernel_version)
                .bind(&node_inv.container_runtime_version)
                .bind(&node_inv.roles)
                .bind(&node_inv.labels)
                .bind(&node_inv.taints)
                .bind(node_id)
                .execute(&self.pool)
                .await?;
            } else {
                // Insert new node
                sqlx::query(
                    "INSERT INTO kubernetes_nodes (
                        cluster_id, node_name, node_uid, node_type, internal_ip, external_ip, hostname,
                        cpu_capacity, memory_capacity_mb, pod_capacity, node_state, kubelet_version,
                        os_image, kernel_version, container_runtime_version, roles, labels, taints
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                )
                .bind(cluster_id)
                .bind(&node_inv.node_name)
                .bind(&node_inv.node_uid)
                .bind(node_inv.node_type.as_deref().unwrap_or("worker"))
                .bind(&node_inv.internal_ip)
                .bind(&node_inv.external_ip)
                .bind(&node_inv.hostname)
                .bind(node_inv.cpu_capacity)
                .bind(node_inv.memory_capacity_mb)
                .bind(node_inv.pod_capacity)
                .bind(node_inv.node_state.as_deref().unwrap_or("unknown"))
                .bind(&node_inv.kubelet_version)
                .bind(&node_inv.os_image)
                .bind(&node_inv.kernel_version)
                .bind(&node_inv.container_runtime_version)
                .bind(&node_inv.roles)
                .bind(&node_inv.labels)
                .bind(&node_inv.taints)
                .execute(&self.pool)
                .await?;
            }
        }

        // Upsert pods if provided
        if let Some(pods) = inventory.pods {
            for pod_inv in pods {
                if let Some(&namespace_id) = namespace_map.get(&pod_inv.namespace) {
                    let existing_pod: Option<(i32,)> = sqlx::query_as(
                        "SELECT pod_id FROM kubernetes_pods WHERE cluster_id = ? AND namespace_id = ? AND pod_name = ?"
                    )
                    .bind(cluster_id)
                    .bind(namespace_id)
                    .bind(&pod_inv.pod_name)
                    .fetch_optional(&self.pool)
                    .await?;

                    // Get node_id from node_name
                    let k8s_node_id: Option<i32> = if let Some(ref node_name) = pod_inv.node_name {
                        sqlx::query_scalar("SELECT k8s_node_id FROM kubernetes_nodes WHERE cluster_id = ? AND node_name = ?")
                            .bind(cluster_id)
                            .bind(node_name)
                            .fetch_optional(&self.pool)
                            .await?
                    } else {
                        None
                    };

                    if let Some((pod_id,)) = existing_pod {
                        // Parse and format start_time if present
                        let started_at = pod_inv.start_time.as_ref().and_then(|st| {
                            chrono::DateTime::parse_from_rfc3339(st)
                                .ok()
                                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                        });
                        
                        // Update existing pod
                        sqlx::query(
                            "UPDATE kubernetes_pods SET pod_uid = ?, pod_phase = ?, k8s_node_id = ?, pod_ip = ?, host_ip = ?, 
                             started_at = ?, labels = ?, annotations = ?, updated_at = NOW() WHERE pod_id = ?"
                        )
                        .bind(&pod_inv.pod_uid)
                        .bind(pod_inv.pod_phase.as_deref().unwrap_or("Unknown"))
                        .bind(k8s_node_id)
                        .bind(&pod_inv.pod_ip)
                        .bind(&pod_inv.host_ip)
                        .bind(&started_at)
                        .bind(&pod_inv.labels)
                        .bind(&pod_inv.annotations)
                        .bind(pod_id)
                        .execute(&self.pool)
                        .await?;
                    } else {
                        // Parse and format start_time if present
                        let started_at = pod_inv.start_time.as_ref().and_then(|st| {
                            chrono::DateTime::parse_from_rfc3339(st)
                                .ok()
                                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                        });
                        
                        // Insert new pod
                        sqlx::query(
                            "INSERT INTO kubernetes_pods (cluster_id, namespace_id, pod_name, pod_uid, pod_phase, k8s_node_id, 
                             pod_ip, host_ip, started_at, labels, annotations, pod_state) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'running')"
                        )
                        .bind(cluster_id)
                        .bind(namespace_id)
                        .bind(&pod_inv.pod_name)
                        .bind(&pod_inv.pod_uid)
                        .bind(pod_inv.pod_phase.as_deref().unwrap_or("Unknown"))
                        .bind(k8s_node_id)
                        .bind(&pod_inv.pod_ip)
                        .bind(&pod_inv.host_ip)
                        .bind(&started_at)
                        .bind(&pod_inv.labels)
                        .bind(&pod_inv.annotations)
                        .execute(&self.pool)
                        .await?;
                    }
                }
            }
        }

        // Upsert services if provided
        if let Some(services) = inventory.services {
            for svc_inv in services {
                if let Some(&namespace_id) = namespace_map.get(&svc_inv.namespace) {
                    let existing_svc: Option<(i32,)> = sqlx::query_as(
                        "SELECT service_id FROM kubernetes_services WHERE cluster_id = ? AND namespace_id = ? AND service_name = ?"
                    )
                    .bind(cluster_id)
                    .bind(namespace_id)
                    .bind(&svc_inv.service_name)
                    .fetch_optional(&self.pool)
                    .await?;

                    // Convert external_ip to external_ips JSON array if present
                    let external_ips_json = svc_inv.external_ip.as_ref().map(|ip| {
                        serde_json::json!([ip])
                    });

                    if let Some((svc_id,)) = existing_svc {
                        // Update existing service
                        sqlx::query(
                            "UPDATE kubernetes_services SET service_uid = ?, service_type = ?, cluster_ip = ?, 
                             external_ips = ?, ports = ?, selector = ?, labels = ?, updated_at = NOW() WHERE service_id = ?"
                        )
                        .bind(&svc_inv.service_uid)
                        .bind(svc_inv.service_type.as_deref().unwrap_or("ClusterIP"))
                        .bind(&svc_inv.cluster_ip)
                        .bind(&external_ips_json)
                        .bind(&svc_inv.ports)
                        .bind(&svc_inv.selector)
                        .bind(&svc_inv.labels)
                        .bind(svc_id)
                        .execute(&self.pool)
                        .await?;
                    } else {
                        // Insert new service
                        sqlx::query(
                            "INSERT INTO kubernetes_services (cluster_id, namespace_id, service_name, service_uid, 
                             service_type, cluster_ip, external_ips, ports, selector, labels) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        )
                        .bind(cluster_id)
                        .bind(namespace_id)
                        .bind(&svc_inv.service_name)
                        .bind(&svc_inv.service_uid)
                        .bind(svc_inv.service_type.as_deref().unwrap_or("ClusterIP"))
                        .bind(&svc_inv.cluster_ip)
                        .bind(&external_ips_json)
                        .bind(&svc_inv.ports)
                        .bind(&svc_inv.selector)
                        .bind(&svc_inv.labels)
                        .execute(&self.pool)
                        .await?;
                    }
                }
            }
        }

        // Upsert workloads if provided
        if let Some(workloads) = inventory.workloads {
            for wl_inv in workloads {
                if let Some(&namespace_id) = namespace_map.get(&wl_inv.namespace) {
                    let existing_wl: Option<(i32,)> = sqlx::query_as(
                        "SELECT workload_id FROM kubernetes_workloads WHERE cluster_id = ? AND namespace_id = ? AND workload_name = ?"
                    )
                    .bind(cluster_id)
                    .bind(namespace_id)
                    .bind(&wl_inv.workload_name)
                    .fetch_optional(&self.pool)
                    .await?;

                    if let Some((wl_id,)) = existing_wl {
                        // Update existing workload
                        sqlx::query(
                            "UPDATE kubernetes_workloads SET workload_uid = ?, workload_type = ?, replicas_desired = ?, 
                             replicas_ready = ?, replicas_available = ?, labels = ?, selector = ?, updated_at = NOW() 
                             WHERE workload_id = ?"
                        )
                        .bind(&wl_inv.workload_uid)
                        .bind(&wl_inv.workload_type)
                        .bind(wl_inv.replicas_desired)
                        .bind(wl_inv.replicas_ready)
                        .bind(wl_inv.replicas_available)
                        .bind(&wl_inv.labels)
                        .bind(&wl_inv.selector)
                        .bind(wl_id)
                        .execute(&self.pool)
                        .await?;
                    } else {
                        // Insert new workload
                        sqlx::query(
                            "INSERT INTO kubernetes_workloads (cluster_id, namespace_id, workload_name, workload_uid, 
                             workload_type, replicas_desired, replicas_ready, replicas_available, labels, selector) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        )
                        .bind(cluster_id)
                        .bind(namespace_id)
                        .bind(&wl_inv.workload_name)
                        .bind(&wl_inv.workload_uid)
                        .bind(&wl_inv.workload_type)
                        .bind(wl_inv.replicas_desired)
                        .bind(wl_inv.replicas_ready)
                        .bind(wl_inv.replicas_available)
                        .bind(&wl_inv.labels)
                        .bind(&wl_inv.selector)
                        .execute(&self.pool)
                        .await?;
                    }
                }
            }
        }

        Ok(cluster_id)
    }
}

#[async_trait]
impl K8sRepo for KubernetesRepository {
    async fn get_all_clusters(&self, query: CommonPaginationQuery) -> Result<Vec<KubernetesCluster>, sqlx::Error> {
        self.get_all_clusters(query).await
    }

    async fn get_cluster_by_id(&self, cluster_id: i32) -> Result<Option<KubernetesCluster>, sqlx::Error> {
        self.get_cluster_by_id(cluster_id).await
    }

    async fn get_cluster_by_name(&self, cluster_name: &str) -> Result<Option<KubernetesCluster>, sqlx::Error> {
        self.get_cluster_by_name(cluster_name).await
    }

    async fn get_cluster_with_details(&self, cluster_id: i32) -> Result<Option<ClusterWithDetails>, sqlx::Error> {
        self.get_cluster_with_details(cluster_id).await
    }

    async fn get_all_nodes(&self, cluster_id: i32) -> Result<Vec<KubernetesNode>, sqlx::Error> {
        self.get_all_nodes(cluster_id).await
    }

    async fn get_node_by_id(&self, node_id: i32) -> Result<Option<KubernetesNode>, sqlx::Error> {
        self.get_node_by_id(node_id).await
    }

    async fn get_node_with_metrics(&self, node_id: i32) -> Result<Option<NodeWithMetrics>, sqlx::Error> {
        self.get_node_with_metrics(node_id).await
    }

    async fn get_nodes_by_state(&self, cluster_id: i32, state: &str) -> Result<Vec<KubernetesNode>, sqlx::Error> {
        self.get_nodes_by_state(cluster_id, state).await
    }

    async fn get_node_groups(&self, cluster_id: i32) -> Result<Vec<KubernetesNodeGroup>, sqlx::Error> {
        self.get_node_groups(cluster_id).await
    }

    async fn get_node_group_by_id(&self, node_group_id: i32) -> Result<Option<KubernetesNodeGroup>, sqlx::Error> {
        self.get_node_group_by_id(node_group_id).await
    }

    async fn get_all_namespaces(&self, cluster_id: i32) -> Result<Vec<KubernetesNamespace>, sqlx::Error> {
        self.get_all_namespaces(cluster_id).await
    }

    async fn get_namespace_by_id(&self, namespace_id: i32) -> Result<Option<KubernetesNamespace>, sqlx::Error> {
        self.get_namespace_by_id(namespace_id).await
    }

    async fn get_namespace_with_resources(&self, namespace_id: i32) -> Result<Option<NamespaceWithResources>, sqlx::Error> {
        self.get_namespace_with_resources(namespace_id).await
    }

    async fn get_all_workloads(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesWorkload>, sqlx::Error> {
        self.get_all_workloads(cluster_id, namespace_id).await
    }

    async fn get_workload_by_id(&self, workload_id: i32) -> Result<Option<KubernetesWorkload>, sqlx::Error> {
        self.get_workload_by_id(workload_id).await
    }

    async fn get_workloads_by_type(&self, cluster_id: i32, workload_type: &str) -> Result<Vec<KubernetesWorkload>, sqlx::Error> {
        self.get_workloads_by_type(cluster_id, workload_type).await
    }

    async fn get_all_pods(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        self.get_all_pods(cluster_id, namespace_id).await
    }

    async fn get_pod_by_id(&self, pod_id: i32) -> Result<Option<KubernetesPod>, sqlx::Error> {
        self.get_pod_by_id(pod_id).await
    }

    async fn get_pods_by_node(&self, node_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        self.get_pods_by_node(node_id).await
    }

    async fn get_pods_by_workload(&self, workload_id: i32) -> Result<Vec<KubernetesPod>, sqlx::Error> {
        self.get_pods_by_workload(workload_id).await
    }

    async fn get_all_services(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesService>, sqlx::Error> {
        self.get_all_services(cluster_id, namespace_id).await
    }

    async fn get_service_by_id(&self, service_id: i32) -> Result<Option<KubernetesService>, sqlx::Error> {
        self.get_service_by_id(service_id).await
    }

    async fn get_all_ingresses(&self, cluster_id: i32, namespace_id: Option<i32>) -> Result<Vec<KubernetesIngress>, sqlx::Error> {
        self.get_all_ingresses(cluster_id, namespace_id).await
    }

    async fn get_ingress_by_id(&self, ingress_id: i32) -> Result<Option<KubernetesIngress>, sqlx::Error> {
        self.get_ingress_by_id(ingress_id).await
    }

    async fn get_recent_events(&self, cluster_id: i32, limit: i64) -> Result<Vec<KubernetesEvent>, sqlx::Error> {
        self.get_recent_events(cluster_id, limit).await
    }

    async fn get_events_by_object(&self, cluster_id: i32, object_kind: &str, object_name: &str) -> Result<Vec<KubernetesEvent>, sqlx::Error> {
        self.get_events_by_object(cluster_id, object_kind, object_name).await
    }

    async fn get_latest_cluster_metrics(&self, cluster_id: i32) -> Result<Option<KubernetesMetric>, sqlx::Error> {
        self.get_latest_cluster_metrics(cluster_id).await
    }

    async fn get_node_metrics(&self, node_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error> {
        self.get_node_metrics(node_id, limit).await
    }

    async fn get_pod_metrics(&self, pod_id: i32, limit: i64) -> Result<Vec<KubernetesMetric>, sqlx::Error> {
        self.get_pod_metrics(pod_id, limit).await
    }

    async fn get_secrets(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesSecret>, sqlx::Error> {
        self.get_secrets(cluster_id, namespace_id).await
    }

    async fn get_configmaps(&self, cluster_id: i32, namespace_id: i32) -> Result<Vec<KubernetesConfigMap>, sqlx::Error> {
        self.get_configmaps(cluster_id, namespace_id).await
    }

    async fn get_cluster_overview_stats(&self, cluster_id: i32) -> Result<serde_json::Value, sqlx::Error> {
        self.get_cluster_overview_stats(cluster_id).await
    }

    async fn get_pod_counts_by_phase(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error> {
        self.get_pod_counts_by_phase(cluster_id).await
    }

    async fn get_workload_counts_by_type(&self, cluster_id: i32) -> Result<Vec<(String, i64)>, sqlx::Error> {
        self.get_workload_counts_by_type(cluster_id).await
    }

    async fn update_cluster(&self, cluster_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_cluster(cluster_id, updates).await
    }

    async fn update_node(&self, node_id: i32, updates: HashMap<String, serde_json::Value>) -> Result<bool, sqlx::Error> {
        self.update_node(node_id, updates).await
    }

    async fn upsert_cluster_from_inventory(&self, inventory: K8sInventory) -> Result<i32, sqlx::Error> {
        self.upsert_cluster_from_inventory(inventory).await
    }
}
