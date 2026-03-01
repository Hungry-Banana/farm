-- Kubernetes seed data for development environment
-- Description: Creates sample Kubernetes clusters, nodes, node groups, namespaces, 
--              workloads, services, ingresses, pods, events, metrics, secrets, and configmaps

-- ===================================================================
-- KUBERNETES CLUSTERS
-- ===================================================================
INSERT INTO kubernetes_clusters (
    cluster_id, cluster_name, cluster_uuid, description,
    cluster_version, api_server_endpoint, cluster_domain,
    distribution, distribution_version,
    service_cidr, pod_cidr, cni_plugin, cni_version,
    container_runtime, runtime_version,
    cluster_state, cluster_status,
    is_ha_enabled, control_plane_nodes,
    kubeconfig_path, rbac_enabled, network_policy_enabled, pod_security_policy_enabled,
    admission_controllers, monitoring_enabled, monitoring_stack,
    logging_enabled, logging_stack,
    created_by, managed_by, organization, environment,
    provisioned_at, last_health_check,
    labels, annotations, tags
) VALUES
-- Production Kubernetes cluster with HA
(1, 'prod-k8s-main', 'aa111111-1111-1111-1111-111111111111', 'Main production Kubernetes cluster',
 'v1.28.5', 'https://prod-k8s-api.farm.local:6443', 'cluster.local',
 'kubeadm', 'v1.28.5',
 '10.96.0.0/12', '10.244.0.0/16', 'calico', 'v3.27.0',
 'containerd', '1.7.11',
 'ready', 'active',
 TRUE, 3,
 '/etc/kubernetes/kubeconfig/prod-k8s-main.yaml', TRUE, TRUE, FALSE,
 'NodeRestriction,PodSecurityPolicy,ServiceAccount', TRUE, 'prometheus-grafana',
 TRUE, 'efk',
 'admin', 'k8s_team', 'Farm Engineering', 'production',
 '2026-01-15 08:00:00', '2026-02-28 07:30:00',
 '{"tier":"production","region":"us-east"}', '{"managed-by":"farm-manager"}', 'production,main,k8s'),

-- Development Kubernetes cluster
(2, 'dev-k8s-01', 'bb222222-2222-2222-2222-222222222222', 'Development Kubernetes cluster',
 'v1.28.2', 'https://dev-k8s-api.farm.local:6443', 'cluster.local',
 'k3s', 'v1.28.2+k3s1',
 '10.43.0.0/16', '10.42.0.0/16', 'flannel', 'v0.24.0',
 'containerd', '1.7.10',
 'ready', 'active',
 FALSE, 1,
 '/etc/kubernetes/kubeconfig/dev-k8s-01.yaml', TRUE, FALSE, FALSE,
 'NodeRestriction', TRUE, 'prometheus',
 FALSE, NULL,
 'admin', 'devops_team', 'Farm Engineering', 'development',
 '2026-01-20 10:00:00', '2026-02-28 07:25:00',
 '{"tier":"development","region":"us-east"}', '{"managed-by":"farm-manager"}', 'development,k3s,k8s'),

-- Staging Kubernetes cluster
(3, 'staging-k8s-01', 'cc333333-3333-3333-3333-333333333333', 'Staging environment cluster',
 'v1.28.5', 'https://staging-k8s-api.farm.local:6443', 'cluster.local',
 'rke2', 'v1.28.5+rke2r1',
 '10.96.0.0/12', '10.244.0.0/16', 'cilium', 'v1.14.5',
 'containerd', '1.7.11',
 'ready', 'active',
 TRUE, 2,
 '/etc/kubernetes/kubeconfig/staging-k8s-01.yaml', TRUE, TRUE, FALSE,
 'NodeRestriction,ServiceAccount', TRUE, 'prometheus-grafana',
 TRUE, 'loki',
 'admin', 'k8s_team', 'Farm Engineering', 'staging',
 '2026-01-18 09:00:00', '2026-02-28 07:20:00',
 '{"tier":"staging","region":"us-west"}', '{"managed-by":"farm-manager"}', 'staging,rke2,k8s');

-- ===================================================================
-- KUBERNETES NODE GROUPS
-- ===================================================================
INSERT INTO kubernetes_node_groups (
    node_group_id, cluster_id, node_group_name, node_group_uuid, description,
    node_group_type, min_nodes, max_nodes, desired_nodes, current_nodes,
    auto_scaling_enabled, node_instance_type, node_image, node_disk_size_gb,
    node_labels, node_taints, node_group_state, created_by
) VALUES
-- Production cluster node groups
(1, 1, 'prod-control-plane', 'ng-11111111-1111-1111-1111-111111111111', 'Production control plane nodes',
 'control-plane', 3, 3, 3, 3,
 FALSE, 'large-compute', 'ubuntu-22.04-k8s', 100,
 '{"node-role.kubernetes.io/control-plane":"","node.kubernetes.io/instance-type":"large"}', 
 '[]',
 'active', 'admin'),

(2, 1, 'prod-workers-general', 'ng-11111111-1111-1111-1111-111111111112', 'Production general purpose workers',
 'worker', 3, 10, 5, 5,
 TRUE, 'medium-compute', 'ubuntu-22.04-k8s', 200,
 '{"node-role.kubernetes.io/worker":"","workload":"general"}',
 '[]',
 'active', 'admin'),

(3, 1, 'prod-workers-gpu', 'ng-11111111-1111-1111-1111-111111111113', 'Production GPU workers',
 'worker', 2, 5, 2, 2,
 TRUE, 'gpu-compute', 'ubuntu-22.04-k8s-gpu', 500,
 '{"node-role.kubernetes.io/worker":"","workload":"gpu","gpu":"true"}',
 '[{"key":"nvidia.com/gpu","value":"present","effect":"NoSchedule"}]',
 'active', 'admin'),

-- Development cluster node groups
(4, 2, 'dev-control-plane', 'ng-22222222-2222-2222-2222-222222222221', 'Development control plane',
 'control-plane', 1, 1, 1, 1,
 FALSE, 'small-compute', 'ubuntu-22.04-k3s', 50,
 '{"node-role.kubernetes.io/control-plane":""}',
 '[]',
 'active', 'admin'),

