import { IIDGeneratorService } from "@core/contracts/services/i-id-generator";
import { ULIDXIDGeneratorService } from "@infra/implementations/services/ulidx-id-generator-service";

export function makeIDGeneratorService(): IIDGeneratorService {
  return new ULIDXIDGeneratorService();
}
