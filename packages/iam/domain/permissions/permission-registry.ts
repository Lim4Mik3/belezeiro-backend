export const PERMISSIONS = {
	USERS: {
		READ_OWN: 'users.read_own',
		UPDATE_OWN: 'users.update_own',
		DELETE_OWN: 'users.delete_own',
	},
	BUSINESS: {
		CREATE: 'business.create', // CREATE doesn't need _own suffix
		READ_OWN: 'business.read_own',
		UPDATE_OWN: 'business.update_own',
		DELETE_OWN: 'business.delete_own',
		LIST: 'business.list', // LIST all businesses (admin/manager)
		LIST_OWN: 'business.list_own', // LIST only owned businesses
	},
	UNITS: {
		CREATE: 'units.create', // CREATE doesn't need _own suffix
		READ: 'units.read', // READ any unit (admin/manager)
		READ_OWN: 'units.read_own', // READ only owned units
		UPDATE: 'units.update', // UPDATE any unit (admin/manager)
		UPDATE_OWN: 'units.update_own', // UPDATE only owned units
		DELETE: 'units.delete', // DELETE any unit (admin/manager)
		DELETE_OWN: 'units.delete_own', // DELETE only owned units
		LIST: 'units.list', // LIST all units (admin/manager)
		LIST_OWN: 'units.list_own', // LIST only owned units
	},
} as const

// Type helper para extrair todas as permissions
type PermissionGroups = typeof PERMISSIONS
type PermissionValues<T> = T extends Record<string, infer V> ? V : never
export type Permission = PermissionValues<
	PermissionGroups[keyof PermissionGroups]
>

// Helper function para obter todas as permissions como array
export const getAllPermissions = (): Permission[] => {
	return Object.values(PERMISSIONS).flatMap((group) =>
		Object.values(group),
	) as Permission[]
}

// Helper function para obter permissions agrupadas
export const getPermissionsByGroup = () => {
	return Object.entries(PERMISSIONS).map(([groupName, permissions]) => ({
		group: groupName,
		permissions: Object.values(permissions) as Permission[],
	}))
}