(5, 2, 'dev-workers', 'ng-22222222-2222-2222-2222-222222222222', 'Development workers',
 'worker', 2, 4, 2, 2,
 FALSE, 'small-compute', 'ubuntu-22.04-k3s', 100,
 '{"node-role.kubernetes.io/worker":""}',
 '[]',
 'active', 'admin'),

-- Staging cluster node groups
(6, 3, 'staging-control-plane', 'ng-33333333-3333-3333-3333-333333333331', 'Staging control plane',
 'control-plane', 2, 2, 2, 2,
 FALSE, 'medium-compute', 'ubuntu-22.04-rke2', 80,
 '{"node-role.kubernetes.io/control-plane":""}',
 '[]',
 'active', 'admin'),

(7, 3, 'staging-workers', 'ng-33333333-3333-3333-3333-333333333332', 'Staging workers',
 'worker', 2, 6, 3, 3,
 TRUE, 'medium-compute', 'ubuntu-22.04-rke2', 150,
 '{"node-role.kubernetes.io/worker":""}',
 '[]',
 'active', 'admin');

-- ===================================================================
-- KUBERNETES NODES
-- ===================================================================
INSERT INTO kubernetes_nodes (
    k8s_node_id, cluster_id, node_group_id, server_id, vm_id,
    node_name, node_uuid, node_uid,
    node_type, internal_ip, external_ip, hostname,
    cpu_capacity, memory_capacity_mb, pod_capacity, ephemeral_storage_gb,
    cpu_allocatable, memory_allocatable_mb, pod_allocatable,
    node_state, is_schedulable, is_cordoned,
    ready_condition, memory_pressure, disk_pressure, pid_pressure, network_unavailable,
    os_image, os_architecture, kernel_version,
    container_runtime_version, kubelet_version, kube_proxy_version,
    roles, labels, taints, annotations,
    registered_at, last_heartbeat
) VALUES
-- Production cluster control plane nodes
(1, 1, 1, 1, NULL, 'prod-k8s-cp-01', 'node-11111111-1111-1111-1111-111111111111', 'cp-uid-1111-1111-1111',
 'control-plane', '10.10.1.11', '203.0.113.11', 'prod-k8s-cp-01.farm.local',
 8, 16384, 110, 100,
 8, 15360, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'control-plane,master', 
 '{"node-role.kubernetes.io/control-plane":"","node.kubernetes.io/instance-type":"large"}',
 '[{"key":"node-role.kubernetes.io/control-plane","effect":"NoSchedule"}]',
 '{"kubeadm.alpha.kubernetes.io/cri-socket":"unix:///var/run/containerd/containerd.sock"}',
 '2026-01-15 08:30:00', '2026-02-28 07:30:00'),

(2, 1, 1, 2, NULL, 'prod-k8s-cp-02', 'node-11111111-1111-1111-1111-111111111112', 'cp-uid-1111-1111-1112',
 'control-plane', '10.10.1.12', '203.0.113.12', 'prod-k8s-cp-02.farm.local',
 8, 16384, 110, 100,
 8, 15360, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'control-plane,master',
 '{"node-role.kubernetes.io/control-plane":"","node.kubernetes.io/instance-type":"large"}',
 '[{"key":"node-role.kubernetes.io/control-plane","effect":"NoSchedule"}]',
 '{"kubeadm.alpha.kubernetes.io/cri-socket":"unix:///var/run/containerd/containerd.sock"}',
 '2026-01-15 08:35:00', '2026-02-28 07:30:00'),

(3, 1, 1, 3, NULL, 'prod-k8s-cp-03', 'node-11111111-1111-1111-1111-111111111113', 'cp-uid-1111-1111-1113',
 'control-plane', '10.10.1.13', '203.0.113.13', 'prod-k8s-cp-03.farm.local',
 8, 16384, 110, 100,
 8, 15360, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'control-plane,master',
 '{"node-role.kubernetes.io/control-plane":"","node.kubernetes.io/instance-type":"large"}',
 '[{"key":"node-role.kubernetes.io/control-plane","effect":"NoSchedule"}]',
 '{"kubeadm.alpha.kubernetes.io/cri-socket":"unix:///var/run/containerd/containerd.sock"}',
 '2026-01-15 08:40:00', '2026-02-28 07:30:00'),

-- Production cluster worker nodes
(4, 1, 2, NULL, 1, 'prod-k8s-worker-01', 'node-11111111-1111-1111-1111-111111111114', 'worker-uid-1111-1114',
 'worker', '10.10.1.21', '203.0.113.21', 'prod-k8s-worker-01.farm.local',
 16, 32768, 110, 200,
 16, 30720, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'worker',
 '{"node-role.kubernetes.io/worker":"","workload":"general"}',
 '[]',
 '{}',
 '2026-01-15 09:00:00', '2026-02-28 07:30:00'),

(5, 1, 2, NULL, 2, 'prod-k8s-worker-02', 'node-11111111-1111-1111-1111-111111111115', 'worker-uid-1111-1115',
 'worker', '10.10.1.22', '203.0.113.22', 'prod-k8s-worker-02.farm.local',
 16, 32768, 110, 200,
 16, 30720, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'worker',
 '{"node-role.kubernetes.io/worker":"","workload":"general"}',
 '[]',
 '{}',
 '2026-01-15 09:05:00', '2026-02-28 07:30:00'),

(6, 1, 2, NULL, 3, 'prod-k8s-worker-03', 'node-11111111-1111-1111-1111-111111111116', 'worker-uid-1111-1116',
 'worker', '10.10.1.23', '203.0.113.23', 'prod-k8s-worker-03.farm.local',
 16, 32768, 110, 200,
 16, 30720, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'worker',
 '{"node-role.kubernetes.io/worker":"","workload":"general"}',
 '[]',
 '{}',
 '2026-01-15 09:10:00', '2026-02-28 07:30:00'),

