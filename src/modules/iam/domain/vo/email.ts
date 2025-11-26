const EmailValidateRegex =
	/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/

export class Email {
	private constructor(private readonly _value: string) { }

	static isValid(email: string) {
		if (!email || typeof email !== 'string') {
			return false
		}

		// Check length constraints
		if (email.length > 254) {
			return false // RFC 5321: max email length is 254 characters
		}

		const [local, domain] = email.split('@')

		if (!local || !domain) {
			return false
		}

		// Local part max length is 64 characters
		if (local.length > 64) {
			return false
		}

		// Domain max length is 255 characters
		if (domain.length > 255) {
			return false
		}

		return EmailValidateRegex.test(email)
	}

	static create(value: string): Email {
		if (!Email.isValid(value)) {
			throw new Error('Invalid e-mail format.')
		}

		return new Email(value.toLowerCase())
	}

	get value(): string {
		return this._value
	}

	equals(other: Email): boolean {
		return this._value === other._value
	}
}
