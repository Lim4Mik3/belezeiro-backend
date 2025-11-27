import { IInvoiceRepository } from "@core/contracts/repositories/i-invoice-repository";
import { DynamoInvoiceRepository } from "@infra/implementations/repositories/dynamo-invoice-repository";

export function makeInvoiceRepository(): IInvoiceRepository {
  return new DynamoInvoiceRepository();
}