-- Production GPU workers
(7, 1, 3, 4, NULL, 'prod-k8s-gpu-01', 'node-11111111-1111-1111-1111-111111111117', 'gpu-uid-1111-1117',
 'worker', '10.10.1.31', '203.0.113.31', 'prod-k8s-gpu-01.farm.local',
 32, 131072, 110, 500,
 32, 122880, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'worker',
 '{"node-role.kubernetes.io/worker":"","workload":"gpu","gpu":"true","nvidia.com/gpu.count":"4"}',
 '[{"key":"nvidia.com/gpu","value":"present","effect":"NoSchedule"}]',
 '{"nvidia.com/cuda.runtime.version":"12.2"}',
 '2026-01-15 09:20:00', '2026-02-28 07:30:00'),

(8, 1, 3, 5, NULL, 'prod-k8s-gpu-02', 'node-11111111-1111-1111-1111-111111111118', 'gpu-uid-1111-1118',
 'worker', '10.10.1.32', '203.0.113.32', 'prod-k8s-gpu-02.farm.local',
 32, 131072, 110, 500,
 32, 122880, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-91-generic',
 'containerd://1.7.11', 'v1.28.5', 'v1.28.5',
 'worker',
 '{"node-role.kubernetes.io/worker":"","workload":"gpu","gpu":"true","nvidia.com/gpu.count":"4"}',
 '[{"key":"nvidia.com/gpu","value":"present","effect":"NoSchedule"}]',
 '{"nvidia.com/cuda.runtime.version":"12.2"}',
 '2026-01-15 09:25:00', '2026-02-28 07:30:00'),

-- Development cluster nodes
(9, 2, 4, NULL, 6, 'dev-k8s-cp-01', 'node-22222222-2222-2222-2222-222222222221', 'dev-cp-uid-2222-2221',
 'control-plane', '10.20.1.11', NULL, 'dev-k8s-cp-01.farm.local',
 4, 8192, 110, 50,
 4, 7168, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-89-generic',
 'containerd://1.7.10', 'v1.28.2+k3s1', 'v1.28.2+k3s1',
 'control-plane,master',
 '{"node-role.kubernetes.io/control-plane":"","node-role.kubernetes.io/master":""}',
 '[{"key":"node-role.kubernetes.io/control-plane","effect":"NoSchedule"}]',
 '{}',
 '2026-01-20 10:30:00', '2026-02-28 07:25:00'),

(10, 2, 5, NULL, 7, 'dev-k8s-worker-01', 'node-22222222-2222-2222-2222-222222222222', 'dev-worker-uid-2222-2222',
 'worker', '10.20.1.21', NULL, 'dev-k8s-worker-01.farm.local',
 4, 8192, 110, 100,
 4, 7168, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-89-generic',
 'containerd://1.7.10', 'v1.28.2+k3s1', 'v1.28.2+k3s1',
 'worker',
 '{"node-role.kubernetes.io/worker":""}',
 '[]',
 '{}',
 '2026-01-20 10:35:00', '2026-02-28 07:25:00'),

(11, 2, 5, NULL, 8, 'dev-k8s-worker-02', 'node-22222222-2222-2222-2222-222222222223', 'dev-worker-uid-2222-2223',
 'worker', '10.20.1.22', NULL, 'dev-k8s-worker-02.farm.local',
 4, 8192, 110, 100,
 4, 7168, 110,
 'ready', TRUE, FALSE,
 'Ready', FALSE, FALSE, FALSE, FALSE,
 'Ubuntu 22.04.3 LTS', 'amd64', '5.15.0-89-generic',
 'containerd://1.7.10', 'v1.28.2+k3s1', 'v1.28.2+k3s1',
 'worker',
 '{"node-role.kubernetes.io/worker":""}',
 '[]',
 '{}',
 '2026-01-20 10:40:00', '2026-02-28 07:25:00');

-- ===================================================================
-- KUBERNETES NAMESPACES
-- ===================================================================
INSERT INTO kubernetes_namespaces (
    namespace_id, cluster_id, namespace_name, namespace_uid, description,
    namespace_state, resource_quota_enabled,
    cpu_limit, memory_limit, storage_limit, pod_limit, service_limit,
    network_policy_enabled, default_deny_ingress, default_deny_egress,
    labels, annotations, created_by, team, owner
) VALUES
-- Production cluster namespaces
(1, 1, 'default', 'ns-default-1111-1111-1111', 'Default namespace', 'active', FALSE, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, '{}', '{}', 'system', NULL, NULL),
(2, 1, 'kube-system', 'ns-kube-system-1111-1111', 'Kubernetes system namespace', 'active', FALSE, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, '{}', '{}', 'system', NULL, NULL),
(3, 1, 'kube-public', 'ns-kube-public-1111-1111', 'Public namespace', 'active', FALSE, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, '{}', '{}', 'system', NULL, NULL),
(4, 1, 'prod-web-app', 'ns-prod-web-1111-1111-1111', 'Production web application namespace', 
 'active', TRUE, '8000m', '16Gi', '100Gi', 50, 10,
 TRUE, TRUE, FALSE,
 '{"team":"web-team","env":"production"}', '{"contact":"web-team@farm.local"}', 
 'admin', 'web-team', 'web-lead'),
(5, 1, 'prod-api', 'ns-prod-api-1111-1111-1111', 'Production API namespace',
 'active', TRUE, '16000m', '32Gi', '200Gi', 100, 20,
 TRUE, TRUE, FALSE,
 '{"team":"backend-team","env":"production"}', '{"contact":"backend-team@farm.local"}',
 'admin', 'backend-team', 'backend-lead'),
(6, 1, 'prod-database', 'ns-prod-db-1111-1111-1111', 'Production database namespace',
 'active', TRUE, '32000m', '64Gi', '500Gi', 20, 5,
 TRUE, TRUE, TRUE,
 '{"team":"dba-team","env":"production"}', '{"contact":"dba@farm.local"}',
 'admin', 'dba-team', 'dba-lead'),
