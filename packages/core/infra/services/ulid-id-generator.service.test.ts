import { describe, it, expect, beforeEach } from 'bun:test'
import { ULIDIDGeneratorService } from './ulid-id-generator.service'

describe('ULIDIDGeneratorService', () => {
  let service: ULIDIDGeneratorService

  beforeEach(() => {
    service = new ULIDIDGeneratorService()
  })

  describe('generate', () => {
    it('should generate a valid ID with lowercase prefix', () => {
      const id = service.generate('user')

      expect(id).toStartWith('user_')
      expect(id.length).toBe(31) // 'user_' (5 chars) + ULID (26 chars)
    })

    it('should convert uppercase prefix to lowercase', () => {
      const id = service.generate('USER')

      expect(id).toStartWith('user_')
      expect(id.length).toBe(31)
    })

    it('should remove non-alphabetic characters from prefix', () => {
      const id = service.generate('user123-test_456')

      expect(id).toStartWith('usertest_')
      expect(id.length).toBe(35) // 'usertest_' (9 chars) + ULID (26 chars)
    })

    it('should handle prefix with mixed case and special characters', () => {
      const id = service.generate('User@123-Test!')

      expect(id).toStartWith('usertest_')
    })

    it('should generate unique IDs for the same prefix', () => {
      const id1 = service.generate('user')
      const id2 = service.generate('user')

      expect(id1).not.toBe(id2)
      expect(id1).toStartWith('user_')
      expect(id2).toStartWith('user_')
    })

    it('should throw error when prefix is empty string', () => {
      expect(() => service.generate('')).toThrow('Prefix cannot be empty')
    })

    it('should throw error when prefix is whitespace only', () => {
      expect(() => service.generate('   ')).toThrow('Prefix cannot be empty')
    })

    it('should throw error when prefix contains only numbers and special characters', () => {
      expect(() => service.generate('123-456')).toThrow(
        'Prefix must contain at least one letter'
      )
    })

    it('should throw error when prefix contains only special characters', () => {
      expect(() => service.generate('!@#$%')).toThrow(
        'Prefix must contain at least one letter'
      )
    })

    it('should generate valid ULID format in the ID', () => {
      const id = service.generate('test')
      const ulidPart = id.split('_')[1]

      // ULID should be 26 characters long
      expect(ulidPart.length).toBe(26)

      // ULID should contain only valid characters (Crockford's Base32)
      expect(ulidPart).toMatch(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/)
    })

    it('should handle single letter prefix', () => {
      const id = service.generate('a')

      expect(id).toStartWith('a_')
      expect(id.length).toBe(28) // 'a_' (2 chars) + ULID (26 chars)
    })

    it('should handle long prefix', () => {
      const prefix = 'verylongprefixfortest'
      const id = service.generate(prefix)

      expect(id).toStartWith(prefix + '_')
      expect(id.length).toBe(prefix.length + 1 + 26)
    })

    it('should generate chronologically sortable IDs', async () => {
      const id1 = service.generate('user')

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2))

      const id2 = service.generate('user')

      const ulid1 = id1.split('_')[1]
      const ulid2 = id2.split('_')[1]

      // ULIDs should be sortable (second one should be greater or equal)
      expect(ulid2 >= ulid1).toBe(true)
    })

    it('should maintain prefix integrity with spaces', () => {
      const id = service.generate('user profile')

      expect(id).toStartWith('userprofile_')
    })

    it('should handle prefix with numbers at the end', () => {
      const id = service.generate('user123')

      expect(id).toStartWith('user_')
    })

    it('should handle prefix with numbers in the middle', () => {
      const id = service.generate('user123test')

      expect(id).toStartWith('usertest_')
    })

    it('should generate IDs that can be used as database keys', () => {
      const ids = new Set<string>()
      const count = 1000

      for (let i = 0; i < count; i++) {
        const id = service.generate('test')
        ids.add(id)
      }

      // All IDs should be unique
      expect(ids.size).toBe(count)
    })
  })
})
