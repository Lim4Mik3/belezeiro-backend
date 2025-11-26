import { BaseEntity, BaseEntityProps } from "@core/domain/entities/base-entity";
import { Email } from "../vo/email";
import { PhotoURL } from "../vo/photo_url";
import { UserAuthenticatedEvent } from "../events/user-authenticate";
import { UserRegisteredEvent } from "../events/user-registered";

type Props = {
  provider_id: string;
  name: string;
  email: Email;
  photo_url: PhotoURL;
}

type CreationProps = Partial<BaseEntityProps> & {
  provider_id: string;
  name: string;
  email: string;
  photo_url: string | null;
};

export type UserEntityProps = BaseEntityProps & Props;

export class UserEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return "usr";
  }

  constructor(props: CreationProps) {
    const isNewUser = !props.createdAt && !props.id;

    super({
      ...props,
      email: Email.create(props.email),
      photo_url: PhotoURL.create(props.photo_url)
    });

    if (isNewUser) {
      this.addDomainEvent(new UserRegisteredEvent({ userId: this.id, occured_at: new Date() }));
    }
  }

  authenticated(isNewUser: boolean, provider?: string) {
    this.addDomainEvent(
      new UserAuthenticatedEvent({
        userId: this.id,
        email: this.email.value,
        isNewUser,
        provider,
        authenticatedAt: new Date()
      })
    );
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get provider_id() {
    return this.props.provider_id;
  }

  get photo_url() {
    return this.props.photo_url;
  }
};