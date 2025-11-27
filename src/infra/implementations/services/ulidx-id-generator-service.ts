import { ulid } from "ulidx"

import { IIDGeneratorService } from "@core/contracts/services/i-id-generator";

const IDPrefixRegex = /[^a-zA-Z]/g

export class ULIDXIDGeneratorService implements IIDGeneratorService {
  generate(prefix: string): string {
    if (!prefix || prefix.trim().length === 0) {
      throw new Error('Prefix cannot be empty')
    }

    const cleanPrefix = prefix.replace(IDPrefixRegex, '').toLowerCase()

    if (cleanPrefix.length === 0) {
      throw new Error('Prefix must contain at least one letter')
    }

    return cleanPrefix + '_' + ulid()
  }
}