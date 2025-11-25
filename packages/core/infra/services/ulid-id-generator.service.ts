import { IDGeneratorService } from "@core/domain/services/id-generator";
import { IDPrefixRegex } from "@core/validation/id-prefix.regex";

import { ulid } from "ulidx"

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

