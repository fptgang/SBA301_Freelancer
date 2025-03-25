import React, { useEffect, useState } from "react";
import { useTable, List, DateField, FilterDropdown } from "@refinedev/antd";
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
  EyeOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils/formatter";
import { useGetIdentity } from "@refinedev/core";
import { AccountDto, ProjectDto } from "../../../../generated";
import { store } from "../../../store";
import { useNavigate } from "react-router";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Text, Title } = Typography;
const { Option } = Select;

const FreelancerActiveProject = () => {
  const [localSettings] = useLocalSettings();
  const [searchText, setSearchText] = useState("");
  const { data: me } = useGetIdentity<AccountDto>();
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
          field: "contract.freelancer.accountId",
          operator: "eq",
          value: me?.accountId,
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
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    setFilters([
      {
        field: "title",
        operator: "contains",
        value: value ? value : undefined,
      },
    ]);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      OPEN: { color: "blue", text: "Open" },
      IN_PROGRESS: { color: "green", text: "In Progress" },
      TERMINATED: { color: "red", text: "Terminated" },
      FINISHED: { color: "purple", text: "Finished" },
    };

    return (
      <Tag
        color={statusMap[status as keyof typeof statusMap]?.color || "default"}
      >
        {statusMap[status as keyof typeof statusMap]?.text || status}
      </Tag>
    );
  };

  return (
    <List
      title={
        <Space direction="vertical" size={8} className="w-full">
          <Title level={4} className="m-0">
            Active Projects
          </Title>
          <Text type="secondary">View and manage your ongoing projects</Text>
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
            width={150}
          />

          <Table.Column
            title="Budget"
            render={(value, record: ProjectDto) => (
              <Space>
                <DollarOutlined />
                <span>
                  {formatCurrency(record.minBudget || 0)}-
                  {formatCurrency(record.maxBudget || 0)}
                </span>
              </Space>
            )}
            sorter
            width={150}
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
                    nav(`/freelancer/projects/${record.projectId}`);
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

export default FreelancerActiveProject;
