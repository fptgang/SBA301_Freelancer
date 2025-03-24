import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TransactionDto } from "../../../../../generated/models/TransactionDto";
import {
  AccountDto,
  TransactionStatusDto,
  TransactionTypeDto,
} from "../../../../../generated";
import { useGetIdentity, useList } from "@refinedev/core";
import { store } from "../../../../store";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";
import { useState } from "react";
import { PaginationPosition } from "antd/es/pagination/Pagination";

const TransactionHistoryTable: React.FC = () => {
  const [localSettings] = useLocalSettings();
  const me = useGetIdentity<AccountDto>();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data } = useList<TransactionDto>({
    resource: "transactions",
    sorters: [{ field: "createdAt", order: "desc" }],
    pagination: { current, pageSize },
  });
  const transactions = data?.data || [];
  const columns: ColumnsType<TransactionDto> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => localSettings.formatDateTime(date),
    },
    {
      title: "Direction",
      key: "direction",
      render: (_, record) => {
        const isOutgoing = record.fromAccount?.accountId === me.data?.accountId;
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
          [TransactionTypeDto.EscrowRefund]: "yellow",
        };
        return <Tag color={typeColors[type]}>{type.replace(/_/g, " ")}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => {
        const isOutgoing = record.fromAccount?.accountId === me.data?.accountId;
        return (
          <span style={{ color: isOutgoing ? "#ff4d4f" : "#52c41a" }}>
            {isOutgoing ? "-" : "+"}${amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "From",
      dataIndex: "fromAccount.accountName",
      key: "fromAccount",
      render: (amount: number, record) => {
        return `${record.fromAccount?.firstName || ""} ${
          record.fromAccount?.lastName || ""
        }`;
      },
    },
    {
      title: "To",
      dataIndex: "toAccount.accountName",
      key: "toAccount",
      render: (amount: number, record) => {
        return `${record.toAccount?.firstName || ""} ${
          record.toAccount?.lastName || ""
        }`;
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
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrent(page);
    setPageSize(newPageSize);
  };

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="transactionId"
      pagination={{
        current: current,
        pageSize: pageSize,
        total: data?.total || 10,
        onChange: handlePageChange,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Total ${total} items`,
        position: ["bottomRight"],
        responsive: true,
        pageSizeOptions: ["10", "20", "50"],
      }}
    />
  );
};

export default TransactionHistoryTable;