(7, 1, 'monitoring', 'ns-monitoring-1111-1111-1111', 'Monitoring stack namespace',
 'active', TRUE, '4000m', '8Gi', '1Ti', 30, 10,
 FALSE, FALSE, FALSE,
 '{"purpose":"monitoring"}', '{"managed-by":"ops-team"}',
 'admin', 'ops-team', 'ops-lead'),
(8, 1, 'logging', 'ns-logging-1111-1111-1111', 'Logging stack namespace',
 'active', TRUE, '4000m', '8Gi', '2Ti', 30, 10,
 FALSE, FALSE, FALSE,
 '{"purpose":"logging"}', '{"managed-by":"ops-team"}',
 'admin', 'ops-team', 'ops-lead'),

-- Development cluster namespaces
(9, 2, 'default', 'ns-default-2222-2222-2222', 'Default namespace', 'active', FALSE, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, '{}', '{}', 'system', NULL, NULL),
(10, 2, 'kube-system', 'ns-kube-system-2222-2222', 'Kubernetes system namespace', 'active', FALSE, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, '{}', '{}', 'system', NULL, NULL),
(11, 2, 'dev-testing', 'ns-dev-testing-2222-2222', 'Development testing namespace',
 'active', TRUE, '2000m', '4Gi', '50Gi', 30, 10,
 FALSE, FALSE, FALSE,
 '{"env":"development"}', '{}',
 'admin', 'devops-team', 'dev-lead'),
(12, 2, 'dev-experiments', 'ns-dev-experiments-2222', 'Experimental workloads',
 'active', FALSE, NULL, NULL, NULL, NULL, NULL,
 FALSE, FALSE, FALSE,
 '{"env":"development","purpose":"experiments"}', '{}',
 'admin', 'devops-team', 'dev-lead');

-- ===================================================================
-- KUBERNETES WORKLOADS
-- ===================================================================
INSERT INTO kubernetes_workloads (
    workload_id, cluster_id, namespace_id, workload_name, workload_uid,
    workload_type, replicas_desired, replicas_current, replicas_ready, replicas_available, replicas_updated,
    container_image, container_images,
    strategy_type, max_surge, max_unavailable,
    workload_state, is_paused,
    node_selector, cpu_request, memory_request, cpu_limit, memory_limit,
    labels, annotations, selector, created_by
) VALUES
-- Production web app workloads
(1, 1, 4, 'web-frontend', 'wl-web-frontend-1111-1111', 'deployment',
 3, 3, 3, 3, 3,
 'nginx:1.25', '["nginx:1.25"]',
 'RollingUpdate', 1, 0,
 'running', FALSE,
 '{"workload":"general"}', '500m', '512Mi', '1000m', '1Gi',
 '{"app":"web-frontend","tier":"frontend"}', '{}', '{"app":"web-frontend"}', 'admin'),

(2, 1, 4, 'web-backend', 'wl-web-backend-1111-1111', 'deployment',
 5, 5, 5, 5, 5,
 'myapp/backend:v2.3.1', '["myapp/backend:v2.3.1","redis:7-alpine"]',
 'RollingUpdate', 1, 0,
 'running', FALSE,
 '{"workload":"general"}', '1000m', '2Gi', '2000m', '4Gi',
 '{"app":"web-backend","tier":"backend"}', '{}', '{"app":"web-backend"}', 'admin'),

-- Production API workloads
(3, 1, 5, 'api-gateway', 'wl-api-gateway-1111-1111', 'deployment',
 4, 4, 4, 4, 4,
 'kong:3.5', '["kong:3.5","postgres:15-alpine"]',
 'RollingUpdate', 1, 1,
 'running', FALSE,
 '{"workload":"general"}', '2000m', '4Gi', '4000m', '8Gi',
 '{"app":"api-gateway","tier":"gateway"}', '{}', '{"app":"api-gateway"}', 'admin'),

(4, 1, 5, 'api-service', 'wl-api-service-1111-1111', 'deployment',
 6, 6, 6, 6, 6,
 'myapp/api:v3.1.0', '["myapp/api:v3.1.0"]',
 'RollingUpdate', 2, 1,
 'running', FALSE,
 '{"workload":"general"}', '1500m', '3Gi', '3000m', '6Gi',
 '{"app":"api-service","tier":"backend"}', '{}', '{"app":"api-service"}', 'admin'),

-- Production database workload
(5, 1, 6, 'postgres-primary', 'wl-postgres-primary-1111', 'statefulset',
 1, 1, 1, 1, 1,
 'postgres:15.5', '["postgres:15.5"]',
 'RollingUpdate', NULL, NULL,
 'running', FALSE,
 '{"workload":"database"}', '4000m', '8Gi', '8000m', '16Gi',
 '{"app":"postgres","role":"primary"}', '{}', '{"app":"postgres","role":"primary"}', 'admin'),

(6, 1, 6, 'postgres-replica', 'wl-postgres-replica-1111', 'statefulset',
 2, 2, 2, 2, 2,
 'postgres:15.5', '["postgres:15.5"]',
 'RollingUpdate', NULL, NULL,
 'running', FALSE,
 '{"workload":"database"}', '4000m', '8Gi', '8000m', '16Gi',
 '{"app":"postgres","role":"replica"}', '{}', '{"app":"postgres","role":"replica"}', 'admin'),

-- Monitoring workloads
(7, 1, 7, 'prometheus', 'wl-prometheus-1111-1111', 'statefulset',
 1, 1, 1, 1, 1,
 'prom/prometheus:v2.48.0', '["prom/prometheus:v2.48.0"]',
 'RollingUpdate', NULL, NULL,
 'running', FALSE,
 '{}', '2000m', '4Gi', '4000m', '8Gi',
 '{"app":"prometheus"}', '{}', '{"app":"prometheus"}', 'admin'),

(8, 1, 7, 'grafana', 'wl-grafana-1111-1111', 'deployment',
 2, 2, 2, 2, 2,
 'grafana/grafana:10.2.3', '["grafana/grafana:10.2.3"]',
 'RollingUpdate', 1, 0,
 'running', FALSE,
 '{}', '500m', '1Gi', '1000m', '2Gi',
 '{"app":"grafana"}', '{}', '{"app":"grafana"}', 'admin'),

