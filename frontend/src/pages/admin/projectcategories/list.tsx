import React, { useEffect } from "react";
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
  CreateButton,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Tooltip,
  Typography,
  Input,
  Badge,
  Tag,
  Form,
} from "antd";
import {
  FolderOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { stompClient } from "../../../utils/stompClient";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Text } = Typography;

export const ProjectCategoriesList: React.FC = () => {
  const [localSettings] = useLocalSettings();
  const { tableProps, searchFormProps } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    onSearch: (values) => {
      console.log("Search values", values);
      return [
        {
          field: "name",
          operator: "contains",
          value: values.search,
        },
      ];
    },
    liveMode: "manual",
  });

  // const { data: projectCategoryData, isLoading: projectCategoryIsLoading } =
  //   useMany({
  //     resource: "project-categories",
  //     ids: tableProps?.dataSource?.map((item) => item?.projectCategoryId) ?? [],
  //     queryOptions: {
  //       enabled: !!tableProps?.dataSource,
  //     },
  //   });

  useEffect(() => {
    return () => {
      stompClient?.unsubscribe("resources/project-categories");
    };
  }, []);

  const getVisibilityStatus = (isVisible: boolean) => {
    return isVisible ? (
      <Badge status="success" text="Visible" />
    ) : (
      <Badge status="default" text="Hidden" />
    );
  };

  const isAdmin = localStorage.getItem("role") === "ADMIN";

  return (
    <List
      headerButtons={[
        <RefreshButton key="refresh" className="mr-2" />,
        <CreateButton resource="project-categories" />,
      ]}
    >
      <div className="mb-6">
        <Form {...searchFormProps}>
          <Space>
            <Form.Item name="search">
              <Input.Search
                placeholder="Search skills..."
                className="max-w-md"
                onChange={(e) => {
                  searchFormProps?.form?.setFieldsValue({
                    search: e.target.value,
                  });
                  searchFormProps?.form?.submit();
                }}
              />{" "}
            </Form.Item>
          </Space>
        </Form>
      </div>

      <Table
        {...tableProps}
        rowKey="id"
        className="overflow-x-auto"
        scroll={{ x: true }}
      >
        <Table.Column
          dataIndex={["projectCategoryId"]}
          title={
            <Tooltip title="Category identifier">
              <Space>
                <FolderOutlined />
                <span>Category ID</span>
              </Space>
            </Tooltip>
          }
          sorter
          render={(value: string) => (
            <Text className="font-medium">{value}</Text>
          )}
        />

        <Table.Column
          dataIndex="name"
          title="Name"
          sorter
          render={(value: string) => (
            <Text strong className="capitalize">
              {value}
            </Text>
          )}
        />

        {isAdmin && (
          <Table.Column
            dataIndex="isVisible"
            title={
              <Tooltip title="Category visibility status">
                <Space>
                  <EyeOutlined />
                  <span>Visibility</span>
                </Space>
              </Tooltip>
            }
            render={(value: boolean) => getVisibilityStatus(value)}
            filters={[
              { text: "Visible", value: true },
              { text: "Hidden", value: false },
            ]}
            filterMultiple={false}
          />
        )}

        <Table.Column
          dataIndex="createdAt"
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Created</span>
            </Space>
          }
          render={(value: string) => (
            <DateField value={value} format={localSettings.dateFormat} />
          )}
          sorter
          defaultSortOrder="descend"
        />

        <Table.Column
          dataIndex="updatedAt"
          title="Updated At"
          render={(value: string) => (
            <DateField value={value} format={localSettings.dateFormat} />
          )}
          sorter
        />

        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: BaseRecord) => (
            <Space size="middle">
              <Tooltip title="Edit Category">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.projectCategoryId}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.projectCategoryId}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
              {record.isVisible && (
                <Tooltip title="Delete Category">
                  <DeleteButton
                    hideText
                    size="small"
                    recordItemId={record.projectCategoryId}
                    className="text-red-600 hover:text-red-700"
                    confirmTitle="Delete Category"
                    confirmOkText="Delete"
                    confirmCancelText="Cancel"
                    about="Are you sure you want to delete this category? This action cannot be undone."
                  />
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
