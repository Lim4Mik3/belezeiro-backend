export class PhotoURL {
  private constructor(private readonly _value: string | null) { }

  static isValid(url: string | null): boolean {
    // null is valid (user without photo)
    if (url === null) {
      return true
    }

    // Empty string is NOT valid
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return false
    }

    // Try to parse as URL
    try {
      const parsedUrl = new URL(url)

      // Only allow http and https protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false
      }

      // Must have a valid hostname
      if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  static create(value: string | null): PhotoURL {
    if (!PhotoURL.isValid(value)) {
      throw new Error(
        'Invalid photo URL format. Must be a valid HTTP/HTTPS URL or null.',
      )
    }

    return new PhotoURL(value)
  }

  get value(): string | null {
    return this._value
  }

  equals(other: PhotoURL): boolean {
    return this._value === other._value
  }

  isNull(): boolean {
    return this._value === null
  }
}
