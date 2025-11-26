/**
 * Roles Registry
 *
 * Define os nomes padronizados de roles no sistema.
 * Estes são usados como referência para criar role definitions.
 */
export const ROLES_REGISTRY = {
	CUSTOMER: 'Customer',
	BUSINESS_OWNER: 'Business Owner',
} as const

export type RoleName = (typeof ROLES_REGISTRY)[keyof typeof ROLES_REGISTRY]
