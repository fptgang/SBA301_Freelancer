import {TransactionStatus} from "./TransactionStatus.js";
import {TransactionType} from "./TransactionType.js";
import {PaymentMethod} from "./PaymentMethod";
import {escapeSingleQuotes} from "../utils";

export class Transaction {
  constructor(
    public transactionId: number,
    public amount: number,
    public createdAt: Date,
    public updatedAt: Date,
    public paymentMethod: PaymentMethod,
    public status: TransactionStatus,
    public type: TransactionType,
    public milestoneId: number | undefined,
    public fromAccountId: number | undefined,
    public toAccountId: number | undefined,
  ) {
  }

  static dump(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';

    const fields = [
      'transaction_id',
      'amount',
      'created_at',
      'updated_at',
      'payment_method',
      'status',
      'type',
      'milestone_id',
      'from_account_id',
      'to_account_id'
    ];

    const values = transactions.map(t => {
      return `(${[
        t.transactionId,
        t.amount.toFixed(2), // Format decimal with 2 decimal places
        `'${t.createdAt.toISOString().slice(0, 19).replace('T', ' ')}.000000'`, // Format datetime(6)
        `'${t.updatedAt.toISOString().slice(0, 19).replace('T', ' ')}.000000'`, // Format datetime(6)
        t.paymentMethod ? `'${escapeSingleQuotes(t.paymentMethod)}'` : 'NULL',
        `'${t.status}'`,
        `'${t.type}'`,
        t.milestoneId ?? 'NULL',
        t.fromAccountId ?? 'NULL',
        t.toAccountId ?? 'NULL'
      ].join(', ')})`;
    });

    return `INSERT INTO \`hirable\`.\`transactions\`
(${fields.map(f => `\`${f}\``).join(',\n')})
VALUES
${values.join(',\n')};`;
  }
}