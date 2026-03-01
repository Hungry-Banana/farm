import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

// Cluster Management
export async function getClusters() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTERS);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch clusters:"
	);
}

export async function getClusterById(cluster_id: number) {
	return getEntityById(API_ENDPOINTS.KUBERNETES.CLUSTER_BY_ID, cluster_id, "cluster");
}

export async function updateCluster(cluster_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.UPDATE_CLUSTER(cluster_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null, // fallback value
		"Failed to update cluster:"
	);
}

export async function deleteCluster(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.DELETE_CLUSTER(cluster_id), {
				method: 'DELETE'
			});
			return result;
		},
		null, // fallback value
		"Failed to delete cluster:"
	);
}

export async function getClusterOverview() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.OVERVIEW);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch cluster overview:"
	);
}

// Paginated clusters (used by TableComponent)
export async function getClustersPaginated(
	page = 1, 
	perPage = 15, 
	filters: Record<string, any> = {}, 
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.KUBERNETES.CLUSTERS,
		page,
		perPage,
		filters,
		searchCriteria,
		"clusters"
	);
}

// Cluster-specific resources
export async function getClusterWorkloads(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTER_WORKLOADS(cluster_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch cluster workloads:"
	);
}

export async function getClusterNamespaces(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTER_NAMESPACES(cluster_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch cluster namespaces:"
	);
}

export async function getClusterPods(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTER_PODS(cluster_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch cluster pods:"
	);
}

export async function getClusterServices(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTER_SERVICES(cluster_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch cluster services:"
	);
}

export async function getClusterEvents(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.CLUSTER_EVENTS(cluster_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch cluster events:"
	);
}

// Node Management
export async function getNodes() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.NODES);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch nodes:"
	);
}

export async function getNodeById(node_id: number) {
	return getEntityById(API_ENDPOINTS.KUBERNETES.NODE_BY_ID, node_id, "node");
}

export async function updateNode(node_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.UPDATE_NODE(node_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null, // fallback value
		"Failed to update node:"
	);
}

export async function deleteNode(node_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.DELETE_NODE(node_id), {
				method: 'DELETE'
			});
			return result;
		},
		null, // fallback value
		"Failed to delete node:"
	);
}

// Resource Management
export async function getNamespaces() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.NAMESPACES);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch namespaces:"
	);
}

export async function getNamespaceById(namespace_id: number) {
	return getEntityById(API_ENDPOINTS.KUBERNETES.NAMESPACE_BY_ID, namespace_id, "namespace");
}

export async function getWorkloads() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.WORKLOADS);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch workloads:"
	);
}

export async function getPods() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.PODS);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch pods:"
	);
}

export async function getServices() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.SERVICES);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch services:"
	);
}

export async function getEvents() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.EVENTS);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch events:"
	);
}

// Inventory Management
export async function submitInventory(inventoryData: any) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.KUBERNETES.INVENTORY, {
				method: 'POST',
				body: inventoryData
			});
			return result;
		},
		null, // fallback value
		"Failed to submit inventory:"
	);
}
