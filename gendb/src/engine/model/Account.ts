import {escapeSingleQuotes} from "../utils.js";
import {AccountRole} from "./AccountRole.js";

export class Account {
  account_id: number;
  avatar_url: string | null;
  balance: number;
  created_at: Date;
  email: string;
  first_name: string;
  is_verified: boolean;
  is_visible: boolean;
  last_name: string | null;
  password: string | null;
  role: AccountRole;
  updated_at: Date | null;
  verified_at: Date | null;

  constructor(data: Partial<Account>) {
    this.account_id = data.account_id || 0;
    this.avatar_url = data.avatar_url || null;
    this.balance = data.balance || 0;
    this.created_at = data.created_at || new Date();
    this.email = data.email || '';
    this.first_name = data.first_name || '';
    this.is_verified = data.is_verified || false;
    this.is_visible = data.is_visible !== undefined ? data.is_visible : true;
    this.last_name = data.last_name || null;
    this.password = data.password || null;
    this.role = data.role || AccountRole.CLIENT;
    this.updated_at = data.updated_at || null;
    this.verified_at = data.verified_at || null;
  }

  static dump(accounts: Account[]): string {
    if (!accounts.length) return '';

    const fields = [
      'account_id',
      'avatar_url',
      'balance',
      'created_at',
      'email',
      'first_name',
      'is_verified',
      'is_visible',
      'last_name',
      'password',
      'role',
      'updated_at',
      'verified_at'
    ];
    const values = accounts.map(account => {
      return `(${[
        account.account_id,
        account.avatar_url ? `'${escapeSingleQuotes(account.avatar_url)}'` : 'NULL',
        account.balance.toFixed(2),
        account.created_at ? `'${account.created_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        `'${escapeSingleQuotes(account.email)}'`,
        `'${escapeSingleQuotes(account.first_name)}'`,
        account.is_verified ? 1 : 0,
        account.is_visible ? 1 : 0,
        account.last_name ? `'${escapeSingleQuotes(account.last_name)}'` : 'NULL',
        account.password ? `'${escapeSingleQuotes(account.password)}'` : 'NULL',
        `'${escapeSingleQuotes(account.role)}'`,
        account.updated_at ? `'${account.updated_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        account.verified_at ? `'${account.verified_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL'
      ].join(', ')})`;
    });

    return `INSERT INTO \`account\` (${fields.map(f => '`' + f + '`').join(', ')})
            VALUES ${values.join(',\n')};`;
  }
}