/**
 * User Authorization Snapshot
 * Represents a cached view of user's permissions and ownership
 */
export interface IAuthzSnapshot {
  id: string;
  roles: string[];

  permissions: {
    globals: string[];

    business: Record<string, string[]>;

    unit: Record<string, string[]>;
  }

  isAdmin: boolean;

  own: {
    business: string[];
  };
}