-- GPU workload
(9, 1, 5, 'ml-training-job', 'wl-ml-training-1111-1111', 'job',
 1, 1, 0, 0, 1,
 'pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime', '["pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime"]',
 NULL, NULL, NULL,
 'running', FALSE,
 '{"gpu":"true"}', '8000m', '32Gi', '16000m', '64Gi',
 '{"app":"ml-training","workload":"gpu"}', '{}', '{"app":"ml-training"}', 'ml-team'),

-- Development workloads
(10, 2, 11, 'dev-test-app', 'wl-dev-test-app-2222', 'deployment',
 1, 1, 1, 1, 1,
 'nginx:latest', '["nginx:latest"]',
 'RollingUpdate', 1, 0,
 'running', FALSE,
 '{}', '100m', '128Mi', '200m', '256Mi',
 '{"app":"test-app"}', '{}', '{"app":"test-app"}', 'developer');

-- ===================================================================
-- KUBERNETES PODS
-- ===================================================================
INSERT INTO kubernetes_pods (
    pod_id, cluster_id, namespace_id, workload_id, k8s_node_id,
    pod_name, pod_uid, pod_ip, host_ip,
    pod_phase, pod_state, is_ready,
    initialized, containers_ready, pod_scheduled,
    container_count, init_container_count, restart_count,
    qos_class, cpu_request, memory_request, cpu_limit, memory_limit,
    labels, annotations, started_at
) VALUES
-- Web frontend pods
(1, 1, 4, 1, 4, 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1', '10.244.1.10', '10.10.1.21',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '500m', '512Mi', '1000m', '1Gi',
 '{"app":"web-frontend","tier":"frontend","pod-template-hash":"7d9f5c6b"}', '{}', '2026-02-01 10:00:00'),

(2, 1, 4, 1, 5, 'web-frontend-7d9f5c6b-mq3r7', 'pod-web-frontend-1111-1111-2', '10.244.2.10', '10.10.1.22',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '500m', '512Mi', '1000m', '1Gi',
 '{"app":"web-frontend","tier":"frontend","pod-template-hash":"7d9f5c6b"}', '{}', '2026-02-01 10:01:00'),

(3, 1, 4, 1, 6, 'web-frontend-7d9f5c6b-8nh4p', 'pod-web-frontend-1111-1111-3', '10.244.3.10', '10.10.1.23',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '500m', '512Mi', '1000m', '1Gi',
 '{"app":"web-frontend","tier":"frontend","pod-template-hash":"7d9f5c6b"}', '{}', '2026-02-01 10:02:00'),

-- API gateway pods
(4, 1, 5, 3, 4, 'api-gateway-85c7d9f-xk92m', 'pod-api-gateway-1111-1111-1', '10.244.1.20', '10.10.1.21',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 2, 1, 0, 'Burstable',
 '2000m', '4Gi', '4000m', '8Gi',
 '{"app":"api-gateway","tier":"gateway","pod-template-hash":"85c7d9f"}', '{}', '2026-02-01 09:00:00'),

-- Postgres primary pod
(5, 1, 6, 5, 5, 'postgres-primary-0', 'pod-postgres-primary-1111-1', '10.244.2.30', '10.10.1.22',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '4000m', '8Gi', '8000m', '16Gi',
 '{"app":"postgres","role":"primary","statefulset.kubernetes.io/pod-name":"postgres-primary-0"}', '{}', '2026-01-20 08:00:00'),

-- Prometheus pod
(6, 1, 7, 7, 6, 'prometheus-0', 'pod-prometheus-1111-1111-1', '10.244.3.40', '10.10.1.23',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '2000m', '4Gi', '4000m', '8Gi',
 '{"app":"prometheus","statefulset.kubernetes.io/pod-name":"prometheus-0"}', '{}', '2026-01-22 09:00:00'),

-- GPU ML training pod
(7, 1, 5, 9, 7, 'ml-training-job-xk8m2', 'pod-ml-training-1111-1111-1', '10.244.4.10', '10.10.1.31',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '8000m', '32Gi', '16000m', '64Gi',
 '{"app":"ml-training","workload":"gpu","job-name":"ml-training-job"}', '{"nvidia.com/gpu":"1"}', '2026-02-28 06:00:00'),

-- Dev pod
(8, 2, 11, 10, 10, 'dev-test-app-6c8b4d-n7k3m', 'pod-dev-test-2222-1', '10.42.1.10', '10.20.1.21',
 'running', 'running', TRUE, TRUE, TRUE, TRUE, 1, 0, 0, 'Burstable',
 '100m', '128Mi', '200m', '256Mi',
 '{"app":"test-app","pod-template-hash":"6c8b4d"}', '{}', '2026-02-20 14:00:00');

-- ===================================================================
-- KUBERNETES SERVICES
-- ===================================================================
INSERT INTO kubernetes_services (
    service_id, cluster_id, namespace_id, service_name, service_uid,
    service_type, cluster_ip, external_ips, load_balancer_ip,
    ports, session_affinity, external_traffic_policy,
    selector, labels, annotations, created_by
) VALUES
-- Production web services
(1, 1, 4, 'web-frontend-svc', 'svc-web-frontend-1111-1111', 'ClusterIP',
 '10.96.10.10', NULL, NULL,
 '[{"port":80,"targetPort":8080,"protocol":"TCP"}]',
 'None', 'Cluster',
 '{"app":"web-frontend"}', '{"app":"web-frontend"}', '{}', 'admin'),

(2, 1, 4, 'web-backend-svc', 'svc-web-backend-1111-1111', 'ClusterIP',
 '10.96.10.20', NULL, NULL,
 '[{"port":8080,"targetPort":8080,"protocol":"TCP"}]',
 'None', 'Cluster',
 '{"app":"web-backend"}', '{"app":"web-backend"}', '{}', 'admin'),

