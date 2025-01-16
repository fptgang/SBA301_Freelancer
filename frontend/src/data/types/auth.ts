import { Account } from "./account";

export default interface Auth {
  token: string;
  refreshToken: string;
  email: string;
  accountResponseDTO: Account;
}
