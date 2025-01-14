import { Account } from "./Account";

export interface Auth {
  token: string;
  refreshToken: string;
  email: string;
  accountResponseDTO: Account;
}