(3, 1, 5, 'api-gateway-svc', 'svc-api-gateway-1111-1111', 'LoadBalancer',
 '10.96.20.10', NULL, '203.0.113.100',
 '[{"port":443,"targetPort":8443,"protocol":"TCP","name":"https"},{"port":80,"targetPort":8000,"protocol":"TCP","name":"http"}]',
 'None', 'Local',
 '{"app":"api-gateway"}', '{"app":"api-gateway"}', '{}', 'admin'),

(4, 1, 5, 'api-service-svc', 'svc-api-service-1111-1111', 'ClusterIP',
 '10.96.20.20', NULL, NULL,
 '[{"port":3000,"targetPort":3000,"protocol":"TCP"}]',
 'ClientIP', 'Cluster',
 '{"app":"api-service"}', '{"app":"api-service"}', '{"service.beta.kubernetes.io/aws-load-balancer-type":"nlb"}', 'admin'),

-- Database services
(5, 1, 6, 'postgres-primary-svc', 'svc-postgres-primary-1111', 'ClusterIP',
 '10.96.30.10', NULL, NULL,
 '[{"port":5432,"targetPort":5432,"protocol":"TCP"}]',
 'None', 'Cluster',
 '{"app":"postgres","role":"primary"}', '{"app":"postgres"}', '{}', 'admin'),

(6, 1, 6, 'postgres-replica-svc', 'svc-postgres-replica-1111', 'ClusterIP',
 '10.96.30.20', NULL, NULL,
 '[{"port":5432,"targetPort":5432,"protocol":"TCP"}]',
 'None', 'Cluster',
 '{"app":"postgres","role":"replica"}', '{"app":"postgres"}', '{}', 'admin'),

-- Monitoring services
(7, 1, 7, 'prometheus-svc', 'svc-prometheus-1111-1111', 'ClusterIP',
 '10.96.40.10', NULL, NULL,
 '[{"port":9090,"targetPort":9090,"protocol":"TCP"}]',
 'None', 'Cluster',
 '{"app":"prometheus"}', '{"app":"prometheus"}', '{}', 'admin'),

(8, 1, 7, 'grafana-svc', 'svc-grafana-1111-1111', 'NodePort',
 '10.96.40.20', NULL, NULL,
 '[{"port":3000,"targetPort":3000,"protocol":"TCP","nodePort":30300}]',
 'None', 'Cluster',
 '{"app":"grafana"}', '{"app":"grafana"}', '{}', 'admin');

-- ===================================================================
-- KUBERNETES INGRESSES
-- ===================================================================
INSERT INTO kubernetes_ingresses (
    ingress_id, cluster_id, namespace_id, ingress_name, ingress_uid,
    ingress_class, rules, tls_config, load_balancer_ingress,
    labels, annotations, created_by
) VALUES
-- Production web ingress
(1, 1, 4, 'web-ingress', 'ing-web-1111-1111-1111', 'nginx',
 '[{"host":"web.farm.local","paths":[{"path":"/","pathType":"Prefix","serviceName":"web-frontend-svc","servicePort":80}]}]',
 '[{"hosts":["web.farm.local"],"secretName":"web-tls-cert"}]',
 '[{"ip":"203.0.113.150"}]',
 '{"app":"web"}', '{"nginx.ingress.kubernetes.io/rewrite-target":"/","cert-manager.io/cluster-issuer":"letsencrypt-prod"}', 'admin'),

-- API ingress
(2, 1, 5, 'api-ingress', 'ing-api-1111-1111-1111', 'nginx',
 '[{"host":"api.farm.local","paths":[{"path":"/","pathType":"Prefix","serviceName":"api-gateway-svc","servicePort":80}]}]',
 '[{"hosts":["api.farm.local"],"secretName":"api-tls-cert"}]',
 '[{"ip":"203.0.113.151"}]',
 '{"app":"api"}', '{"nginx.ingress.kubernetes.io/ssl-redirect":"true","nginx.ingress.kubernetes.io/rate-limit":"100"}', 'admin'),

-- Monitoring ingress
(3, 1, 7, 'monitoring-ingress', 'ing-monitoring-1111-1111', 'nginx',
 '[{"host":"grafana.farm.local","paths":[{"path":"/","pathType":"Prefix","serviceName":"grafana-svc","servicePort":3000}]}]',
 '[{"hosts":["grafana.farm.local"],"secretName":"monitoring-tls-cert"}]',
 '[{"ip":"203.0.113.152"}]',
 '{"app":"monitoring"}', '{"nginx.ingress.kubernetes.io/auth-type":"basic"}', 'admin');

-- ===================================================================
-- KUBERNETES EVENTS
-- ===================================================================
INSERT INTO kubernetes_events (
    event_id, cluster_id, namespace_id, event_name, event_uid,
    event_type, reason, message,
    involved_object_kind, involved_object_name, involved_object_uid,
    source_component, source_host,
    event_count, first_occurrence, last_occurrence
) VALUES
-- Node events
(1, 1, NULL, 'prod-k8s-worker-01.178e9d7f', 'evt-node-1111-1111-1', 'Normal', 'NodeReady',
 'Node prod-k8s-worker-01 status is now: NodeReady',
 'Node', 'prod-k8s-worker-01', 'worker-uid-1111-1114',
 'kubelet', 'prod-k8s-worker-01', 1, '2026-01-15 09:00:00', '2026-01-15 09:00:00'),

-- Pod scheduling events
(2, 1, 4, 'web-frontend-7d9f5c6b-xj8k2.178e9d80', 'evt-pod-1111-1111-1', 'Normal', 'Scheduled',
 'Successfully assigned prod-web-app/web-frontend-7d9f5c6b-xj8k2 to prod-k8s-worker-01',
 'Pod', 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1',
 'default-scheduler', 'prod-k8s-cp-01', 1, '2026-02-01 10:00:00', '2026-02-01 10:00:00'),

(3, 1, 4, 'web-frontend-7d9f5c6b-xj8k2.178e9d81', 'evt-pod-1111-1111-2', 'Normal', 'Pulling',
 'Pulling image "nginx:1.25"',
 'Pod', 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1',
 'kubelet', 'prod-k8s-worker-01', 1, '2026-02-01 10:00:05', '2026-02-01 10:00:05'),

