import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

export async function getClusters() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.LIST);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch clusters:"
	);
}

export async function getClusterById(cluster_id: number) {
	return getEntityById(API_ENDPOINTS.CLUSTERS.BY_ID, cluster_id, "cluster");
}

export async function getClusterWithSubClusters(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.WITH_SUB_CLUSTERS(cluster_id));
			return result?.data || null;
		},
		null,
		`Failed to fetch cluster ${cluster_id} with sub-clusters:`
	);
}

export async function getClusterWithServers(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.WITH_SERVERS(cluster_id));
			return result?.data || null;
		},
		null,
		`Failed to fetch cluster ${cluster_id} with servers:`
	);
}

export async function updateCluster(cluster_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.UPDATE(cluster_id), {
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
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.DELETE(cluster_id), {
				method: 'DELETE'
			});
			return result;
		},
		null,
		"Failed to delete cluster:"
	);
}

export async function createCluster(clusterData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.CREATE, {
				method: 'POST',
				body: clusterData
			});
			return result;
		},
		null,
		"Failed to create cluster:"
	);
}

export async function getClusterStats() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.STATS);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch cluster stats:"
	);
}

export async function getClusterStatsById(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.CLUSTER_STATS(cluster_id));
			return result?.data || {};
		},
		{},
		`Failed to fetch stats for cluster ${cluster_id}:`
	);
}

// New function for paginated clusters (used by TableComponent)
export async function getClustersPaginated(
	page = 1, 
	perPage = 15, 
	filters: Record<string, any> = {}, 
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.CLUSTERS.LIST,
		page,
		perPage,
		filters,
		searchCriteria,
		"clusters"
	);
}

// Sub-cluster management functions
export async function getSubClustersByCluster(cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.BY_CLUSTER(cluster_id));
			return result?.data || [];
		},
		[],
		`Failed to fetch sub-clusters for cluster ${cluster_id}:`
	);
}

export async function getSubClusterById(sub_cluster_id: number) {
	return getEntityById(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.BY_ID, sub_cluster_id, "sub-cluster");
}

export async function getSubClusterStats(sub_cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.STATS(sub_cluster_id));
			return result?.data || {};
		},
		{},
		`Failed to fetch stats for sub-cluster ${sub_cluster_id}:`
	);
}

export async function createSubCluster(cluster_id: number, subClusterData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.CREATE(cluster_id), {
				method: 'POST',
				body: subClusterData
			});
			return result;
		},
		null,
		"Failed to create sub-cluster:"
	);
}

export async function updateSubCluster(sub_cluster_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.UPDATE(sub_cluster_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null,
		"Failed to update sub-cluster:"
	);
}

export async function deleteSubCluster(sub_cluster_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.CLUSTERS.SUB_CLUSTERS.DELETE(sub_cluster_id), {
				method: 'DELETE'
			});
			return result;
		},
		null,
		"Failed to delete sub-cluster:"
	);
}

export async function getSubClusterWithServers(sub_cluster_id: number, cluster_id: number) {
	return safeApiCall(
		async () => {
			// Filter by both sub_cluster_id and cluster_id so servers from other clusters
			// that happen to share the same sub_cluster_id value are excluded.
			const result = await apiRequest(
				`${API_ENDPOINTS.SERVERS.LIST}?sub_cluster_id=${sub_cluster_id}&cluster_id=${cluster_id}`
			);
			return result?.data || [];
		},
		[],
		`Failed to fetch servers for sub-cluster ${sub_cluster_id}:`
	);
}
