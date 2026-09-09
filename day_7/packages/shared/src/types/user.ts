export type Role = 'admin' | 'agent' | 'buyer_renter';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

/** Returned to clients — password_hash is omitted */
export type PublicUser = Omit<User, 'password_hash'>;
