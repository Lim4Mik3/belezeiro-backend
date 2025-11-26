import { BaseEntity, BaseEntityProps } from "packages/_core_/domain/entities/base-entity";
import { UnitEntity } from "./unit-entity";
import { CannotDeleteLastUnitError, UnitNotFoundError } from "../errors";
import { BusinessCreatedEvent } from "../events/business-created";

type Props = {
  name: string;
  units: UnitEntity[];
}

type CreationProps = Partial<BaseEntityProps> & {
  name: string;
  units: UnitEntity[];
  createdByUserId: string;
};

export type BusinessEntityProps = BaseEntityProps & Props;

export class BusinessEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "bsn";
  }

  constructor(props: CreationProps) {
    const isNewBusiness = !props.createdAt && !props.id;

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

    if (isNewBusiness) {
      this.addDomainEvent(new BusinessCreatedEvent({
        businessId: this.id,
        userId: props.createdByUserId
      }));
    }
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

  updateUnit(unitId: string, name: string) {
    const unit = this.units.find(u => u.id === unitId);
    if (!unit) {
      throw new UnitNotFoundError();
    }
    unit.updateName(name);
  }

  deleteUnit(unitId: string) {
    if (this.units.length === 1) {
      throw new CannotDeleteLastUnitError();
    }

    const unitIndex = this.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) {
      throw new UnitNotFoundError();
    }
    this.units.splice(unitIndex, 1);
  }

  updateName(name: string) {
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
