import React, { useMemo } from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  TagField,
  EmailField,
  DateField,
  FilterDropdown,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Select,
  Badge,
  Tooltip,
  Typography,
  Tag,
  Input,
} from "antd";
import {
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { ROLE_COLOR_MAP } from "../../utils/constants";
import { AccountDto } from "../../../generated/models/AccountDto";

const { Text } = Typography;

export const AccountsList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<AccountDto>({
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
          field: "role",
          operator: "eq",
          value: undefined,
        },
      ],
    },
  });

  const getVerificationStatus = (verifiedAt: string | null) => {
    return verifiedAt ? (
      <Badge status="success" text="Verified" />
    ) : (
      <Badge status="warning" text="Pending" />
    );
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(balance);
  };

  return (
    <List>
      <div className="mb-6">
        <Input.Search
          placeholder="Search accounts..."
          className="max-w-md"
          {...(searchFormProps.onFinish && {
            onSearch: searchFormProps.onFinish,
          })}
        />
      </div>

      <Table
        {...tableProps}
        rowKey="id"
        className="overflow-x-auto"
        scroll={{ x: true }}
      >
        <Table.Column
          dataIndex={["accountId"]}
          title={
            <Tooltip title="Unique identifier for the account">
              <Space>
                <UserOutlined />
                <span>Account ID</span>
              </Space>
            </Tooltip>
          }
          sorter
          className="font-medium"
        />

        <Table.Column
          dataIndex={["email"]}
          title="Email"
          render={(value: string) => (
            <EmailField value={value} className="text-blue-600" />
          )}
          sorter
        />

        <Table.Column
          title="Name"
          render={(_, record: AccountDto) => (
            <Text>
              {record.firstName} {record.lastName}
            </Text>
          )}
          sorter={(a: AccountDto, b: AccountDto) =>
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            )
          }
        />

        <Table.Column
          dataIndex="balance"
          title={
            <Tooltip title="Current account balance">
              <Space>
                <DollarOutlined />
                <span>Balance</span>
              </Space>
            </Tooltip>
          }
          render={(value: number) => (
            <Text className={value < 0 ? "text-red-500" : "text-green-500"}>
              {formatBalance(value)}
            </Text>
          )}
          sorter
        />

        <Table.Column
          dataIndex="role"
          title="Role"
          filterMode="menu"
          filters={[
            { text: "Admin", value: "ADMIN" },
            { text: "Freelancer", value: "FREELANCER" },
            { text: "Staff", value: "STAFF" },
          ]}
          render={(value: keyof typeof ROLE_COLOR_MAP) => (
            <Tag
              color={ROLE_COLOR_MAP[value] || "default"}
              className="capitalize"
            >
              {value}
            </Tag>
          )}
        />

        <Table.Column
          dataIndex="verifiedAt"
          title={
            <Tooltip title="Account verification status">
              <Space>
                <CheckCircleOutlined />
                <span>Status</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => getVerificationStatus(value)}
          filters={[
            { text: "Verified", value: true },
            { text: "Pending", value: false },
          ]}
        />

        <Table.Column
          dataIndex="createdAt"
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Created</span>
            </Space>
          }
          render={(value: string) => (
            <DateField value={value} format="MMMM DD, YYYY" />
          )}
          sorter
          defaultSortOrder="descend"
        />

        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: AccountDto) => (
            <Space size="middle">
              <Tooltip title="Edit Account">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.accountId}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.accountId}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
              <Tooltip title="Delete Account">
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.accountId}
                  className="text-red-600 hover:text-red-700"
                  confirmTitle="Delete Account"
                  confirmOkText="Delete"
                  confirmCancelText="Cancel"
                  about="Are you sure you want to delete this account? This action cannot be undone."
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
