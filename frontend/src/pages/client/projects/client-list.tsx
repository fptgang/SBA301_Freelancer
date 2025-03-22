import React, { useEffect, useState } from "react";
import {
  useTable,
  List,
  ShowButton,
  DateField,
  FilterDropdown,
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
  ProjectOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils/formatter";
import ClientCreateButton from "./client-create";
import { useGetIdentity } from "@refinedev/core";
import { AccountDto, ProjectDto } from "../../../../generated";
import { store } from "../../../store";
import { useNavigate } from "react-router";

const { Text, Title } = Typography;
const { Option } = Select;

const ClientList = () => {
  const [searchText, setSearchText] = useState("");
  const me = store?.getState()?.auth?.account;
  const nav = useNavigate();
  const {
    tableProps,
    filters,
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
    <List
      title={
        <Space direction="vertical" size={8} className="w-full">
          <Title level={4} className="m-0">
            My Projects
          </Title>
          <Text type="secondary">
            Manage your projects and track their progress
          </Text>
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
            <FilterDropdown
              label="Status"
              icon={<TagOutlined />}
              placeholder="All Statuses"
              value={filters.find((filter) => filter.field === "status")?.value}
              onChange={(value) => {
                setFilters([
                  {
                    field: "status",
                    operator: "eq",
                    value: value,
                  },
                ]);
              }}
            >
              <Option value={undefined}>All Statuses</Option>
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="TERMINATED">Terminated</Option>
              <Option value="FINISHED">Finished</Option>
            </FilterDropdown>
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
            width={150}
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
            sorter
            width={150}
          />

          <Table.Column
            title="Proposals"
            dataIndex="proposalCount"
            render={(value) => (
              <Badge
                count={value || 0}
                showZero
                style={{
                  backgroundColor: value > 0 ? "#1890ff" : "#d9d9d9",
                  color: "white",
                }}
              />
            )}
            width={120}
            sorter
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
              <DateField value={value} format="MMM DD, YYYY" />
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
            width={70}
          />
        </Table>
      </Card>
    </List>
  );
};

export default ClientList;
