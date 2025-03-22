import {Transaction} from "../model/Transaction.js";
import {TransactionStatus} from "../model/TransactionStatus.js";
import {TransactionType} from "../model/TransactionType.js";
import {Account} from "../model/Account.js";
import {AccountPool, EscrowAccount} from "./account.js";
import {AccountRole} from "../model/AccountRole.js";
import {faker} from "@faker-js/faker";
import {depositAmount} from "../config.js";
import {SqlFileAppender} from "../appender.js";
import {PaymentMethod} from "../model/PaymentMethod";

export class transactionPool {
  private transactions: Transaction[] = [];
  private nextId: number = 1;

  pickTransaction(type: TransactionType, status: TransactionStatus, milestoneId: number | undefined | null = undefined):
    Transaction[] {
    return this.transactions.filter(t => {
      return t.type === type && t.status === status && (milestoneId === undefined || t.milestoneId === milestoneId);
    });
  }

  deposit(date: Date, account: Account, amount: number) {
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      date,
      faker.helpers.arrayElement([PaymentMethod.VNPAY]),
      TransactionStatus.SUCCESS,
      TransactionType.DEPOSIT,
      undefined,
      undefined,
      account.account_id
    );

    this.transactions.push(transaction);

    account.balance += amount;

    return transaction;
  }

  withdraw(date: Date, account: Account, amount: number) {
    if (account.balance < amount) {
      return null;
    }

    const status = this.getRandomStatus();
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      date,
      PaymentMethod.INTERNAL_WALLET,
      status,
      TransactionType.WITHDRAWAL,
      undefined,
      account.account_id,
      undefined
    );

    this.transactions.push(transaction);

    if (status === TransactionStatus.SUCCESS) {
      account.balance -= amount;
      account.updated_at = date;
    }

    return transaction;
  }

  depositEscrow(date: Date, account: Account, amount: number, milestoneId: number): Transaction | null {
    if (account.balance < amount) {
      this.deposit(date, account, amount);
    }

    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      date,
      PaymentMethod.INTERNAL_WALLET,
      TransactionStatus.SUCCESS,
      TransactionType.ESCROW_DEPOSIT,
      milestoneId,
      account.account_id,
      EscrowAccount.account_id
    );

    this.transactions.push(transaction);
    account.balance -= amount;
    account.updated_at = date;
    EscrowAccount.balance += amount;
    EscrowAccount.updated_at = date;

    return transaction;
  }

  releaseEscrow(date: Date, account: Account, amount: number, milestoneId: number): Transaction | null {
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      date,
      PaymentMethod.INTERNAL_WALLET,
      TransactionStatus.SUCCESS,
      TransactionType.ESCROW_RELEASE,
      milestoneId,
      EscrowAccount.account_id,
      account.account_id
    );

    this.transactions.push(transaction);
    EscrowAccount.balance -= amount;
    EscrowAccount.updated_at = date;
    account.balance += amount;
    account.updated_at = date;

    return transaction;
  }

  refundEscrow(date: Date, account: Account, amount: number, milestoneId: number): Transaction | null {
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      date,
      PaymentMethod.INTERNAL_WALLET,
      TransactionStatus.SUCCESS,
      TransactionType.ESCROW_REFUND,
      milestoneId,
      EscrowAccount.account_id,
      account.account_id
    );

    this.transactions.push(transaction);
    EscrowAccount.balance -= amount;
    EscrowAccount.updated_at = date;
    account.balance += amount;
    account.updated_at = date;

    return transaction;
  }

  dump(): string {
    return '\n' + Transaction.dump(this.transactions);
  }

  count(): number {
    return this.transactions.length;
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private getRandomStatus(successProbability: number = 0.9): TransactionStatus {
    return Math.random() < successProbability
      ? TransactionStatus.SUCCESS
      : TransactionStatus.FAILED;
  }
}

export let TransactionPool = new transactionPool();
export const ResetTransactionPool = () => TransactionPool = new transactionPool();
export const DumpTransactions = () => SqlFileAppender.append(TransactionPool.dump());


export const makeDeposit = (date: Date) => {
  const account = AccountPool.pickAccount(date, AccountRole.CLIENT, false);
  if (!account) {
    return false;
  }

  const amount = faker.number.int(depositAmount());
  TransactionPool.deposit(date, account, amount);
  return true;
}

export const requestWithdrawal = (date: Date) => {
  const account = AccountPool.pickAccount(date, AccountRole.FREELANCER, false);
  if (!account) {
    return false;
  }

  const minAmount = Math.floor(account.balance / 2);
  const maxAmount = account.balance;

  if (minAmount < 1) {
    return false;
  }

  const amount = faker.number.int({min: minAmount, max: maxAmount});
  TransactionPool.withdraw(date, account, amount);
  return true;
}
