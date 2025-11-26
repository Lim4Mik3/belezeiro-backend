/**
 * PermissionSet Value Object
 *
 * Represents a set of permissions for a role type.
 * Permissions are stored as an immutable set of permission strings.
 *
 * Common permissions examples:
 * - "users.read", "users.write", "users.delete"
 * - "business.manage", "business.read"
 * - "reports.view", "reports.export"
 */
export class PermissionSet {
	private readonly _permissions: ReadonlySet<string>

	private constructor(permissions: Set<string>) {
		this._permissions = new Set(permissions)
	}

	static create(permissions: string[]): PermissionSet {
		if (!permissions || !Array.isArray(permissions)) {
			throw new Error('Permissions must be an array')
		}

		// Remove empty strings and duplicates
		const cleanedPermissions = permissions
			.map((p) => p.trim())
			.filter((p) => p.length > 0)

		// Validate permission format (should be "resource.action")
		const invalidPermissions = cleanedPermissions.filter(
			(p) => !PermissionSet.isValidPermissionFormat(p),
		)
		if (invalidPermissions.length > 0) {
			throw new Error(
				`Invalid permission format: ${invalidPermissions.join(', ')}. Expected format: "resource.action"`,
			)
		}

		return new PermissionSet(new Set(cleanedPermissions))
	}

	static empty(): PermissionSet {
		return new PermissionSet(new Set())
	}

	private static isValidPermissionFormat(permission: string): boolean {
		// Wildcard permission (full access)
		if (permission === '*') {
			return true
		}
		// Permission format: resource.action (e.g., "users.read", "business.manage")
		const regex = /^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*$/i
		return regex.test(permission)
	}

	has(permission: string): boolean {
		return this._permissions.has(permission)
	}

	hasAll(permissions: string[]): boolean {
		return permissions.every((p) => this._permissions.has(p))
	}

	hasAny(permissions: string[]): boolean {
		return permissions.some((p) => this._permissions.has(p))
	}

	toArray(): string[] {
		return Array.from(this._permissions)
	}

	get size(): number {
		return this._permissions.size
	}

	isEmpty(): boolean {
		return this._permissions.size === 0
	}

	equals(other: PermissionSet): boolean {
		if (this._permissions.size !== other._permissions.size) {
			return false
		}

		for (const permission of this._permissions) {
			if (!other._permissions.has(permission)) {
				return false
			}
		}

		return true
	}

	/**
	 * Creates a new PermissionSet with additional permissions
	 */
	add(...permissions: string[]): PermissionSet {
		const newPermissions = new Set(this._permissions)
		permissions.forEach((p) => newPermissions.add(p))
		return new PermissionSet(newPermissions)
	}

	/**
	 * Creates a new PermissionSet without specified permissions
	 */
	remove(...permissions: string[]): PermissionSet {
		const newPermissions = new Set(this._permissions)
		permissions.forEach((p) => newPermissions.delete(p))
		return new PermissionSet(newPermissions)
	}
}
