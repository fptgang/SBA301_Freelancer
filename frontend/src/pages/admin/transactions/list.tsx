import React from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import { useTable, List, ShowButton, DateField } from "@refinedev/antd";
import { Table, Space, Input, Tooltip, Typography, Tag, Badge } from "antd";
import {
  DollarOutlined,
  TransactionOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Transaction {
  transactionId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  type: "FEE" | "ESCROW_RELEASE" | "WITHDRAWAL" | "ESCROW_DEPOSIT" | "DEPOSIT";
  status: "SUCCESS" | "FAILED";
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  FEE: { color: "orange", label: "Fee" },
  ESCROW_RELEASE: { color: "green", label: "Escrow Release" },
  WITHDRAWAL: { color: "red", label: "Withdrawal" },
  ESCROW_DEPOSIT: { color: "blue", label: "Escrow Deposit" },
  DEPOSIT: { color: "cyan", label: "Deposit" },
};

export const TransactionsList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<Transaction>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    filters: {
      initial: [
        {
          field: "status",
          operator: "eq",
          value: undefined,
        },
        {
          field: "type",
          operator: "eq",
          value: undefined,
        },
      ],
    },
  });

  const { data: accountData, isLoading: accountIsLoading } = useMany({
    resource: "accounts",
    ids: [
      ...(tableProps?.dataSource?.map((item) => item?.fromAccountId) ?? []),
      ...(tableProps?.dataSource?.map((item) => item?.toAccountId) ?? []),
    ],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountName = (accountId: number) => {
    const account = accountData?.data?.find((item) => item.id === accountId);
    return account
      ? `${account.firstName} ${account.lastName}`
      : `Account #${accountId}`;
  };

  return (
    <List canCreate={false}>
      <div className="mb-6">
        <Input.Search
          placeholder="Search transactions..."
          className="max-w-md"
          {...(searchFormProps.onFinish && {
            onSearch: searchFormProps.onFinish,
          })}
        />
      </div>

      <Table
        {...tableProps}
        rowKey="transactionId"
        className="overflow-x-auto"
        scroll={{ x: true }}
      >
        <Table.Column
          dataIndex="transactionId"
          title={
            <Tooltip title="Transaction Reference">
              <Space>
                <TransactionOutlined />
                <span>ID</span>
              </Space>
            </Tooltip>
          }
          render={(value: number) => (
            <Text copyable className="font-mono">
              #{value.toString().padStart(6, "0")}
            </Text>
          )}
          sorter
        />

        <Table.Column
          title={
            <Tooltip title="Transaction Parties">
              <Space>
                <UserSwitchOutlined />
                <span>From → To</span>
              </Space>
            </Tooltip>
          }
          render={(_, record: Transaction) => (
            <Space direction="vertical" size="small">
              <Text type="secondary">
                From: {getAccountName(record.fromAccountId)}
              </Text>
              <Text type="secondary">
                To: {getAccountName(record.toAccountId)}
              </Text>
            </Space>
          )}
        />

        <Table.Column
          dataIndex="amount"
          title={
            <Tooltip title="Transaction Amount">
              <Space>
                <DollarOutlined />
                <span>Amount</span>
              </Space>
            </Tooltip>
          }
          render={(value: number) => <Text strong>{formatAmount(value)}</Text>}
          sorter={(a: Transaction, b: Transaction) => a.amount - b.amount}
        />

        <Table.Column
          dataIndex="type"
          title={
            <Tooltip title="Transaction Type">
              <Space>
                <TransactionOutlined />
                <span>Type</span>
              </Space>
            </Tooltip>
          }
          render={(value: keyof typeof TYPE_CONFIG) => (
            <Tag color={TYPE_CONFIG[value].color}>
              {TYPE_CONFIG[value].label}
            </Tag>
          )}
          filters={Object.entries(TYPE_CONFIG).map(([key, config]) => ({
            text: config.label,
            value: key,
          }))}
        />

        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => (
            <Badge
              status={value === "SUCCESS" ? "success" : "error"}
              text={value === "SUCCESS" ? "Success" : "Failed"}
            />
          )}
          filters={[
            { text: "Success", value: "SUCCESS" },
            { text: "Failed", value: "FAILED" },
          ]}
        />

        <Table.Column
          dataIndex="createdAt"
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Date</span>
            </Space>
          }
          render={(value: string) => (
            <DateField value={value} format="MMM DD, YYYY HH:mm" />
          )}
          sorter
          defaultSortOrder="descend"
        />

        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: Transaction) => (
            <Space>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.transactionId}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
