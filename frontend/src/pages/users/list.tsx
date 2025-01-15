import React from "react";
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
import { Table, Space, Select } from "antd";

export const AccountsList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { data: accountData, isLoading: accountIsLoading } = useMany({
    resource: "accounts",

    ids: tableProps?.dataSource?.map((item) => item?.accountId) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex={["accountId"]} title="Account" />
        <Table.Column
          dataIndex={["email"]}
          title="Email"
          render={(value: any) => <EmailField value={value} />}
        />
        <Table.Column dataIndex="firstName" title="First Name" />
        <Table.Column dataIndex="lastName" title="Last Name" />
        <Table.Column dataIndex="balance" title="Balance" />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column
          dataIndex={["verifiedAt"]}
          title="Verified At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["createdAt"]}
          title="Created At"
          filterMode="menu"
          sorter
          ellipsis
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ minWidth: 200 }}
                mode="multiple"
                placeholder="Select Category"
                // {...categorySelectProps}
                loading={accountIsLoading}
              />
            </FilterDropdown>
          )}
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["updatedAt"]}
          title="Updated At"
          sorter
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.accountId}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record.accountId}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.accountId}
                about="Are you sure you want to delete this record?"
                resource="accounts"
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