(4, 1, 4, 'web-frontend-7d9f5c6b-xj8k2.178e9d82', 'evt-pod-1111-1111-3', 'Normal', 'Pulled',
 'Successfully pulled image "nginx:1.25" in 3.456s',
 'Pod', 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1',
 'kubelet', 'prod-k8s-worker-01', 1, '2026-02-01 10:00:08', '2026-02-01 10:00:08'),

(5, 1, 4, 'web-frontend-7d9f5c6b-xj8k2.178e9d83', 'evt-pod-1111-1111-4', 'Normal', 'Created',
 'Created container nginx',
 'Pod', 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1',
 'kubelet', 'prod-k8s-worker-01', 1, '2026-02-01 10:00:09', '2026-02-01 10:00:09'),

(6, 1, 4, 'web-frontend-7d9f5c6b-xj8k2.178e9d84', 'evt-pod-1111-1111-5', 'Normal', 'Started',
 'Started container nginx',
 'Pod', 'web-frontend-7d9f5c6b-xj8k2', 'pod-web-frontend-1111-1111-1',
 'kubelet', 'prod-k8s-worker-01', 1, '2026-02-01 10:00:10', '2026-02-01 10:00:10'),

-- Deployment scaling event
(7, 1, 5, 'api-service.178e9d85', 'evt-deployment-1111-1111-1', 'Normal', 'ScalingReplicaSet',
 'Scaled up replica set api-service-85c7d9f to 6',
 'Deployment', 'api-service', 'wl-api-service-1111-1111',
 'deployment-controller', 'prod-k8s-cp-01', 1, '2026-02-15 14:30:00', '2026-02-15 14:30:00'),

-- Warning event - ImagePullBackOff
(8, 2, 11, 'test-pod-broken.178e9d86', 'evt-pod-2222-1111-1', 'Warning', 'Failed',
 'Error: ImagePullBackOff',
 'Pod', 'test-pod-broken-abc123', 'pod-test-broken-2222-1',
 'kubelet', 'dev-k8s-worker-01', 5, '2026-02-28 05:00:00', '2026-02-28 06:00:00');

-- ===================================================================
-- KUBERNETES METRICS
-- ===================================================================
INSERT INTO kubernetes_metrics (
    metric_id, cluster_id, resource_type, resource_id, resource_name,
    cpu_usage_cores, cpu_usage_percent, cpu_request_cores, cpu_limit_cores,
    memory_usage_bytes, memory_usage_mb, memory_usage_percent, memory_request_mb, memory_limit_mb,
    memory_working_set_bytes,
    storage_usage_bytes, storage_usage_gb, storage_available_bytes,
    network_rx_bytes, network_tx_bytes, network_rx_errors, network_tx_errors,
    fs_reads, fs_writes, fs_read_bytes, fs_write_bytes,
    collected_at
) VALUES
-- Cluster-level metrics
(1, 1, 'cluster', 1, 'prod-k8s-main',
 42.5, 65.2, NULL, NULL,
 171798691840, 163840, 52.3, NULL, NULL,
 171798691840,
 NULL, NULL, NULL,
 1500000000000, 980000000000, 0, 0,
 NULL, NULL, NULL, NULL,
 '2026-02-28 07:30:00'),

-- Node metrics
(2, 1, 'node', 4, 'prod-k8s-worker-01',
 12.5, 78.1, NULL, NULL,
 28991029248, 27648, 84.8, NULL, NULL,
 28991029248,
 NULL, NULL, NULL,
 450000000000, 320000000000, 0, 0,
 500000, 350000, 52428800000, 36700160000,
 '2026-02-28 07:30:00'),

(3, 1, 'node', 5, 'prod-k8s-worker-02',
 11.8, 73.8, NULL, NULL,
 26843545600, 25600, 78.6, NULL, NULL,
 26843545600,
 NULL, NULL, NULL,
 380000000000, 270000000000, 0, 0,
 480000, 330000, 48318382080, 33285996544,
 '2026-02-28 07:30:00'),

(4, 1, 'node', 7, 'prod-k8s-gpu-01',
 28.5, 89.1, NULL, NULL,
 115964116992, 110592, 87.2, NULL, NULL,
 115964116992,
 NULL, NULL, NULL,
 850000000000, 620000000000, 0, 0,
 1200000, 890000, 125829120000, 92274688000,
 '2026-02-28 07:30:00'),

-- Pod metrics
(5, 1, 'pod', 1, 'web-frontend-7d9f5c6b-xj8k2',
 0.45, 45.0, 0.5, 1.0,
 536870912, 512, 50.0, 512, 1024,
 536870912,
 NULL, NULL, NULL,
 5000000000, 3000000000, 0, 0,
 10000, 8000, 104857600, 83886080,
 '2026-02-28 07:30:00'),

(6, 1, 'pod', 4, 'api-gateway-85c7d9f-xk92m',
 1.85, 92.5, 2.0, 4.0,
 4026531840, 3840, 48.0, 4096, 8192,
 4026531840,
 NULL, NULL, NULL,
 45000000000, 32000000000, 0, 0,
 50000, 35000, 524288000, 367001600,
 '2026-02-28 07:30:00'),

(7, 1, 'pod', 5, 'postgres-primary-0',
 3.2, 80.0, 4.0, 8.0,
 7516192768, 7168, 87.5, 8192, 16384,
 7516192768,
 NULL, NULL, NULL,
 120000000000, 95000000000, 0, 0,
 250000, 180000, 2621440000, 1887436800,
 '2026-02-28 07:30:00'),

(8, 1, 'pod', 7, 'ml-training-job-xk8m2',
 14.5, 90.6, 8.0, 16.0,
 32212254720, 30720, 93.8, 32768, 65536,
 32212254720,
 NULL, NULL, NULL,
 280000000000, 195000000000, 0, 0,
 580000, 420000, 6082560000, 4405452800,
 '2026-02-28 07:30:00'),

