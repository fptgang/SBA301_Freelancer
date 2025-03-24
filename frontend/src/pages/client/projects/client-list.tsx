import { useState } from "react";
import {
  useTable,
  List,
  DateField,
} from "@refinedev/antd";
import {
  Table,
  Card,
  Tag,
  Input,
  Space,
  Select,
  Badge,
  Typography,
  Button,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  DollarOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils/formatter";
import ClientCreateButton from "./client-create";
import { ProjectDto } from "../../../../generated";
import { store } from "../../../store";
import { useNavigate } from "react-router";
import {useLocalSettings} from "../../../hooks/useLocalSettings";

const { Text } = Typography;
const { Option } = Select;

const ClientList = () => {
  const [localSettings] = useLocalSettings()
  const [searchText, setSearchText] = useState("");
  const me = store?.getState()?.auth?.account;
  const nav = useNavigate();
  const {
    tableProps,
    setFilters,
    tableQuery: { refetch },
  } = useTable({
    resource: "projects",
    filters: {
      initial: [
        {
          field: "client.accountId",
          operator: "eq",
          value: me?.accountId,
        },
        {
          field: "status",
          operator: "eq",
          value: undefined,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 10,
    },
    meta: {
      select: "*, client.*",
    },
  });

  const handleSearch = (value) => {
    setSearchText(value);
    setFilters([
      {
        field: "title",
        operator: "contains",
        value: value ? value : undefined,
      },
    ]);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      OPEN: { color: "blue", text: "Open" },
      IN_PROGRESS: { color: "green", text: "In Progress" },
      TERMINATED: { color: "red", text: "Terminated" },
      FINISHED: { color: "purple", text: "Finished" },
    };

    return (
      <Tag color={statusMap[status]?.color || "default"}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  return (
    <div className="p-4">
      <List
        title={
          <Space direction="vertical" size={8} className="w-full">
            <Typography.Title level={2}>My Projects</Typography.Title>
          </Space>
        }
      >
        <Card className="mb-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
            <Input
              placeholder="Search projects..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="max-w-md"
            />
            <Space>
              <ClientCreateButton refetch={refetch} />
            </Space>
          </div>

          <Table {...tableProps} rowKey="projectId" scroll={{ x: 1000 }}>
            <Table.Column
              dataIndex="title"
              title="Project"
              render={(value, record) => (
                <Space direction="vertical" size={0}>
                  <Text strong className="text-blue-600">
                    {value}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    Project ID: {record.projectId}
                  </Text>
                </Space>
              )}
              sorter
            />

            <Table.Column
              dataIndex="status"
              title="Status"
              render={(value) => getStatusTag(value)}
              filters={[
                { text: "Open", value: "OPEN" },
                { text: "In Progress", value: "IN_PROGRESS" },
                { text: "Terminated", value: "TERMINATED" },
                { text: "Finished", value: "FINISHED" },
              ]}
              filterMultiple={false}
              width={120}
            />

            <Table.Column
              dataIndex="startDate"
              title={
                <Tooltip title="Project start date">
                  <Space>
                    <CalendarOutlined />
                    <span>Start Date</span>
                  </Space>
                </Tooltip>
              }
              render={(value) => (
                <DateField value={value} format={localSettings.dateTimeFormat} />
              )}
              sorter
              width={200}
            />

            <Table.Column
              title="Budget"
              render={(value, record: ProjectDto) => (
                <Space>
                  <DollarOutlined />
                  <span>
                    {formatCurrency(record.minBudget)}-
                    {formatCurrency(record.maxBudget)}
                  </span>
                </Space>
              )}
              width={200}
            />

            <Table.Column
              title="Proposals"
              dataIndex="proposalCount"
              render={(value) => (
                <div className="flex justify-center">
                  <Badge
                    count={value || 0}
                    showZero
                    style={{
                      backgroundColor: value > 0 ? "#1890ff" : "#d9d9d9",
                      color: "white",
                    }}
                  />
                </div>
              )}
              width={100}
            />

            <Table.Column
              dataIndex="createdAt"
              title={
                <Tooltip title="Project creation date">
                  <Space>
                    <CalendarOutlined />
                    <span>Created</span>
                  </Space>
                </Tooltip>
              }
              render={(value) => (
                <DateField value={value} format={localSettings.dateFormat} />
              )}
              sorter
              width={150}
            />

            <Table.Column
              title="Actions"
              dataIndex="actions"
              render={(_, record) => (
                <Space>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    color="default"
                    style={{ border: "1px solid #f0f0f0" }}
                    onClick={() => {
                      nav(`/client/projects/${record.projectId}`);
                    }}
                  />
                </Space>
              )}
              fixed="right"
              width={100}
            />
          </Table>
        </Card>
      </List>
    </div>
  );
};

export default ClientList;
