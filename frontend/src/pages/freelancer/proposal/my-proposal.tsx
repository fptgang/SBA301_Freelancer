import React, { useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Row,
  Col,
  Card,
  Select,
  Tooltip,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useGetIdentity, useList } from "@refinedev/core";
import type { ColumnsType } from "antd/es/table";
import { AccountDto, ProposalDto } from "../../../../generated";
import api from "../../../services/api/openapi-config";
import { useLocation, useNavigate } from "react-router";
import { store } from "../../../store";

const { Title, Text } = Typography;
const { Option } = Select;

const FreelancerMyProposalPage: React.FC = () => {
  const location = useLocation();
  const [projectId, setProjectId] = useState(location.state.projectId);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { data: user } = useGetIdentity<AccountDto>();

  const { data, isLoading, refetch } = useList<ProposalDto>({
    resource: "proposals",
    filters: [
      {
        field: "project.projectId",
        operator: "eq",
        value: projectId || undefined,
      },
      {
        field: "freelancer.accountId",
        operator: "eq",
        value: user?.accountId || undefined,
      },
      {
        field: "status",
        operator: "eq",
        value: statusFilter || undefined,
      },
      {
        field: "project.title",
        operator: "contains",
        value: searchText || undefined,
      },
    ],
    sorters: sortBy
      ? [
          {
            field: sortBy,
            order: sortOrder,
          },
        ]
      : [
          {
            field: "proposalId",
            order: "desc",
          },
        ],
    queryOptions: {
      enabled: !!user,
    },
  });

  const nav = useNavigate();

  const proposals = data?.data || [];

  const statusColors: Record<string, string> = {
    PENDING: "orange",
    ACCEPTED: "green",
    REJECTED: "red",
    WITHDRAWN: "gray",
    COMPLETED: "blue",
  };

  const columns: ColumnsType<ProposalDto> = [
    {
      title: "Project",
      dataIndex: "projectId",
      key: "projectId",
      render: (text: string, record: ProposalDto) => (
        <Tooltip title="View project details">
          <a onClick={() => nav("/projects/" + record.projectId)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (amount: number) => `$${amount}`,
      sorter: true,
    },
    {
      title: "Date Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ProposalDto) => (
        <Space>
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => nav("/freelancer/proposals/" + record.proposalId)}
              type="text"
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <>
              <Tooltip title="Withdraw proposal">
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    api
                      .withdrawProposal({
                        proposalId: record.proposalId || -1,
                      })
                      .then(() => {
                        refetch();
                      })
                  }
                  danger
                  type="text"
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={3}>My Proposals</Title>
          <Text type="secondary">
            Track and manage all your project proposals
          </Text>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search projects"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="ACCEPTED">Accepted</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="WITHDRAWN">Withdrawn</Option>
              <Option value="COMPLETED">Completed</Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={proposals}
          columns={columns}
          rowKey="proposalId"
          loading={isLoading}
          locale={{
            emptyText:
              "No proposals found. Start bidding on projects to see them here!",
          }}
          onChange={(pagination, filters, sorter: any) => {
            setProjectId(undefined);
            if (sorter && sorter.field) {
              setSortBy(sorter.field);
              setSortOrder(sorter.order === "descend" ? "desc" : "asc");
            } else {
              setSortBy(null);
              setSortOrder("asc");
            }
          }}
        />
      </Card>
    </div>
  );
};

export default FreelancerMyProposalPage;
