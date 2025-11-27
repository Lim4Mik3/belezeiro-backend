import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";

type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'overdue';

type Props = {
  subscriptionId: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  status: InvoiceStatus;
  description?: string;
};

type CreationProps = Partial<BaseEntityProps> & {
  subscriptionId: string;
  amount: number;
  currency: string;
  issuedAt?: Date;
  dueDate: Date;
  paidAt?: Date;
  status?: InvoiceStatus;
  description?: string;
};

export type InvoiceEntityProps = BaseEntityProps & Props;

export class InvoiceEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "inv";
  }

  constructor(props: CreationProps) {
    if (!props.subscriptionId || props.subscriptionId.trim().length === 0) {
      throw new Error("Subscription ID is required");
    }

    if (props.amount < 0) {
      throw new Error("Amount must be greater than or equal to 0");
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error("Currency is required");
    }

    if (!props.dueDate) {
      throw new Error("Due date is required");
    }

    super({
      ...props,
      subscriptionId: props.subscriptionId,
      amount: props.amount,
      currency: props.currency.toUpperCase(),
      issuedAt: props.issuedAt ?? new Date(),
      dueDate: props.dueDate,
      paidAt: props.paidAt,
      status: props.status ?? 'pending',
      description: props.description?.trim(),
    });
  }

  get subscriptionId(): string {
    return this.props.subscriptionId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  markAsPaid() {
    this.props.status = 'paid';
    this.props.paidAt = new Date();
    this.touch();
  }

  markAsFailed() {
    this.props.status = 'failed';
    this.touch();
  }

  markAsOverdue() {
    this.props.status = 'overdue';
    this.touch();
  }

  updateDescription(description?: string) {
    this.props.description = description?.trim();
    this.touch();
  }

  isOverdue(): boolean {
    return this.props.status === 'pending' && new Date() > this.props.dueDate;
  }

  isPaid(): boolean {
    return this.props.status === 'paid';
  }
}
