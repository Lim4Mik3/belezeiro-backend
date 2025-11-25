import { EventHandler } from "../queue/redis-queue-processor";
import { UserAuthenticatedHandler } from "./user-authenticated.handler";

/**
 * Registro centralizado de todos os handlers de eventos
 *
 * Adicione novos handlers aqui para que sejam automaticamente
 * registrados no queue processor
 */
export function getAllHandlers(): EventHandler[] {
  return [
    new UserAuthenticatedHandler(),
    // Adicione mais handlers aqui conforme necessário
    // new OrderCreatedHandler(),
    // new AppointmentScheduledHandler(),
  ];
}
