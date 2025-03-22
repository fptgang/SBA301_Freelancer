import React, { useMemo, useState } from "react";
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
  Button,
} from "antd";
import {
  ProjectOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  FileSearchOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import dayjs from "dayjs";
import { formatCurrency } from "../../../utils/formatter";
import {
  AccountDto,
  ContractDto,
  MessageDto,
  MilestoneDto,
  MilestoneStatusDto,
  ProjectDto,
  ProposalDto,
  ProposalStatusDto,
  TransactionDto,
  TransactionTypeDto,
} from "../../../../generated";
import { store } from "../../../store";
import { useNavigate } from "react-router";
import ContractShowModal from "../../../components/ContractShowModal";

const { Title, Text } = Typography;

const FreelancerDashboardPage: React.FC = () => {
  // Get current user identity
  const { data: user } = useGetIdentity<AccountDto>();
  const userId = user?.accountId;
  const nav = useNavigate();
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number>();

  // Fetch submitted proposals
  const { data: proposalData, isLoading: proposalsLoading } =
    useList<ProposalDto>({
      resource: "proposals",
      pagination: {
        pageSize: 5,
      },
      filters: [
        {
          field: "freelancer.accountId",
          operator: "eq",
          value: user?.accountId || undefined,
        },
      ],
      sorters: [
        {
          field: "updatedAt",
          order: "desc",
        },
      ],
      queryOptions: {
        enabled: !!user,
      },
    });

  // Fetch active contracts
  const { data: contractData, isLoading: contractsLoading } =
    useList<ContractDto>({
      resource: "contracts",
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
  const { data: transactionData, isLoading: transactionsLoading } =
    useList<TransactionDto>({
      resource: "transactions",
      pagination: {
        pageSize: 5,
      },
      filters: [{ field: "type", operator: "eq", value: "ESCROW_RELEASE" }],
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
  const contractProjectIds = useMemo(() => {
    if (!contractData?.data) return [];
    return contractData.data.map((contract) => contract.projectId);
  }, [contractData]);

  // Fetch milestones for active projects
  const { data: contractProjectData, isLoading: projectLoading } =
    useMany<ProjectDto>({
      resource: "projects",
      ids: contractProjectIds.filter((id) => id !== undefined),
      queryOptions: {
        enabled: contractProjectIds.length > 0,
      },
    });

  const proposalProjectIds = useMemo(() => {
    if (!proposalData?.data) return [];
    return proposalData.data.map((contract) => contract.projectId);
  }, [proposalData]);

  // Fetch milestones for active projects
  const { data: proposalProjectData, isLoading: proposalProjectLoading } =
    useMany<ProjectDto>({
      resource: "projects",
      ids: proposalProjectIds.filter((id) => id !== undefined),
      queryOptions: {
        enabled: proposalProjectIds.length > 0,
      },
    });

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const milestones = contractProjectData?.data
      ?.map((p) => p.milestones)
      .flat();
    return {
      totalProposals: proposalData?.total || 0,
      activeContracts: contractData?.total || 0,
      totalEarned:
        transactionData?.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) ||
        0,
      pendingMilestones:
        milestones?.filter(
          (m) => m?.status === "IN_PROGRESS" || m?.status === "PENDING"
        ).length || 0,
    };
  }, [proposalData, contractData, transactionData, contractProjectData]);

  // Get upcoming milestones sorted by deadline
  const upcomingMilestones = useMemo(() => {
    if (!contractProjectData?.data) return [];
    const milestones = contractProjectData?.data
      ?.map((p) => p.milestones)
      .flat();

    return milestones
      .filter(
        (milestone) =>
          milestone?.status === "IN_PROGRESS" || milestone?.status === "PENDING"
      )
      .sort((a, b) => dayjs(a?.deadline).diff(dayjs(b?.deadline)))
      .slice(0, 5);
  }, [contractProjectData]);

  // Define status colors
  const getProposalStatusColor = (status: ProposalStatusDto) => {
    const statusColors: Record<ProposalStatusDto, string> = {
      PENDING: "blue",
      ACCEPTED: "green",
      REJECTED: "red",
      WITHDRAWN: "orange",
      EXPIRED: "gray",
    };
    return statusColors[status] || "default";
  };

  const getMilestoneStatusColor = (status: MilestoneStatusDto) => {
    const statusColors: Record<MilestoneStatusDto, string> = {
      PENDING: "blue",
      IN_PROGRESS: "green",
      TERMINATED: "red",
      FINISHED: "geekblue",
      REVIEWING: "purple",
    };
    return statusColors[status] || "default";
  };
  const getTransactionTypeColor = (type: TransactionTypeDto) => {
    const typeColors: Record<TransactionTypeDto, string> = {
      DEPOSIT: "green",
      WITHDRAWAL: "orange",
      ESCROW_DEPOSIT: "blue",
      ESCROW_RELEASE: "geekblue",
      ESCROW_REFUND: "purple",
    };
    return typeColors[type] || "default";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Typography.Title level={2}>Freelancer Dashboard</Typography.Title>
      </div>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={stats.totalProposals}
              prefix={<FileSearchOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={stats.activeContracts}
              prefix={<ContactsOutlined className="text-green-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Earned"
              value={formatCurrency(stats.totalEarned)}
              prefix={<DollarOutlined className="text-orange-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Milestones"
              value={stats.pendingMilestones}
              prefix={<ClockCircleOutlined className="text-purple-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Proposals */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileSearchOutlined className="text-blue-500" />
                <span>Recent Proposals</span>
              </Space>
            }
            className="mb-6"
          >
            <List
              itemLayout="horizontal"
              dataSource={proposalData?.data || []}
              renderItem={(proposal) => (
                <List.Item
                  actions={[
                    <Tag
                      color={getProposalStatusColor(
                        proposal?.status || "PENDING"
                      )}
                    >
                      {proposal.status}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          nav(`/freelancer/proposals/${proposal.proposalId}`);
                        }}
                      >
                        {proposalProjectData?.data?.find(
                          (p) => p.projectId === proposal.projectId
                        )?.title || "Untitled Project"}
                      </a>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary" className="text-xs">
                          Submitted:{" "}
                          {dayjs(proposal.createdAt).format("MMM D, YYYY")}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          Client:{" "}
                          {contractProjectData?.data?.find(
                            (p) => p.projectId === proposal.projectId
                          )?.client?.firstName || "Unknown"}
                        </Text>
                      </Space>
                    }
                  />
                  <div className="text-right">
                    <Text strong>{formatCurrency(proposal.budget || 0)}</Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "No proposals yet" }}
            />
          </Card>

          {/* Active Contracts */}
          <Card
            title={
              <Space>
                <ContactsOutlined className="text-green-500" />
                <span>Active Contracts</span>
              </Space>
            }
            className="mb-6"
          >
            <List
              itemLayout="horizontal"
              dataSource={contractData?.data || []}
              renderItem={(contract) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          nav(`/freelancer/projects/${contract.projectId}`);
                        }}
                      >
                        {contractProjectData?.data?.find(
                          (p) => p.projectId === contract.projectId
                        )?.title || "Untitled Project"}
                      </a>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Tag
                          color={
                            contract.status === "SIGNED"
                              ? "green"
                              : contract.status === "UNSIGNED"
                              ? "blue"
                              : "red"
                          }
                        >
                          {contract.status}
                        </Tag>
                        <Text type="secondary" className="text-xs">
                          Started:{" "}
                          {dayjs(contract.signedAt).format("MMM D, YYYY")}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          Client:{" "}
                          {contractProjectData?.data?.find(
                            (p) => p.projectId === contract.projectId
                          )?.client?.firstName || "Unknown"}
                        </Text>
                      </Space>
                    }
                  />
                  <div className="text-right">
                    {contract?.status === "UNSIGNED" ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          nav(`/freelancer/contracts/${contract.contractId}`);
                        }}
                      >
                        Sign Contract
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="primary"
                          onClick={() => {
                            setShowContractModal(true);
                            setSelectedContractId(contract.contractId);
                          }}
                        >
                          View Contract
                        </Button>
                      </>
                    )}
                    <br />
                    <Text strong>{formatCurrency(contract.budget || 0)}</Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "No active contracts yet" }}
            />
          </Card>
          {/* Recent Transactions */}
          <Card
            title={
              <Space>
                <DollarOutlined className="text-green-500" />
                <span>Recent Earnings</span>
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
                        <Tag
                          color={getTransactionTypeColor(
                            transaction?.type || "DEPOSIT"
                          )}
                        >
                          {transaction.type}
                        </Tag>
                        <Text>
                          {dayjs(transaction.createdAt).format("MMM D, YYYY")}
                        </Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary" className="text-xs">
                        {transaction.milestone?.title || "Platform Transaction"}
                      </Text>
                    }
                  />
                  <div className="text-right">
                    <Text
                      type={
                        transaction.status === "SUCCESS" ? "success" : "warning"
                      }
                      strong
                    >
                      {formatCurrency(transaction.amount || 0)}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "No earnings yet" }}
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
                  <div>
                    <div className="flex justify-between">
                      <Text
                        strong
                        onClick={() => {
                          nav(`/freelancer/projects/${milestone?.projectId}`);
                        }}
                      >
                        {milestone?.title}
                      </Text>
                      <Tag
                        color={getMilestoneStatusColor(
                          milestone?.status || "PENDING"
                        )}
                      >
                        {milestone?.status}
                      </Tag>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        Project:{" "}
                        {contractProjectData?.data?.find(
                          (p) => p.projectId === milestone?.projectId
                        )?.title || "Unknown Project"}
                      </Text>
                    </div>
                    <div className="flex justify-between mt-1">
                      <Text type="secondary" className="text-xs">
                        Deadline:{" "}
                        {dayjs(milestone?.deadline).format("MMM D, YYYY")}
                      </Text>
                      <Text strong>
                        {formatCurrency(milestone?.contractualBudget || 0)}
                      </Text>
                    </div>
                  </div>
                ),
              }))}
            />
            {upcomingMilestones.length === 0 && (
              <div className="text-center py-4">No upcoming milestones</div>
            )}
          </Card>

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
                      <a
                        onClick={(e) => {
                          e.preventDefault();

                          nav("/message", {
                            state: {
                              projectId: message.projectId,
                            },
                          });
                        }}
                      >
                        {contractProjectData?.data?.find(
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
      <ContractShowModal
        contractId={selectedContractId}
        visible={showContractModal}
        onClose={() => setShowContractModal(false)}
      />
    </div>
  );
};

export default FreelancerDashboardPage;
