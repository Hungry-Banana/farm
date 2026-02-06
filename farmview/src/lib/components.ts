import { apiRequest, API_ENDPOINTS, safeApiCall, getEntityById } from './api';

/**
 * Component API functions - standardized patterns using shared utilities from api.ts
 * - getComponentCatalog(): Get complete component catalog with all types
 * - getComponentStats(): Get component catalog statistics
 * - getComponentsByType(): Get specific component types with pagination
 */

export async function getComponentCatalog() {
	return safeApiCall(
		async () => {
			const result = await apiRequest(API_ENDPOINTS.COMPONENTS.CATALOG);
			return result?.data || {};
		},
		{}, // fallback value
		"Failed to fetch component catalog:"
	);
}