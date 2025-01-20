import React from "react";
import { useMany, useOne } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  MarkdownField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tooltip, Typography, Tag, Input, Badge } from "antd";
import {
  ProjectOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  AccountDto,
  ProjectCategoryDto,
  ProjectDto,
  ProjectDtoStatusEnum,
} from "../../../generated";

const { Text } = Typography;

// You can customize these colors based on your needs
const STATUS_COLOR_MAP = {
  OPEN: "green",
  IN_PROGRESS: "orange",
  FINISHED: "blue",
  TERMINATED: "red",
};

export const ProjectsList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<ProjectDto>({
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
          field: "isVisible",
          operator: "eq",
          value: undefined,
        },
      ],
    },
  });

  const { data: projectData, isLoading: projectIsLoading } =
    useMany<ProjectDto>({
      resource: "projects",
      ids:
        tableProps?.dataSource
          ?.map((item) => item?.projectId)
          .filter((id): id is number => id !== undefined) ?? [],
      queryOptions: {
        enabled: !!tableProps?.dataSource,
      },
    });

  const { data: projectCategoryData, isLoading: projectCategoryIsLoading } =
    useMany<ProjectCategoryDto>({
      resource: "projectCategories",
      ids:
        projectData?.data
          ?.map((item) => item.projectCategoryId)
          .filter((id): id is number => id !== undefined) ?? [],
    });

  const getVisibilityStatus = (isVisible: boolean) => {
    return isVisible ? (
      <Badge status="success" text="Visible" />
    ) : (
      <Badge status="default" text="Hidden" />
    );
  };

  return (
    <List>
      <div className="mb-6">
        <Input.Search
          placeholder="Search projects..."
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
          dataIndex={["projectId"]}
          title={
            <Tooltip title="Project identifier">
              <Space>
                <ProjectOutlined />
                <span>Project ID</span>
              </Space>
            </Tooltip>
          }
          render={(value, record: ProjectDto) =>
            projectIsLoading ? (
              <Text type="secondary">Loading...</Text>
            ) : (
              <Text className="font-medium">{record.projectId}</Text>
            )
          }
          sorter
        />

        {/* Fix: Update the category column's render logic */}
        <Table.Column
          dataIndex={["projectCategoryId"]}
          title={
            <Tooltip title="Project category">
              <Space>
                <FolderOutlined />
                <span>Category</span>
              </Space>
            </Tooltip>
          }
          render={(value, record: ProjectDto) =>
            projectCategoryIsLoading ? (
              <Text type="secondary">Loading...</Text>
            ) : (
              <Tag color="blue">
                {projectCategoryData?.data.find(
                  (v) => v.projectCategoryId === record.projectCategoryId
                )?.name || "Unknown " + record.projectCategoryId}
              </Tag>
            )
          }
          filterMode="menu"
          filterMultiple={false}
        />

        <Table.Column
          dataIndex="title"
          title="Title"
          sorter
          render={(value: string) => <Text strong>{value}</Text>}
        />

        <Table.Column
          dataIndex="description"
          title="Description"
          render={(value: string) => (
            <MarkdownField
              value={value.length > 80 ? `${value.slice(0, 80)}...` : value}
            />
          )}
        />

        <Table.Column
          dataIndex="status"
          title="Status"
          filterMode="menu"
          filters={Object.values(ProjectDtoStatusEnum).map(
            (status: string) => ({
              text: status.toLowerCase().replace("_", " "),
              value: status,
            })
          )}
          filterMultiple={false}
          render={(value: keyof typeof STATUS_COLOR_MAP) => (
            <Tag
              color={STATUS_COLOR_MAP[value] || "default"}
              className="capitalize"
            >
              {value.toLowerCase()}
            </Tag>
          )}
        />

        <Table.Column
          dataIndex="isVisible"
          title={
            <Tooltip title="Project visibility status">
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
          dataIndex="updatedAt"
          title="Updated At"
          render={(value: string) => (
            <DateField value={value} format="MMMM DD, YYYY" />
          )}
          sorter
        />

        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: ProjectDto) => (
            <Space size="middle">
              <Tooltip title="Edit Project">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.projectId}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.projectId}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
