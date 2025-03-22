import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show, NumberField, TextField, DateField } from "@refinedev/antd";
import {
  Typography,
  Card,
  Descriptions,
  Space,
  Tag,
  Skeleton,
  Alert,
} from "antd";
import {
  DollarOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  TransactionDto,
  TransactionStatusDto,
  TransactionTypeDto,
} from "../../../../generated";
import {useLocalSettings} from "../../../hooks/useLocalSettings";

const { Title } = Typography;

const STATUS_COLOR_MAP: Record<TransactionStatusDto, string> = {
  SUCCESS: "green",
  PENDING: "orange",
  FAILED: "red",
};

const TYPE_COLOR_MAP: Record<TransactionTypeDto, string> = {
  ESCROW_RELEASE: "blue",
  DEPOSIT: "cyan",
  WITHDRAWAL: "magenta",
  ESCROW_DEPOSIT: "purple",
  ESCROW_REFUND: "red",
};

export const TransactionsShow: React.FC = () => {
  const [localSettings] = useLocalSettings()
  const { queryResult } = useShow<TransactionDto>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  const getStatusTag = (status: TransactionStatusDto) => (
    <Tag color={STATUS_COLOR_MAP[status]} className="text-sm">
      {status}
    </Tag>
  );

  const getTypeTag = (type: TransactionTypeDto) => (
    <Tag color={TYPE_COLOR_MAP[type]} className="text-sm">
      {type.replace("_", " ")}
    </Tag>
  );

  return (
    <Show isLoading={isLoading} canEdit={false} canDelete={false}>
      <Space direction="vertical" size="large" className="w-full">
        {record?.status === "SUCCESS" && (
          <Alert
            message="Successful Transaction"
            description="This transaction has been completed successfully."
            type="success"
            showIcon
          />
        )}

        <Card
          title={
            <Space>
              <DollarOutlined className="text-blue-500" />
              <span className="font-semibold">Transaction Details</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <DollarOutlined />
                  Amount
                </Space>
              }
            >
              <NumberField
                value={record?.amount || 0}
                options={{
                  style: "currency",
                  currency: "USD",
                }}
              />
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <SwapOutlined />
                  Type
                </Space>
              }
            >
              {getTypeTag(record?.type)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CheckCircleOutlined />
                  Status
                </Space>
              }
            >
              {getStatusTag(record?.status)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <ClockCircleOutlined />
                  Transaction Date
                </Space>
              }
            >
              <DateField
                value={record?.createdAt}
                format={localSettings.dateTimeFormat}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <UserOutlined className="text-blue-500" />
              <span className="font-semibold">Account Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  From Account
                </Space>
              }
            >
              <Space direction="vertical">
                <span className="font-medium">
                  {record?.fromAccount?.firstName}{" "}
                  {record?.fromAccount?.lastName}
                </span>
                <Tag className="font-mono">
                  {record?.fromAccount?.accountId}
                </Tag>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  To Account
                </Space>
              }
            >
              <Space direction="vertical">
                <span className="font-medium">
                  {record?.toAccount?.firstName} {record?.toAccount?.lastName}
                </span>
                <Tag className="font-mono">{record?.toAccount?.accountId}</Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined className="text-blue-500" />
              <span className="font-semibold">System Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Transaction ID" span={2}>
              <Tag className="font-mono">{record?.transactionId}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
