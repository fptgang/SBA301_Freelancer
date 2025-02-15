import {Transaction} from "../model/Transaction.js";
import {TransactionStatus} from "../model/TransactionStatus.js";
import {TransactionType} from "../model/TransactionType.js";
import {Account} from "../model/Account.js";
import {AccountPool, EscrowAccount} from "./account.js";
import {AccountRole} from "../model/AccountRole.js";
import {faker} from "@faker-js/faker";
import {depositAmount, depositEscrowOnDemand} from "../config.js";
import {SqlFileAppender} from "../appender.js";

export class transactionPool {
  private transactions: Transaction[] = [];
  private nextId: number = 1;

  deposit(date: Date, account: Account, amount: number) {
    const status = this.getRandomStatus();
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      status,
      TransactionType.DEPOSIT,
      EscrowAccount().account_id, // System deposit
      account.account_id
    );

    this.transactions.push(transaction);

    if (status === TransactionStatus.SUCCESS) {
      account.balance += amount;
    }

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
      status,
      TransactionType.WITHDRAWAL,
      account.account_id,
      EscrowAccount().account_id // System withdrawal
    );

    this.transactions.push(transaction);

    if (status === TransactionStatus.SUCCESS) {
      account.balance -= amount;
    }

    return transaction;
  }

  depositEscrow(date: Date, account: Account, amount: number): Transaction | null {
    if (account.balance < amount) {
      if (faker.datatype.boolean(depositEscrowOnDemand()))
        this.deposit(date, account, amount);
      else
        return null;
    }

    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      TransactionStatus.SUCCESS,
      TransactionType.ESCROW_DEPOSIT,
      account.account_id,
      EscrowAccount().account_id
    );

    this.transactions.push(transaction);
    account.balance -= amount;
    EscrowAccount().balance += amount;

    return transaction;
  }

  releaseEscrow(date: Date, account: Account, amount: number) {
    const transaction = new Transaction(
      this.getNextId(),
      amount,
      date,
      TransactionStatus.SUCCESS,
      TransactionType.ESCROW_RELEASE,
      EscrowAccount().account_id,
      account.account_id
    );

    this.transactions.push(transaction);
    EscrowAccount().balance -= amount;
    account.balance += amount;

    return transaction;
  }

  dump(): string {
    return '\n' + Transaction.dump(this.transactions);
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
    return;
  }

  const amount = faker.number.int(depositAmount());
  TransactionPool.deposit(date, account, amount);
}

export const requestWithdrawal = (date: Date) => {
  const account = AccountPool.pickAccount(date, AccountRole.FREELANCER, false);
  if (!account) {
    return;
  }

  const minAmount = Math.floor(account.balance / 2);
  const maxAmount = account.balance;

  if (minAmount < 1) {
    return;
  }

  const amount = faker.number.int({min: minAmount, max: maxAmount});
  TransactionPool.withdraw(date, account, amount);
}
