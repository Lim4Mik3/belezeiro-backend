import { ULIDIDGeneratorService } from "@core/infra/services/ulid-id-generator.service";

export function MakeULIDIDGeneratorServiceFactory() {
  return new ULIDIDGeneratorService();
}