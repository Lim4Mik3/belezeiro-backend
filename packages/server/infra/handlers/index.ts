import { EventHandler } from "../queue/redis-queue-processor";
import { BusinessCreatedHandler } from "./business-created.handler";
import { UserAuthenticatedHandler } from "./user-authenticated.handler";
import { UserRegisteredHandler } from "./user-registered.handler";

/**
 * Registro centralizado de todos os handlers de eventos
 *
 * Adicione novos handlers aqui para que sejam automaticamente
 * registrados no queue processor
 */
export function getAllHandlers(): EventHandler[] {
  return [
    new UserAuthenticatedHandler(),
    new UserRegisteredHandler(),
    new BusinessCreatedHandler()
  ];
}
