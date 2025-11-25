import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";
import { UnitEntity } from "./unit-entity";

type Props = {
  name: string;
  units: UnitEntity[];
}

type CreationProps = Partial<BaseEntityProps> & {
  name: string;
  units: UnitEntity[];
};

export type BusinessEntityProps = BaseEntityProps & Props;

export class BusinessEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "bsn";
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

    super({
      ...props,
      name: props.name.trim(),
      units: props.units,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get units(): UnitEntity[] {
    return this.props.units;
  }

  createUnit(unit: UnitEntity) {
    this.units.push(unit);
  }
}
