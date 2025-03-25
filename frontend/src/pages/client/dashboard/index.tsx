import React, { useMemo } from "react";
import { useList, useCustom, useGetIdentity, useMany } from "@refinedev/core";
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  Table,
  List,
  Space,
  Tag,
  Avatar,
  Timeline,
  Divider,
} from "antd";
import {
  ProjectOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import dayjs from "dayjs";
import { formatCurrency } from "../../../utils/formatter";
import ClientCreateButton from "../projects/client-create";
import { AccountDto, MessageDto, ProjectDto } from "../../../../generated";
import { useNavigate } from "react-router";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Title, Text } = Typography;

const ClientDashboard: React.FC = () => {
  const [localSettings] = useLocalSettings();
  // Get current user identity
  const { data: user } = useGetIdentity<AccountDto>();
  const userId = user?.accountId;
  const nav = useNavigate();

  // Fetch active projects
  const {
    data: projectData,
    isLoading: projectsLoading,
    refetch: projectRefetch,
  } = useList<ProjectDto>({
    resource: "projects",
    filters: [
      {
        field: "client.accountId",
        operator: "eq",
        value: userId,
      },
    ],
    pagination: {
      pageSize: 5,
    },
    queryOptions: {
      enabled: !!userId,
    },
    sorters: [
      {
        field: "updatedAt",
        order: "desc",
      },
    ],
  });

  // Fetch latest transactions
  const { data: transactionData, isLoading: transactionsLoading } = useList({
    resource: "transactions",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
  });

  // Fetch latest messages
  const { data: messageData, isLoading: messagesLoading } = useList<MessageDto>(
    {
      resource: "messages",
      pagination: {
        pageSize: 5,
      },
      sorters: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    }
  );

  // Get Project IDs for fetching milestones
  const projectIds = useMemo(() => {
    if (!projectData?.data) return [];
    return projectData.data.map((project) => project.projectId);
  }, [projectData]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const milestones = projectData?.data?.map((p) => p.milestones).flat();
    return {
      totalProjects: projectData?.total || 0,
      activeProjects:
        projectData?.data?.filter((p) => p.status === "IN_PROGRESS").length ||
        0,
      totalSpent:
        transactionData?.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) ||
        0,
      pendingMilestones:
        milestones?.filter(
          (m) => m?.status === "IN_PROGRESS" || m?.status === "PENDING"
        ).length || 0,
    };
  }, [projectData, transactionData, projectData]);

  // Define status colors
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      OPEN: "blue",
      IN_PROGRESS: "processing",
      TERMINATED: "error",
      FINISHED: "success",
      PENDING: "warning",
    };
    return statusColors[status] || "default";
  };

  const getTransactionTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      DEPOSIT: "green",
      WITHDRAWAL: "orange",
      ESCROW_DEPOSIT: "blue",
      ESCROW_RELEASE: "geekblue",
      FEE: "red",
    };
    return typeColors[type] || "default";
  };
  const upcomingMilestones = useMemo(() => {
    if (!projectData?.data) return [];
    const milestones = projectData?.data?.map((p) => p.milestones).flat();

    return milestones
      .filter(
        (milestone) =>
          milestone?.status === "IN_PROGRESS" || milestone?.status === "PENDING"
      )
      .sort((a, b) => dayjs(a?.deadline).diff(dayjs(b?.deadline)))
      .slice(0, 5);
  }, [projectData]);
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>Client Dashboard</Typography.Title>
        <ClientCreateButton refetch={projectRefetch} />
      </div>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.totalProjects}
              prefix={<ProjectOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.activeProjects}
              prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Spent"
              value={formatCurrency(stats.totalSpent)}
              prefix={<DollarOutlined className="text-orange-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Milestones"
              value={stats.pendingMilestones}
              prefix={<ClockCircleOutlined className="text-purple-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Projects */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ProjectOutlined className="text-blue-500" />
                <span>Recent Projects</span>
              </Space>
            }
            className="mb-6"
          >
            <List
              itemLayout="horizontal"
              dataSource={projectData?.data || []}
              renderItem={(project) => (
                <List.Item
                  actions={[
                    <Tag color={getStatusColor(project.status)}>
                      {project.status}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <a
                        onClick={(e) => {
                          nav(`/client/projects/${project.projectId}`);
                        }}
                      >
                        {project.title}
                      </a>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary" className="text-xs">
                          Created: {localSettings.formatDate(project.createdAt)}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          Proposals: {project.proposalCount || 0}
                        </Text>
                      </Space>
                    }
                  />
                  <div className="text-right">
                    <Text strong>
                      {formatCurrency(project.minBudget || 0)}-
                      {formatCurrency(project.maxBudget || 0)}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "No projects yet" }}
            />
          </Card>

          {/* Recent Transactions */}
          <Card
            title={
              <Space>
                <DollarOutlined className="text-green-500" />
                <span>Recent Transactions</span>
              </Space>
            }
            className="mb-6"
          >
            <List
              itemLayout="horizontal"
              dataSource={transactionData?.data || []}
              renderItem={(transaction) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={getTransactionTypeColor(transaction.type)}>
                          {transaction.type}
                        </Tag>
                        <Text>
                          {localSettings.formatDateTime(transaction.createdAt)}
                        </Text>
                      </Space>
                    }
                    description={`Transaction ID: ${transaction.transactionId}`}
                  />
                  <div className="text-right">
                    <Text
                      type={
                        transaction.status === "SUCCESS" ? "success" : "danger"
                      }
                      strong
                    >
                      {formatCurrency(transaction.amount || 0)}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "No transactions yet" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* Upcoming Milestones */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined className="text-orange-500" />
                <span>Upcoming Milestones</span>
              </Space>
            }
            className="mb-6"
          >
            <Timeline
              items={upcomingMilestones.map((milestone) => ({
                color: dayjs(milestone?.deadline).isBefore(dayjs())
                  ? "red"
                  : "blue",
                children: (
                  <a
                    onClick={() => {
                      nav(`/client/projects/${milestone?.projectId}`);
                    }}
                  >
                    <div className="flex justify-between">
                      <Text strong>{milestone?.title}</Text>
                      <Tag color={getStatusColor(milestone?.status)}>
                        {milestone?.status}
                      </Tag>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        Project:{" "}
                        {projectData?.data?.find(
                          (p) => p.projectId === milestone?.projectId
                        )?.title || "Unknown Project"}
                      </Text>
                    </div>
                    <div className="flex justify-between mt-1">
                      <Text type="secondary" className="text-xs">
                        Deadline:{" "}
                        {localSettings.formatDateTime(milestone?.deadline)}
                      </Text>
                    </div>
                  </a>
                ),
              }))}
            />
            {upcomingMilestones.length === 0 && (
              <div className="text-center py-4">No upcoming milestones</div>
            )}
          </Card>

          {/* Recent Messages */}
          <Card
            title={
              <Space>
                <MessageOutlined className="text-blue-500" />
                <span>Recent Messages</span>
              </Space>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={messageData?.data || []}
              loading={messagesLoading}
              renderItem={(message: MessageDto) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<MessageOutlined />} />}
                    title={
                      <a
                        onClick={() =>
                          nav("/message", {
                            state: {
                              projectId: message.projectId,
                            },
                          })
                        }
                      >
                        {projectData?.data?.find(
                          (p) => p.projectId === message.projectId
                        )?.title || "Unknown Project"}
                      </a>
                    }
                    description={
                      <div>
                        <Text className="text-xs line-clamp-2">
                          {message.content}
                        </Text>
                        <Text type="secondary" className="text-xs block mt-1">
                          {localSettings.formatDateTime(message.createdAt)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "No messages yet" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientDashboard;
