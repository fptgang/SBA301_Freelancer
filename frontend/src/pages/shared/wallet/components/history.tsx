import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TransactionDto, TransactionDtoStatusEnum, TransactionDtoTypeEnum } from "../../../../../generated/models/TransactionDto";

const CURRENT_USER_ID = 0;

// Sample transaction data
const transactions: TransactionDto[] = [
  {
    transactionId: 1,
    fromAccountId: 0,
    toAccountId: 2,
    amount: 100.00,
    type: TransactionDtoTypeEnum.Withdrawal,
    status: TransactionDtoStatusEnum.Success,
    createdAt: new Date("2024-03-20T10:00:00Z"),
  },
  {
    transactionId: 2,
    fromAccountId: 3,
    toAccountId: 0,
    amount: 250.00,
    type: TransactionDtoTypeEnum.Deposit,
    status: TransactionDtoStatusEnum.Success,
    createdAt: new Date("2024-03-19T15:30:00Z"),
  },
  {
    transactionId: 3,
    fromAccountId: 0,
    toAccountId: 4,
    amount: 500.00,
    type: TransactionDtoTypeEnum.EscrowDeposit,
    status: TransactionDtoStatusEnum.Success,
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
        const isOutgoing = record.fromAccountId === CURRENT_USER_ID;
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
      render: (type: TransactionDtoTypeEnum) => {
        const typeColors = {
          [TransactionDtoTypeEnum.Deposit]: "blue",
          [TransactionDtoTypeEnum.Withdrawal]: "orange",
          [TransactionDtoTypeEnum.EscrowDeposit]: "purple",
          [TransactionDtoTypeEnum.EscrowRelease]: "cyan",
          [TransactionDtoTypeEnum.Fee]: "red",
        };
        return <Tag color={typeColors[type]}>{type.replace(/_/g, " ")}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => {
        const isOutgoing = record.fromAccountId === CURRENT_USER_ID;
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
      render: (status: TransactionDtoStatusEnum) => (
        <Tag color={status === TransactionDtoStatusEnum.Success ? "success" : "error"}>
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
