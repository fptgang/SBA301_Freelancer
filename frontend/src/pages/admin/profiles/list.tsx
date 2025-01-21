import React from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Tooltip, Typography, Tag, Badge } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PhoneOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ProfileDto } from "../../../../generated";

const { Text } = Typography;

const LANGUAGE_NAMES: Record<string, string> = {
  ig: "Igbo",
  cr: "Cree",
  mr: "Marathi",
  mh: "Marshallese",
  eo: "Esperanto",
  // Add more language mappings as needed
};

export const ProfilesList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<ProfileDto>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  const { data: accountData, isLoading: accountIsLoading } = useMany({
    resource: "accounts",
    ids:
      tableProps?.dataSource
        ?.map((item) => item?.accountId)
        .filter((id): id is number => id !== undefined) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  return (
    <List>
      <div className="mb-6">
        <Input.Search
          placeholder="Search profiles..."
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
            <Tooltip title="Associated Account">
              <Space>
                <UserOutlined />
                <span>Account</span>
              </Space>
            </Tooltip>
          }
          render={(value) =>
            accountIsLoading ? (
              <Badge status="processing" text="Loading..." />
            ) : (
              <Text>
                {
                  accountData?.data?.find((item) => item.id === value)
                    ?.firstName
                }{" "}
                {accountData?.data?.find((item) => item.id === value)?.lastName}
              </Text>
            )
          }
          sorter
        />

        <Table.Column
          dataIndex="overview"
          title={
            <Tooltip title="Profile Overview">
              <Space>
                <BookOutlined />
                <span>Overview</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => (
            <Tooltip title={value}>
              <Text>
                {value.length > 50 ? `${value.slice(0, 50)}...` : value}
              </Text>
            </Tooltip>
          )}
          sorter
        />

        <Table.Column
          dataIndex="education"
          title={
            <Tooltip title="Educational Background">
              <Space>
                <BookOutlined />
                <span>Education</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => (
            <Tooltip title={value}>
              <Text>
                {value.length > 50 ? `${value.slice(0, 50)}...` : value}
              </Text>
            </Tooltip>
          )}
        />

        <Table.Column
          dataIndex="phoneNumber"
          title={
            <Tooltip title="Contact Number">
              <Space>
                <PhoneOutlined />
                <span>Phone</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => <Text copyable>{value}</Text>}
        />

        <Table.Column
          dataIndex="language"
          title={
            <Tooltip title="Preferred Language">
              <Space>
                <GlobalOutlined />
                <span>Language</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => (
            <Tag color="blue">{LANGUAGE_NAMES[value] || value}</Tag>
          )}
          filterMode="menu"
          filters={Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
            text: name,
            value: code,
          }))}
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
          render={(_, record: ProfileDto) => (
            <Space size="middle">
              <Tooltip title="Edit Profile">
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
              <Tooltip title="Delete Profile">
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.accountId}
                  className="text-red-600 hover:text-red-700"
                  confirmTitle="Delete Profile"
                  confirmOkText="Delete"
                  confirmCancelText="Cancel"
                  about="Are you sure you want to delete this profile? This action cannot be undone."
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
