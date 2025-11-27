import { IDomainEvent } from "@core/contracts/event-bus/i-event-bus";
import { IIDGeneratorService } from "@core/contracts/services/i-id-generator";

export type BaseEntityProps = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseEntityConfig = {
  IDGenerator: IIDGeneratorService;
};

export abstract class BaseEntity<TExtraProps extends object = {}> {
  private events: IDomainEvent[] = [];
  private static config: BaseEntityConfig;
  private IDGeneratorService: IIDGeneratorService;
  protected readonly props: BaseEntityProps & TExtraProps;

  static configure(config: BaseEntityConfig): void {
    BaseEntity.config = config;
  }

  constructor(
    props: Partial<BaseEntityProps> & TExtraProps,
    IDGeneratorService?: IIDGeneratorService,
  ) {
    if (!IDGeneratorService && !BaseEntity.config) {
      throw new Error("IDGeneratorService must be provided either in constructor or via BaseEntity.configure()");
    }

    this.IDGeneratorService = IDGeneratorService || BaseEntity.config.IDGenerator;

    const base: BaseEntityProps = {
      id: props.id ?? "",
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };

    this.props = {
      ...props,
      ...base,
    } as BaseEntityProps & TExtraProps;

    this.finalize();
  }

  protected abstract prefix(): string;

  private finalize() {
    if (!this.props.id) {
      this.props.id = this.IDGeneratorService.generate(this.prefix());
    }
  }

  protected addDomainEvent(event: IDomainEvent): void {
    this.events.push(event);
  }

  public getDomainEvents(): IDomainEvent[] {
    return this.events;
  }

  public clearDomainEvents(): void {
    this.events = [];
  }

  touch() {
    this.props.updatedAt = new Date();
  }

  get id() {
    return this.props.id;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
};