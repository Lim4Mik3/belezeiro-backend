import { IDGeneratorService } from "packages/_core_/domain/services/id-generator";

import { ulid } from "ulidx"

const IDPrefixRegex = /[^a-zA-Z]/g

export class ULIDIDGeneratorService implements IDGeneratorService {
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

