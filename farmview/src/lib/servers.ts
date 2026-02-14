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

// Power management functions
export async function powerOnServer(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.ON(server_id), {
			method: 'POST',
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result;
	} catch (error) {
		console.error("Failed to power on server:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to power on server'
		};
	}
}

export async function powerOffServer(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.OFF(server_id), {
			method: 'POST',
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result;
	} catch (error) {
		console.error("Failed to power off server:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to power off server'
		};
	}
}

export async function restartServer(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.RESTART(server_id), {
			method: 'POST',
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result;
	} catch (error) {
		console.error("Failed to restart server:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to restart server'
		};
	}
}

export async function forcePowerOffServer(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.FORCE_OFF(server_id), {
			method: 'POST',
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result;
	} catch (error) {
		console.error("Failed to force power off server:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to force power off server'
		};
	}
}

export async function forceRestartServer(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.FORCE_RESTART(server_id), {
			method: 'POST',
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result;
	} catch (error) {
		console.error("Failed to force restart server:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to force restart server'
		};
	}
}

export async function getServerPowerStatus(server_id: number) {
	try {
		const result = await apiRequest(API_ENDPOINTS.SERVERS.POWER.STATUS(server_id), {
			timeout: 30000 // 30 seconds for BMC operations
		});
		return result?.data || null;
	} catch (error) {
		console.error("Failed to get server power status:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to get server power status'
		};
	}
}
  