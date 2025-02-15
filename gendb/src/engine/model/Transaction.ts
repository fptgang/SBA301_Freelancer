import {TransactionStatus} from "./TransactionStatus.js";
import {TransactionType} from "./TransactionType.js";

export class Transaction {
  constructor(
    public transactionId: number,
    public amount: number,
    public createdAt: Date,
    public status: TransactionStatus,
    public type: TransactionType,
    public fromAccountId: number,
    public toAccountId: number
  ) {
  }

  static dump(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';

    const fields = [
      'transaction_id',
      'amount',
      'created_at',
      'status',
      'type',
      'from_account_id',
      'to_account_id'
    ];

    const values = transactions.map(t => {
      return `(${[
        t.transactionId,
        t.amount.toFixed(2), // Format decimal with 2 decimal places
        `'${t.createdAt.toISOString().slice(0, 19).replace('T', ' ')}.000000'`, // Format datetime(6)
        `'${t.status}'`,
        `'${t.type}'`,
        t.fromAccountId,
        t.toAccountId
      ].join(', ')})`;
    });

    return `INSERT INTO \`hirable\`.\`transactions\`
(${fields.map(f => `\`${f}\``).join(',\n')})
VALUES
${values.join(',\n')};`;
  }
}