-- Workload metrics
(9, 1, 'workload', 1, 'web-frontend',
 1.35, 45.0, 1.5, 3.0,
 1610612736, 1536, 50.0, 1536, 3072,
 1610612736,
 NULL, NULL, NULL,
 15000000000, 9000000000, 0, 0,
 30000, 24000, 314572800, 251658240,
 '2026-02-28 07:30:00'),

(10, 2, 'pod', 8, 'dev-test-app-6c8b4d-n7k3m',
 0.08, 80.0, 0.1, 0.2,
 117440512, 112, 87.5, 128, 256,
 117440512,
 NULL, NULL, NULL,
 850000000, 620000000, 0, 0,
 3500, 2800, 36700160, 29360128,
 '2026-02-28 07:25:00');

-- ===================================================================
-- KUBERNETES SECRETS
-- ===================================================================
INSERT INTO kubernetes_secrets (
    secret_id, cluster_id, namespace_id, secret_name, secret_uid,
    secret_type, data_keys, data_size_bytes, is_immutable,
    labels, annotations, created_by
) VALUES
-- TLS certificates
(1, 1, 4, 'web-tls-cert', 'secret-web-tls-1111-1111', 'kubernetes.io/tls',
 '["tls.crt","tls.key"]', 8192, TRUE,
 '{"app":"web"}', '{"cert-manager.io/certificate-name":"web-farm-local"}', 'cert-manager'),

(2, 1, 5, 'api-tls-cert', 'secret-api-tls-1111-1111', 'kubernetes.io/tls',
 '["tls.crt","tls.key"]', 8192, TRUE,
 '{"app":"api"}', '{"cert-manager.io/certificate-name":"api-farm-local"}', 'cert-manager'),

-- Docker registry credentials
(3, 1, 4, 'docker-registry-creds', 'secret-docker-reg-1111-1111', 'kubernetes.io/dockerconfigjson',
 '[".dockerconfigjson"]', 512, FALSE,
 '{}', '{}', 'admin'),

-- Database credentials
(4, 1, 6, 'postgres-credentials', 'secret-postgres-creds-1111', 'Opaque',
 '["username","password","database"]', 256, FALSE,
 '{"app":"postgres"}', '{"managed-by":"external-secrets"}', 'admin'),

(5, 1, 6, 'postgres-replica-creds', 'secret-postgres-replica-1111', 'Opaque',
 '["username","password","database","replication-user","replication-password"]', 384, FALSE,
 '{"app":"postgres","role":"replica"}', '{}', 'admin'),

-- API keys and tokens
(6, 1, 5, 'api-keys', 'secret-api-keys-1111-1111', 'Opaque',
 '["jwt-secret","api-key","webhook-secret"]', 512, FALSE,
 '{"app":"api"}', '{}', 'admin'),

-- SSH keys
(7, 1, 2, 'git-ssh-key', 'secret-git-ssh-1111-1111', 'kubernetes.io/ssh-auth',
 '["ssh-privatekey"]', 3248, FALSE,
 '{}', '{}', 'admin'),

-- Basic auth
(8, 1, 7, 'grafana-admin-creds', 'secret-grafana-admin-1111', 'kubernetes.io/basic-auth',
 '["username","password"]', 128, FALSE,
 '{"app":"grafana"}', '{}', 'admin');

-- ===================================================================
-- KUBERNETES CONFIGMAPS
-- ===================================================================
INSERT INTO kubernetes_configmaps (
    configmap_id, cluster_id, namespace_id, configmap_name, configmap_uid,
    data_keys, binary_data_keys, data_size_bytes, is_immutable,
    labels, annotations, created_by
) VALUES
-- Application configs
(1, 1, 4, 'web-frontend-config', 'cm-web-frontend-1111-1111', 
 '["nginx.conf","app.conf","mime.types"]', NULL, 8192, FALSE,
 '{"app":"web-frontend"}', '{}', 'admin'),

(2, 1, 4, 'web-backend-config', 'cm-web-backend-1111-1111',
 '["config.yaml","logging.yaml","environment"]', NULL, 4096, FALSE,
 '{"app":"web-backend"}', '{}', 'admin'),

(3, 1, 5, 'api-gateway-config', 'cm-api-gateway-1111-1111',
 '["kong.yaml","plugins.yaml","routes.yaml"]', NULL, 16384, FALSE,
 '{"app":"api-gateway"}', '{}', 'admin'),

(4, 1, 5, 'api-service-config', 'cm-api-service-1111-1111',
 '["app-config.json","database.json","redis.json","features.json"]', NULL, 12288, FALSE,
 '{"app":"api-service"}', '{}', 'admin'),

-- Database configs
(5, 1, 6, 'postgres-config', 'cm-postgres-config-1111-1111',
 '["postgresql.conf","pg_hba.conf","initdb.sql"]', NULL, 24576, FALSE,
 '{"app":"postgres"}', '{}', 'dba-team'),

(6, 1, 6, 'postgres-scripts', 'cm-postgres-scripts-1111-1111',
 '["backup.sh","restore.sh","health-check.sh"]', NULL, 4096, FALSE,
 '{"app":"postgres"}', '{}', 'dba-team'),

-- Monitoring configs
(7, 1, 7, 'prometheus-config', 'cm-prometheus-config-1111-1111',
 '["prometheus.yml","alerts.yml","rules.yml"]', NULL, 32768, FALSE,
 '{"app":"prometheus"}', '{}', 'ops-team'),

(8, 1, 7, 'grafana-dashboards', 'cm-grafana-dashboards-1111',
 '["dashboard-k8s.json","dashboard-apps.json","dashboard-infra.json"]', NULL, 65536, FALSE,
 '{"app":"grafana"}', '{}', 'ops-team'),

(9, 1, 8, 'fluentd-config', 'cm-fluentd-config-1111-1111',
 '["fluent.conf","kubernetes.conf","output.conf"]', NULL, 16384, FALSE,
 '{"app":"fluentd"}', '{}', 'ops-team'),

-- Environment-specific configs
(10, 2, 11, 'dev-app-config', 'cm-dev-app-config-2222-1111',
 '["config.yaml","environment"]', NULL, 2048, FALSE,
 '{"env":"development"}', '{}', 'developer');
