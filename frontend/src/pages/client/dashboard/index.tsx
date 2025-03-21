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

const { Title, Text } = Typography;

const ClientDashboard: React.FC = () => {
  // Get current user identity
  const { data: identity } = useGetIdentity<{ id: number }>();
  const userId = identity?.id;

  // Fetch active projects
  const { data: projectData, isLoading: projectsLoading } = useList({
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
    filters: [
      {
        field: "fromAccount.accountId",
        operator: "eq",
        value: userId,
      },
    ],
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
  const { data: messageData, isLoading: messagesLoading } = useList({
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
  });

  // Get Project IDs for fetching milestones
  const projectIds = useMemo(() => {
    if (!projectData?.data) return [];
    return projectData.data.map((project) => project.projectId);
  }, [projectData]);

  // Fetch milestones for active projects
  const { data: milestoneData, isLoading: milestonesLoading } = useMany({
    resource: "milestones",
    ids: projectIds,
    queryOptions: {
      enabled: projectIds.length > 0,
    },
  });

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    return {
      totalProjects: projectData?.total || 0,
      activeProjects:
        projectData?.data?.filter((p) => p.status === "IN_PROGRESS").length ||
        0,
      totalSpent:
        transactionData?.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) ||
        0,
      pendingMilestones:
        milestoneData?.data?.filter((m) => m.status === "PENDING").length || 0,
    };
  }, [projectData, transactionData, milestoneData]);

  // Get upcoming milestones sorted by deadline
  const upcomingMilestones = useMemo(() => {
    if (!milestoneData?.data) return [];

    return milestoneData.data
      .filter(
        (milestone) =>
          milestone.status === "IN_PROGRESS" || milestone.status === "PENDING"
      )
      .sort((a, b) => dayjs(a.deadline).diff(dayjs(b.deadline)))
      .slice(0, 5);
  }, [milestoneData]);

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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>Client Dashboard</Typography.Title>
        <ClientCreateButton />
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
                      <a href={`/client/projects/${project.projectId}`}>
                        {project.title}
                      </a>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary" className="text-xs">
                          Created:{" "}
                          {dayjs(project.createdAt).format("MMM D, YYYY")}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          Proposals: {project.proposalCount || 0}
                        </Text>
                      </Space>
                    }
                  />
                  <div className="text-right">
                    <Text strong>
                      {formatCurrency(project.estimateBudget || 0)}
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
                          {dayjs(transaction.createdAt).format("MMM D, YYYY")}
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
                color: dayjs(milestone.deadline).isBefore(dayjs())
                  ? "red"
                  : "blue",
                children: (
                  <div>
                    <div className="flex justify-between">
                      <Text strong>{milestone.title}</Text>
                      <Tag color={getStatusColor(milestone.status)}>
                        {milestone.status}
                      </Tag>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        Project:{" "}
                        {projectData?.data?.find(
                          (p) => p.projectId === milestone.projectId
                        )?.title || "Unknown Project"}
                      </Text>
                    </div>
                    <div className="flex justify-between mt-1">
                      <Text type="secondary" className="text-xs">
                        Deadline:{" "}
                        {dayjs(milestone.deadline).format("MMM D, YYYY")}
                      </Text>
                      <Text strong>
                        {formatCurrency(milestone.budget || 0)}
                      </Text>
                    </div>
                  </div>
                ),
              }))}
              locale={{ emptyText: "No upcoming milestones" }}
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
              renderItem={(message) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<MessageOutlined />} />}
                    title={
                      <a href={`/client/projects/${message.projectId}`}>
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
                          {dayjs(message.createdAt).format("MMM D, YYYY HH:mm")}
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
