import { DomainError } from "./domain-error";

export class BusinessNotFoundError extends DomainError {
  constructor() {
    super("Business not found");
  }

  get statusCode(): number {
    return 404;
  }
}
