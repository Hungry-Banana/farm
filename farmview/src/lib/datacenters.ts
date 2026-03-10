import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

export async function getDatacenters() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.LIST);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch datacenters:"
	);
}

export async function getDatacenterById(datacenter_id: number) {
	return getEntityById(API_ENDPOINTS.DATACENTERS.BY_ID, datacenter_id, "datacenter");
}

export async function getDatacenterWithRacks(datacenter_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.WITH_RACKS(datacenter_id));
			return result?.data || null;
		},
		null,
		`Failed to fetch datacenter ${datacenter_id} with racks:`
	);
}

export async function updateDatacenter(datacenter_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.UPDATE(datacenter_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null, // fallback value
		"Failed to update datacenter:"
	);
}

export async function deleteDatacenter(datacenter_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.DELETE(datacenter_id), {
				method: 'DELETE'
			});
			return result;
		},
		null,
		"Failed to delete datacenter:"
	);
}

export async function createDatacenter(datacenterData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.CREATE, {
				method: 'POST',
				body: datacenterData
			});
			return result;
		},
		null,
		"Failed to create datacenter:"
	);
}

export async function getDatacenterStats() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.STATS);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch datacenter stats:"
	);
}

export async function getDatacenterStatsById(datacenter_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.DATACENTER_STATS(datacenter_id));
			return result?.data || {};
		},
		{},
		`Failed to fetch stats for datacenter ${datacenter_id}:`
	);
}

// New function for paginated datacenters (used by TableComponent)
export async function getDatacentersPaginated(
	page = 1, 
	perPage = 15, 
	filters: Record<string, any> = {}, 
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.DATACENTERS.LIST,
		page,
		perPage,
		filters,
		searchCriteria,
		"datacenters"
	);
}

// Rack management functions
export async function getRacksByDatacenter(datacenter_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.BY_DATACENTER(datacenter_id));
			return result?.data || [];
		},
		[],
		`Failed to fetch racks for datacenter ${datacenter_id}:`
	);
}

export async function getRackById(rack_id: number) {
	return getEntityById(API_ENDPOINTS.DATACENTERS.RACKS.BY_ID, rack_id, "rack");
}

export async function getRackWithPositions(rack_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.WITH_POSITIONS(rack_id));
			return result?.data || null;
		},
		null,
		`Failed to fetch rack ${rack_id} with positions:`
	);
}

export async function getRackUtilization(rack_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.UTILIZATION(rack_id));
			return result?.data || {};
		},
		{},
		`Failed to fetch rack ${rack_id} utilization:`
	);
}

export async function createRack(datacenter_id: number, rackData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.CREATE(datacenter_id), {
				method: 'POST',
				body: rackData
			});
			return result;
		},
		null,
		"Failed to create rack:"
	);
}

export async function updateRack(rack_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.UPDATE(rack_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null,
		"Failed to update rack:"
	);
}

export async function deleteRack(rack_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.DELETE(rack_id), {
				method: 'DELETE'
			});
			return result;
		},
		null,
		"Failed to delete rack:"
	);
}

// Position management functions
export async function getPositionsByRack(rack_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.POSITIONS.BY_RACK(rack_id));
			return result?.data || [];
		},
		[],
		`Failed to fetch positions for rack ${rack_id}:`
	);
}

export async function getPositionById(position_id: number) {
	return getEntityById(API_ENDPOINTS.DATACENTERS.RACKS.POSITIONS.BY_ID, position_id, "position");
}

export async function createPosition(rack_id: number, positionData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.POSITIONS.CREATE(rack_id), {
				method: 'POST',
				body: positionData
			});
			return result;
		},
		null,
		"Failed to create position:"
	);
}

export async function updatePosition(position_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.POSITIONS.UPDATE(position_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null,
		"Failed to update position:"
	);
}

export async function deletePosition(position_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.DATACENTERS.RACKS.POSITIONS.DELETE(position_id), {
				method: 'DELETE'
			});
			return result;
		},
		null,
		"Failed to delete position:"
	);
}
