import React, { useState } from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import { useTable, List, ShowButton, DateField } from "@refinedev/antd";
import {
  Table,
  Space,
  Input,
  Tooltip,
  Typography,
  Tag,
  Badge,
  Button,
} from "antd";
import {
  DollarOutlined,
  TransactionOutlined,
  UserSwitchOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  TransactionDto,
  TransactionStatusDto,
  TransactionTypeDto,
} from "../../../../generated";
import { ShowTransactionDrawer } from "./components/ShowTransactionDrawer";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Text } = Typography;

const TYPE_CONFIG: Record<
  TransactionTypeDto,
  { color: string; label: string }
> = {
  ESCROW_RELEASE: { color: "green", label: "Escrow Release" },
  WITHDRAWAL: { color: "red", label: "Withdrawal" },
  ESCROW_DEPOSIT: { color: "blue", label: "Escrow Deposit" },
  DEPOSIT: { color: "cyan", label: "Deposit" },
  ESCROW_REFUND: { color: "purple", label: "Escrow Refund" },
};

export const TransactionsList: React.FC = () => {
  const [localSettings] = useLocalSettings();
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto>();
  const {
    tableProps,
    searchFormProps,
    tableQuery: { refetch },
  } = useTable<TransactionDto>({
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      {" "}
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
            render={(_, record: TransactionDto) => (
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  From:{" "}
                  {record.fromAccount?.firstName +
                    " " +
                    record.fromAccount?.lastName}
                </Text>
                <Text type="secondary">
                  To:{" "}
                  {record.toAccount?.firstName +
                    " " +
                    record.toAccount?.lastName}
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
            render={(value: number) => (
              <Text strong>{formatAmount(value)}</Text>
            )}
            sorter={(a: TransactionDto, b: TransactionDto) =>
              (a.amount || 0) - (b.amount || 0)
            }
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
            render={(value: TransactionStatusDto) => (
              <Badge
                status={
                  value === "SUCCESS"
                    ? "success"
                    : value === "FAILED"
                    ? "error"
                    : "warning"
                }
                text={
                  value === "SUCCESS"
                    ? "Success"
                    : value === "FAILED"
                    ? "Failed"
                    : "Pending"
                }
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
              <DateField value={value} format={localSettings.dateTimeFormat} />
            )}
            sorter
            defaultSortOrder="descend"
          />

          <Table.Column
            title="Actions"
            fixed="right"
            render={(_, record: TransactionDto) => (
              <Space>
                <Tooltip title="View Details">
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedTransaction(record);
                      setShowDrawer(true);
                      console.log("View Details", record);
                    }}
                  />
                </Tooltip>
              </Space>
            )}
          />
        </Table>
      </List>
      <ShowTransactionDrawer
        onClose={() => {
          setShowDrawer(false);
        }}
        open={showDrawer}
        refetch={refetch}
        transaction={selectedTransaction}
      />
    </>
  );
};
