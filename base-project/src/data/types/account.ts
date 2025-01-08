export interface Account {
  accountId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}
