import { DomainError } from "./domain-error";

export class CannotDeleteLastUnitError extends DomainError {
  constructor() {
    super("Must have at least one unit per business, we cannot delete this unit, it is the main and only unit inside this business.");
  }

  get statusCode(): number {
    return 400;
  }
}
