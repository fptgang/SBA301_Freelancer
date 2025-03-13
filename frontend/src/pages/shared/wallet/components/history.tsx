import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TransactionDto } from "../../../../../generated/models/TransactionDto";
import {
  TransactionStatusDto,
  TransactionTypeDto,
} from "../../../../../generated";

const CURRENT_USER_ID = 0;

// Sample transaction data
const transactions: TransactionDto[] = [
  {
    transactionId: 1,
    fromAccount: {
      accountId: 1,
      firstName: "John",
      lastName: "Doe",
    },
    toAccount: {
      accountId: 2,
      firstName: "Jane",
      lastName: "Doe",
    },
    amount: 100.0,
    type: TransactionTypeDto.Withdrawal,
    status: TransactionStatusDto.Success,
    createdAt: new Date("2024-03-20T10:00:00Z"),
  },
  {
    transactionId: 2,
    fromAccount: {
      accountId: 1,
      firstName: "John",
      lastName: "Doe",
    },
    toAccount: {
      accountId: 2,
      firstName: "Jane",
      lastName: "Doe",
    },
    amount: 250.0,
    type: TransactionTypeDto.Deposit,
    status: TransactionStatusDto.Success,
    createdAt: new Date("2024-03-19T15:30:00Z"),
  },
  {
    transactionId: 3,
    fromAccount: {
      accountId: 1,
      firstName: "John",
      lastName: "Doe",
    },
    toAccount: {
      accountId: 2,
      firstName: "Jane",
      lastName: "Doe",
    },
    amount: 500.0,
    type: TransactionTypeDto.EscrowDeposit,
    status: TransactionStatusDto.Success,
    createdAt: new Date("2024-03-18T09:15:00Z"),
  },
];

const TransactionHistoryTable: React.FC = () => {
  const columns: ColumnsType<TransactionDto> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: "Type",
      key: "direction",
      render: (_, record) => {
        const isOutgoing = record.fromAccount?.accountId === CURRENT_USER_ID;
        return (
          <Tag color={isOutgoing ? "volcano" : "green"}>
            {isOutgoing ? "Outgoing" : "Incoming"}
          </Tag>
        );
      },
    },
    {
      title: "Transaction Type",
      dataIndex: "type",
      key: "type",
      render: (type: TransactionTypeDto) => {
        const typeColors = {
          [TransactionTypeDto.Deposit]: "blue",
          [TransactionTypeDto.Withdrawal]: "orange",
          [TransactionTypeDto.EscrowDeposit]: "purple",
          [TransactionTypeDto.EscrowRelease]: "cyan",
          [TransactionTypeDto.EscrowRefund]: "red",
        };
        return <Tag color={typeColors[type]}>{type.replace(/_/g, " ")}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => {
        const isOutgoing = record.fromAccount?.accountId === CURRENT_USER_ID;
        return (
          <span style={{ color: isOutgoing ? "#ff4d4f" : "#52c41a" }}>
            {isOutgoing ? "-" : "+"}${amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TransactionStatusDto) => (
        <Tag
          color={status === TransactionStatusDto.Success ? "success" : "error"}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="transactionId"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TransactionHistoryTable;
