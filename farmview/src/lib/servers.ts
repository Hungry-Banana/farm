import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

export async function getServers() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SERVERS.LIST);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch servers:"
	);
}

export async function getServerById(server_id: number) {
	return getEntityById(API_ENDPOINTS.SERVERS.BY_ID, server_id, "server");
}

export async function updateServer(server_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SERVERS.UPDATE(server_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null, // fallback value
		"Failed to update server:"
	);
}

export async function getServerOverview() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SERVERS.OVERVIEW);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch server overview:"
	);
}

// New function for paginated servers (used by TableComponent)
export async function getServersPaginated(
	page = 1, 
	perPage = 15, 
	filters: Record<string, any> = {}, 
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.SERVERS.LIST,
		page,
		perPage,
		filters,
		searchCriteria,
		"servers"
	);
}
  