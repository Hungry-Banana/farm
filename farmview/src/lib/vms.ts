import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById, paginatedApiCall } from './api';
import { type SearchCriteria } from '@/types/search';

export async function getVMs() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.VMS.LIST);
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch VMs:"
	);
}

export async function getVMById(vm_id: number) {
	return getEntityById(API_ENDPOINTS.VMS.BY_ID, vm_id, "VM");
}

export async function getVMsByServer(server_id: number) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.VMS.BY_SERVER(server_id));
			return result?.data || [];
		},
		[], // fallback value
		"Failed to fetch VMs for server:"
	);
}

export async function updateVM(vm_id: number, updateData: Record<string, any>) {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.VMS.UPDATE(vm_id), {
				method: 'PUT',
				body: updateData
			});
			return result;
		},
		null, // fallback value
		"Failed to update VM:"
	);
}

export async function getVMOverview() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.VMS.OVERVIEW);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch VM overview:"
	);
}

// New function for paginated VMs (used by TableComponent)
export async function getVMsPaginated(
	page = 1, 
	perPage = 15, 
	filters: Record<string, any> = {}, 
	searchCriteria: SearchCriteria[] = []
) {
	return paginatedApiCall(
		API_ENDPOINTS.VMS.LIST,
		page,
		perPage,
		filters,
		searchCriteria,
		"VMs"
	);
}
