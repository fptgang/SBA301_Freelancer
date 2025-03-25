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
import {
  Table,
  Space,
  Input,
  Tooltip,
  Typography,
  Tag,
  Badge,
  Form,
} from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Text } = Typography;

interface Skill {
  skillId: number;
  name: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SkillsList: React.FC = () => {
  const [localSettings] = useLocalSettings();
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
  });

  const getSkillTag = (name: string) => {
    // Define a list of colors available in Ant Design
    const antdColors = [
      "magenta",
      "red",
      "volcano",
      "orange",
      "gold",
      "lime",
      "green",
      "cyan",
      "blue",
      "geekblue",
      "purple",
    ];

    // Get a random color from the array based on the skill name
    // Using the name as a seed ensures the same skill always gets the same color
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % antdColors.length;
    const color = antdColors[colorIndex];

    return <Tag color={color || "default"}>{name}</Tag>;
  };

  return (
    <List>
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
            <DateField value={value} format={localSettings.dateFormat} />
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
            <DateField value={value} format={localSettings.dateFormat} />
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
              {record.isVisible && (
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
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
