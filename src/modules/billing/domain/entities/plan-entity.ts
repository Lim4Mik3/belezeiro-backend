import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";

type Feature = {
  id: string;
  name: string;
  description?: string;
};

type Props = {
  name: string;
  description?: string;
  price: number;
  currency: string;
  features?: Feature[];
  active: boolean;
};

type CreationProps = Partial<BaseEntityProps> & {
  name: string;
  description?: string;
  price: number;
  currency: string;
  features?: Feature[];
  active?: boolean;
};

export type PlanEntityProps = BaseEntityProps & Props;

export class PlanEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "pln";
  }

  constructor(props: CreationProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Name is required");
    }

    if (props.price < 0) {
      throw new Error("Price must be greater than or equal to 0");
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error("Currency is required");
    }

    super({
      ...props,
      name: props.name.trim(),
      description: props.description?.trim(),
      price: props.price,
      currency: props.currency.toUpperCase(),
      features: props.features ?? [],
      active: props.active ?? true,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  get currency(): string {
    return this.props.currency;
  }

  get features(): Feature[] | undefined {
    return this.props.features;
  }

  get active(): boolean {
    return this.props.active;
  }

  updateName(name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error("Name is required");
    }
    this.props.name = name.trim();
    this.touch();
  }

  updatePrice(price: number) {
    if (price < 0) {
      throw new Error("Price must be greater than or equal to 0");
    }
    this.props.price = price;
    this.touch();
  }

  updateDescription(description?: string) {
    this.props.description = description?.trim();
    this.touch();
  }

  updateFeatures(features: Feature[]) {
    this.props.features = features;
    this.touch();
  }

  activate() {
    this.props.active = true;
    this.touch();
  }

  deactivate() {
    this.props.active = false;
    this.touch();
  }
}
