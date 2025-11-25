/**
 * Centralized registry of all domain events
 *
 * Benefits:
 * - Autocomplete in IDE
 * - Type-safe event types
 * - Living documentation
 * - Explicit versioning
 * - Prevents name duplication
 *
 * Naming convention: <bounded-context>.<aggregate>.<action>.v<version>
 */
export const DOMAIN_EVENTS = {
  /**
   * IAM (Identity and Access Management) Context
   */
  IAM: {
    USER_AUTHENTICATED: "iam.user.authenticated.v1",
    USER_REGISTERED: "iam.user.registered.v1",
    USER_UPDATED: "iam.user.updated.v1",
    USER_DELETED: "iam.user.deleted.v1",
    PASSWORD_RESET_REQUESTED: "iam.user.password-reset-requested.v1",
    PASSWORD_CHANGED: "iam.user.password-changed.v1",
    EMAIL_VERIFIED: "iam.user.email-verified.v1",
  },

  /**
   * Add more bounded contexts here as your system grows
   *
   * Example:
   * ORDERS: {
   *   ORDER_CREATED: "orders.order.created.v1",
   *   ORDER_CONFIRMED: "orders.order.confirmed.v1",
   *   ORDER_CANCELLED: "orders.order.cancelled.v1",
   * },
   *
   * APPOINTMENTS: {
   *   APPOINTMENT_SCHEDULED: "appointments.appointment.scheduled.v1",
   *   APPOINTMENT_CONFIRMED: "appointments.appointment.confirmed.v1",
   *   APPOINTMENT_CANCELLED: "appointments.appointment.cancelled.v1",
   * }
   */
} as const;

/**
 * Type helper to extract all event types
 */
export type DomainEventType = typeof DOMAIN_EVENTS[keyof typeof DOMAIN_EVENTS][keyof typeof DOMAIN_EVENTS[keyof typeof DOMAIN_EVENTS]];

/**
 * Event sources (bounded contexts)
 */
export const EVENT_SOURCES = {
  IAM: "iam-service",
  // Add more as needed
} as const;

export type EventSource = typeof EVENT_SOURCES[keyof typeof EVENT_SOURCES];
