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
} from "@refinedev/antd";
import { Table, Space, Input, Tooltip, Typography, Tag, Badge } from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Skill {
  skillId: number;
  name: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SkillsList: React.FC = () => {
  const { tableProps, searchFormProps } = useTable<Skill>({
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
          field: "isVisible",
          operator: "eq",
          value: undefined,
        },
      ],
    },
  });

  const getSkillTag = (name: string) => {
    const colorMap: Record<string, string> = {
      JavaScript: "yellow",
      Python: "blue",
      SQL: "cyan",
      Java: "red",
      "C++": "purple",
      HTML: "orange",
      CSS: "pink",
      Ruby: "red",
      PHP: "violet",
      Swift: "geekblue",
    };

    return <Tag color={colorMap[name] || "default"}>{name}</Tag>;
  };

  return (
    <List>
      <div className="mb-6">
        <Input.Search
          placeholder="Search skills..."
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
          dataIndex="name"
          title={
            <Tooltip title="Programming Language/Technology">
              <Space>
                <CodeOutlined />
                <span>Skill</span>
              </Space>
            </Tooltip>
          }
          render={(value: string) => getSkillTag(value)}
          sorter={(a: Skill, b: Skill) => a.name.localeCompare(b.name)}
          filterMode="menu"
          filters={tableProps.dataSource?.map((skill) => ({
            text: skill.name,
            value: skill.name,
          }))}
        />

        <Table.Column
          dataIndex="isVisible"
          title={
            <Tooltip title="Visibility Status">
              <Space>
                <EyeOutlined />
                <span>Visibility</span>
              </Space>
            </Tooltip>
          }
          render={(value: boolean) => (
            <Badge
              status={value ? "success" : "default"}
              text={value ? "Visible" : "Hidden"}
            />
          )}
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
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Updated</span>
            </Space>
          }
          render={(value: string) => (
            <DateField value={value} format="MMMM DD, YYYY" />
          )}
          sorter
        />

        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: Skill) => (
            <Space size="middle">
              <Tooltip title="Edit Skill">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.skillId}
                  className="text-blue-600 hover:text-blue-700"
                />
              </Tooltip>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.skillId}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
              <Tooltip title="Delete Skill">
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.skillId}
                  className="text-red-600 hover:text-red-700"
                  confirmTitle="Delete Skill"
                  confirmOkText="Delete"
                  confirmCancelText="Cancel"
                  about="Are you sure you want to delete this skill? This action cannot be undone."
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
