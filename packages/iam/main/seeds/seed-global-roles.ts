import type { IRoleDefinitionRepository } from '@core/app/contracts/repositories/i-role-definition-repository'
import type { IDGeneratorService } from '@core/domain/services/id-generator'
import {
	RoleDefinitionEntity,
	ROLE_SCOPE_GLOBAL,
} from '@iam/domain/entities/role-definition-entity'
import { PERMISSIONS } from '@iam/domain/permissions/permission-registry'
import { ROLES_REGISTRY } from '@iam/domain/roles/roles-registry'

const GLOBAL_ROLES = {
	CUSTOMER: {
		name: ROLES_REGISTRY.CUSTOMER,
		description: 'Cliente da plataforma com permissões básicas',
		permissions: [
			PERMISSIONS.USERS.READ_OWN,
			PERMISSIONS.BUSINESS.LIST,
			// PERMISSIONS.BUSINESS.CREATE,
		] as string[],
	},
	BUSINESS_OWNER: {
		name: ROLES_REGISTRY.BUSINESS_OWNER,
		description: 'Dono de negócio com permissões de gestão completa',
		permissions: [] as string[],
	},
}

export const seedGlobalRoles = async (
	roleDefinitionRepository: IRoleDefinitionRepository,
	idGenerator: IDGeneratorService,
) => {
	console.log('\n🌱 Iniciando seed de roles globais...\n')

	// Criar ou atualizar cada role
	for (const role of Object.values(GLOBAL_ROLES)) {
		try {
			const existingRole =
				await roleDefinitionRepository.findGlobalRoleByName(role.name)

			if (existingRole) {
				// Role existe, atualizar permissões
				existingRole.updatePermissions(role.permissions)
				await roleDefinitionRepository.update(existingRole)

				console.log(
					`✓ Role '${role.name}' atualizada com ${role.permissions.length} permissões`,
				)
			} else {
				// Role não existe, criar
				const roleEntity = new RoleDefinitionEntity({
					id: idGenerator.generate('rdef'),
					name: role.name,
					scope: ROLE_SCOPE_GLOBAL,
					description: role.description,
					permissions: role.permissions,
					created_by: null,
					business_id: null,
				})

				await roleDefinitionRepository.create(roleEntity)

				console.log(
					`✓ Role '${role.name}' criada com ${role.permissions.length} permissões`,
				)
			}
		} catch (error) {
			console.error(`✗ Erro ao processar role '${role.name}':`, error)
		}
	}

	console.log('\n✅ Seed de roles globais concluído com sucesso!\n')
}
