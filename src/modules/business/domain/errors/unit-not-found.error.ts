import { DomainError } from "./domain-error";

export class UnitNotFoundError extends DomainError {
  constructor() {
    super("Unit not found");
  }

  get statusCode(): number {
    return 404;
  }
}
