import React from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
  DateField,
  RefreshButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { CheckSquareOutlined } from "@ant-design/icons";

export const ProjectCategoriesList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { data: projectCategoryData, isLoading: projectCategoryIsLoading } =
    useMany({
      resource: "projectCategories",
      ids: tableProps?.dataSource?.map((item) => item?.projectCategoryId) ?? [],
      queryOptions: {
        enabled: !!tableProps?.dataSource,
      },
    });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["projectCategoryId"]}
          title="Project Category"
        />

        <Table.Column dataIndex="name" title="Name" />
        {localStorage.getItem("role") == "ADMIN" ? (
          <Table.Column
            dataIndex={["isVisible"]}
            title="Is Visible"
            render={(value: any) => <BooleanField value={value} />}
          />
        ) : (
          ""
        )}
        <Table.Column
          dataIndex={["createdAt"]}
          title="Created At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["updatedAt"]}
          title="Updated At"
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
                recordItemId={record.projectCategoryId}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record.projectCategoryId}
              />
              {record.isVisible ? (
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.projectCategoryId}
                />
              ) : (
                <></>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
