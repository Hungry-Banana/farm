import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

// ===================================================================
// SWITCH LIST / OVERVIEW
// ===================================================================

export async function getSwitches() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.LIST);
			return result?.data || [];
		},
		[],
		'Failed to fetch switches:'
	);
}

export async function getSwitchesPaginated(
	page = 1,
	perPage = 15,
	filters: Record<string, any> = {},
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.SWITCHES.LIST,
		page,
		perPage,
		filters,
		searchCriteria,
		'switches'
	);
}

export async function getSwitchStats() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.STATS);
			return result?.data || {};
		},
		{},
		'Failed to fetch switch stats:'
	);
}

// ===================================================================
// INDIVIDUAL SWITCH
// ===================================================================

export async function getSwitchById(switchId: number) {
	return getEntityById(API_ENDPOINTS.SWITCHES.BY_ID, switchId, 'switch');
}

export async function getSwitchStatById(switchId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.SWITCH_STATS(switchId));
			return result?.data || null;
		},
		null,
		`Failed to fetch stats for switch ${switchId}:`
	);
}

export async function createSwitch(data: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.CREATE, {
				method: 'POST',
				body: data,
			});
			return result;
		},
		null,
		'Failed to create switch:'
	);
}

export async function updateSwitch(switchId: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.UPDATE(switchId), {
				method: 'PUT',
				body: updateData,
			});
			return result;
		},
		null,
		`Failed to update switch ${switchId}:`
	);
}

export async function deleteSwitch(switchId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.DELETE(switchId), {
				method: 'DELETE',
			});
			return result;
		},
		null,
		`Failed to delete switch ${switchId}:`
	);
}

// ===================================================================
// PORTS
// ===================================================================

export async function getPortsBySwitch(switchId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.PORTS.BY_SWITCH(switchId));
			return result?.data || [];
		},
		[],
		`Failed to fetch ports for switch ${switchId}:`
	);
}

export async function getPortById(portId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.PORTS.BY_ID(portId));
			return result?.data || null;
		},
		null,
		`Failed to fetch port ${portId}:`
	);
}

export async function createPort(switchId: number, data: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.PORTS.CREATE(switchId), {
				method: 'POST',
				body: data,
			});
			return result;
		},
		null,
		`Failed to create port on switch ${switchId}:`
	);
}

export async function updatePort(portId: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.PORTS.UPDATE(portId), {
				method: 'PUT',
				body: updateData,
			});
			return result;
		},
		null,
		`Failed to update port ${portId}:`
	);
}

export async function deletePort(portId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.PORTS.DELETE(portId), {
				method: 'DELETE',
			});
			return result;
		},
		null,
		`Failed to delete port ${portId}:`
	);
}

// ===================================================================
// VLANS
// ===================================================================

export async function getVlansBySwitch(switchId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.VLANS.BY_SWITCH(switchId));
			return result?.data || [];
		},
		[],
		`Failed to fetch VLANs for switch ${switchId}:`
	);
}

export async function createVlan(switchId: number, data: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.VLANS.CREATE(switchId), {
				method: 'POST',
				body: data,
			});
			return result;
		},
		null,
		`Failed to create VLAN on switch ${switchId}:`
	);
}

export async function deleteVlan(vlanDbId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.SWITCHES.VLANS.DELETE(vlanDbId), {
				method: 'DELETE',
			});
			return result;
		},
		null,
		`Failed to delete VLAN record ${vlanDbId}:`
	);
}

// ===================================================================
// CLUSTER / SUB-CLUSTER FILTERING
// ===================================================================

export async function getSwitchesByCluster(clusterId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(
				`${API_ENDPOINTS.SWITCHES.LIST}?cluster_id=${clusterId}&per_page=200`
			);
			return result?.data || [];
		},
		[],
		`Failed to fetch switches for cluster ${clusterId}:`
	);
}

export async function getSwitchesBySubCluster(subClusterId: number, clusterId: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(
				`${API_ENDPOINTS.SWITCHES.LIST}?sub_cluster_id=${subClusterId}&cluster_id=${clusterId}&per_page=200`
			);
			return result?.data || [];
		},
		[],
		`Failed to fetch switches for sub-cluster ${subClusterId}:`
	);
}
