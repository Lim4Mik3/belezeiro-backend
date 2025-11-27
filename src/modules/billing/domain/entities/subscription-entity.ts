import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";

type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
type BillingCycle = 'monthly' | 'yearly';

type Props = {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
};

type CreationProps = Partial<BaseEntityProps> & {
  userId: string;
  planId: string;
  status?: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate?: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  autoRenew?: boolean;
};

export type SubscriptionEntityProps = BaseEntityProps & Props;

export class SubscriptionEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "sub";
  }

  constructor(props: CreationProps) {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!props.planId || props.planId.trim().length === 0) {
      throw new Error("Plan ID is required");
    }

    if (!props.billingCycle) {
      throw new Error("Billing cycle is required");
    }

    const startDate = props.startDate ?? new Date();
    const nextBillingDate = props.nextBillingDate ?? SubscriptionEntity.calculateNextBillingDate(startDate, props.billingCycle);

    super({
      ...props,
      userId: props.userId,
      planId: props.planId,
      status: props.status ?? 'active',
      billingCycle: props.billingCycle,
      startDate,
      endDate: props.endDate,
      nextBillingDate,
      autoRenew: props.autoRenew ?? true,
    });
  }

  private static calculateNextBillingDate(startDate: Date, billingCycle: BillingCycle): Date {
    const date = new Date(startDate);
    if (billingCycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }

  get userId(): string {
    return this.props.userId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get billingCycle(): BillingCycle {
    return this.props.billingCycle;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get nextBillingDate(): Date {
    return this.props.nextBillingDate;
  }

  get autoRenew(): boolean {
    return this.props.autoRenew;
  }

  activate() {
    this.props.status = 'active';
    this.touch();
  }

  pause() {
    this.props.status = 'paused';
    this.touch();
  }

  cancel() {
    this.props.status = 'cancelled';
    this.props.endDate = new Date();
    this.touch();
  }

  expire() {
    this.props.status = 'expired';
    this.touch();
  }

  renew() {
    this.props.nextBillingDate = SubscriptionEntity.calculateNextBillingDate(
      this.props.nextBillingDate,
      this.props.billingCycle
    );
    this.touch();
  }

  enableAutoRenew() {
    this.props.autoRenew = true;
    this.touch();
  }

  disableAutoRenew() {
    this.props.autoRenew = false;
    this.touch();
  }

  updatePlan(planId: string) {
    if (!planId || planId.trim().length === 0) {
      throw new Error("Plan ID is required");
    }
    this.props.planId = planId;
    this.touch();
  }
}
