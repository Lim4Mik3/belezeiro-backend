import { BaseEntity, BaseEntityProps } from "packages/_core_/domain/entities/base-entity"

type Props = {
  userId: string
  roleId: string
  targetId: string | null // null = is global
  assignedAt: Date
  expiresAt: Date | null // null = never expires
}

type CreationProps = Partial<BaseEntityProps> & Props;

export class RoleAssignmentEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "rasgn";
  }

  constructor(props: CreationProps) {
    super(props);
  }

  get userId(): string {
    return this.props.userId
  }

  get roleId(): string {
    return this.props.roleId
  }

  get targetId(): string | null {
    return this.props.targetId
  }

  get assignedAt(): Date {
    return this.props.assignedAt
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt
  }

  isExpired(): boolean {
    if (this.props.expiresAt === null) {
      return false // Never expires
    }
    return new Date() > this.props.expiresAt
  }

  isActive(): boolean {
    return !this.isExpired()
  }

  isPermanent(): boolean {
    return this.props.expiresAt === null
  }

  isTemporary(): boolean {
    return this.props.expiresAt !== null
  }

  daysUntilExpiration(): number | null {
    if (this.props.expiresAt === null) {
      return null // Never expires
    }

    const now = new Date()
    const diff = this.props.expiresAt.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  extendExpiration(new_expiration: Date | null): void {
    this.props.expiresAt = new_expiration
    this.touch()
  }

  makePermanent(): void {
    this.props.expiresAt = null
    this.touch()
  }
}

export namespace RoleAssignmentEntity {
  export type CreateInput = {
    id: string
    user_id: string
    role_id: string
    target_id?: string | null
    assigned_at?: Date
    expires_at?: Date | null
  }
}
