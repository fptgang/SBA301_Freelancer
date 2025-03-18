import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TransactionDto } from "../../../../../generated/models/TransactionDto";
import {
  TransactionStatusDto,
  TransactionTypeDto,
} from "../../../../../generated";
import { useList } from "@refinedev/core";
import { store } from "../../../../store";

const TransactionHistoryTable: React.FC = () => {
  const CURRENT_USER_ID = store.getState().auth.account?.accountId || 0;
  const { data } = useList<TransactionDto>({
    resource: "transactions",
  });
  const transactions = data?.data || [];
  const columns: ColumnsType<TransactionDto> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
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
