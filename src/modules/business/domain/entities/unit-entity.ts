import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";

type Props = {
  name: string;
  business_id: string;
}

type CreationProps = Partial<BaseEntityProps> & Props;

export type UnitEntityProps = BaseEntityProps & Props;

export class UnitEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "unt";
  }

  constructor(props: CreationProps) {
    // Validações
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Name is required");
    }

    if (props.name.trim().length < 2) {
      throw new Error("Name must have at least 2 characters");
    }

    if (props.name.trim().length > 100) {
      throw new Error("Name must not exceed 100 characters");
    }

    if (!props.business_id || props.business_id.trim().length === 0) {
      throw new Error("Business ID is required");
    }

    super({
      ...props,
      name: props.name.trim(),
      business_id: props.business_id.trim(),
    });
  }

  get name(): string {
    return this.props.name;
  }

  get businessId(): string {
    return this.props.business_id;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Name is required");
    }

    if (name.trim().length < 2) {
      throw new Error("Name must have at least 2 characters");
    }

    if (name.trim().length > 100) {
      throw new Error("Name must not exceed 100 characters");
    }

    this.props.name = name.trim();
  }
}
