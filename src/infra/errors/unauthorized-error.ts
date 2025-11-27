export class UnauthorizedError extends Error {
  public status = 401;

  constructor(message = "") {
    super(message || "You're not authorized to continue.");
  }
}