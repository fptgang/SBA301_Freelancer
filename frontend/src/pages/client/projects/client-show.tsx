import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  useShow,
  useList,
  useOne,
  useApiUrl,
  useNotification,
  useCustomMutation,
  useGetIdentity,
  useInvalidate,
} from "@refinedev/core";
import {
  Typography,
  Card,
  Space,
  Tag,
  Button,
  Descriptions,
  Steps,
  Empty,
  Skeleton,
  Tabs,
  List,
  Divider,
  Popconfirm,
  Badge,
  Avatar,
  Timeline,
  Row,
  Col,
  Statistic,
  Modal,
  Progress,
  Alert,
} from "antd";
import {
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  StarOutlined,
  CalendarOutlined,
  MailOutlined,
  ToolOutlined,
  TeamOutlined,
  BulbOutlined,
  MessageOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { formatCurrency } from "../../../utils/formatter";
import { ProjectDto } from "../../../../generated/models/ProjectDto";
import { ProposalDto } from "../../../../generated/models/ProposalDto";
import { store } from "../../../store";
import ContractCreateButton from "./contract-create";
import ClientProjectEditButton from "./client-edit";
import api from "../../../services/api/openapi-config";
import { ReportModal } from "../../../components/message/ReportModal";
import { AccountDto } from "../../../../generated";
import DepositModal from "../../../components/DepositModal";
import { useLocalSettings } from "../../../hooks/useLocalSettings";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

// Define MilestoneDetailModal component
interface MilestoneDetailModalProps {
  visible: boolean;
  milestone: any;
  project: ProjectDto;
  onClose: () => void;
  onConfirmCompletion: (milestone: any) => Promise<void>;
  onReport: () => void;
}

const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  visible,
  milestone,
  project,
  onClose,
  onConfirmCompletion,
  onReport,
}) => {
  const [localSettings] = useLocalSettings();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { open } = useNotification();

  const handleConfirm = async () => {
    try {
      setConfirmLoading(true);
      await onConfirmCompletion(milestone);
      onClose();
    } catch (error) {
      console.error("Failed to confirm milestone:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!milestone) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ClockCircleOutlined className="text-blue-500 mr-2" />
          <span>Milestone Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Card className="mb-4">
        <Title level={4}>{milestone.title}</Title>
        <Paragraph className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100 mt-3">
          {milestone.description}
        </Paragraph>

        <Descriptions layout="vertical" className="mt-4" bordered>
          <Descriptions.Item label="Status">
            <Tag
              color={
                milestone.status === "FINISHED"
                  ? "green"
                  : milestone.status === "IN_PROGRESS"
                  ? "blue"
                  : milestone.status === "REVIEWING"
                  ? "orange"
                  : "default"
              }
            >
              {milestone.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Budget Allocation">
            <Progress
              percent={milestone.budgetRatio ? milestone.budgetRatio * 100 : 0}
              size="small"
              status="active"
              format={(percent) => `${percent?.toFixed(0)}%`}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {milestone.deadline
              ? localSettings.formatDateTime(milestone.deadline)
              : "Not set"}
          </Descriptions.Item>
        </Descriptions>

        {/* Deliverable Files Section */}
        {milestone.deliverables && milestone.deliverables.length > 0 && (
          <div className="mt-4">
            <Title level={5} className="mb-3">
              <FileTextOutlined className="mr-2" /> Deliverable Files
            </Title>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <List
                itemLayout="horizontal"
                dataSource={milestone.deliverables}
                renderItem={(file: any, index: number) => (
                  <List.Item
                    key={index}
                    className="border-b border-gray-100 last:border-0 py-3"
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() =>
                          handleFileDownload(file.fileUrl, file.fileName)
                        }
                        icon={<FileTextOutlined />}
                      >
                        Download
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<FileTextOutlined />}
                          size="large"
                          className={`${
                            file.fileType?.includes("image")
                              ? "bg-blue-500"
                              : file.fileType?.includes("pdf")
                              ? "bg-red-500"
                              : file.fileType?.includes("word") ||
                                file.fileType?.includes("doc")
                              ? "bg-indigo-500"
                              : file.fileType?.includes("excel") ||
                                file.fileType?.includes("sheet")
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                      }
                      title={
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {file.fileName}
                        </a>
                      }
                      description={
                        <div className="text-xs text-gray-500">
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "Unknown size"}
                          </span>
                          {file.uploadDate && (
                            <span className="ml-3">
                              Uploaded:{" "}
                              {localSettings.formatDate(file.uploadDate)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* Files Preview Section - Show if there are files */}
        {milestone.files && milestone.files.length > 0 && (
          <div className="mt-4">
            <Title level={5} className="mb-3">
              <FileTextOutlined className="mr-2" /> Attachments
            </Title>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <List
                itemLayout="horizontal"
                dataSource={milestone.files}
                renderItem={(file: any, index: number) => (
                  <List.Item
                    key={index}
                    className="border-b border-gray-100 last:border-0 py-3"
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() =>
                          handleFileDownload(file.fileUrl, file.fileName)
                        }
                        icon={<FileTextOutlined />}
                      >
                        Download
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<FileTextOutlined />}
                          size="large"
                          className={`${
                            file.fileType?.includes("image")
                              ? "bg-blue-500"
                              : file.fileType?.includes("pdf")
                              ? "bg-red-500"
                              : file.fileType?.includes("word") ||
                                file.fileType?.includes("doc")
                              ? "bg-indigo-500"
                              : file.fileType?.includes("excel") ||
                                file.fileType?.includes("sheet")
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                      }
                      title={
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {file.fileName}
                        </a>
                      }
                      description={
                        <div className="text-xs text-gray-500">
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "Unknown size"}
                          </span>
                          {file.uploadDate && (
                            <span className="ml-3">
                              Uploaded:{" "}
                              {localSettings.formatDate(file.uploadDate)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* Only show actions if milestone is in REVIEWING status and contract is not already signed */}
        {milestone.status === "REVIEWING" &&
          !project?.reports?.find((rp) => rp.status != "SOLVED") && (
            <div className="mt-6 flex justify-end space-x-3">
              <Button danger onClick={onReport}>
                Report Issue
              </Button>
              <Popconfirm
                title="Confirm milestone completion"
                description="This action will release the payment to the freelancer."
                icon={<ExclamationCircleOutlined style={{ color: "green" }} />}
                onConfirm={handleConfirm}
                okText="Yes, Complete"
                cancelText="Cancel"
                okButtonProps={{ loading: confirmLoading }}
              >
                <Button type="primary">Confirm Completion</Button>
              </Popconfirm>
            </div>
          )}
      </Card>
    </Modal>
  );
};

const ClientProjectShow: React.FC = () => {
  const [localSettings] = useLocalSettings();
  const { data: user, refetch } = useGetIdentity<AccountDto>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const invalidate = useInvalidate();
  const { mutate: rejectProposal } = useCustomMutation();
  const { mutate: terminateProject } = useCustomMutation();
  const { mutate: completeMilestone } = useCustomMutation();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneDetailVisible, setMilestoneDetailVisible] = useState(false);

  // Fetch project data
  const { queryResult: projectQueryResult } = useShow<ProjectDto>({
    resource: "projects",
    id,
    queryOptions: {
      enabled: !!user,
    },
  });

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = projectQueryResult;
  const project = projectData?.data;

  // Fetch project category
  const { data: categoryData, isLoading: isCategoryLoading } = useOne({
    resource: "project-categories",
    id: project?.projectCategory?.projectCategoryId || "",
    queryOptions: {
      enabled: !!project?.projectCategory,
    },
  });

  // Fetch proposals for this project
  const { data: proposalsData, isLoading: isProposalsLoading } =
    useList<ProposalDto>({
      resource: "proposals",
      filters: [
        {
          field: "project.projectId",
          operator: "eq",
          value: id,
        },
      ],
    });

  const proposals = proposalsData?.data || [];

  // Project status mapping for visual elements
  const statusMap = {
    OPEN: { color: "blue", text: "Open", step: 0, icon: <BulbOutlined /> },
    IN_PROGRESS: {
      color: "orange",
      text: "In Progress",
      step: 1,
      icon: <ClockCircleOutlined />,
    },
    TERMINATED: {
      color: "red",
      text: "Terminated",
      step: 2,
      icon: <CloseCircleOutlined />,
    },
    FINISHED: {
      color: "green",
      text: "Finished",
      step: 2,
      icon: <CheckCircleOutlined />,
    },
    PAUSED: {
      color: "default",
      text: "Paused",
      step: 0,
      icon: <PlayCircleOutlined />,
    },
  };

  // Handle opening the milestone detail modal
  const handleShowMilestoneDetail = (milestone: any) => {
    setSelectedMilestone(milestone);
    setMilestoneDetailVisible(true);
  };

  // Handle rejecting a proposal
  const handleRejectProposal = async (proposalId: number) => {
    try {
      rejectProposal({
        url: `proposals/${proposalId}/reject`,
        method: "put",
        values: {},
        successNotification: () => {
          return {
            type: "success",
            message: "Proposal rejected",
          };
        },
        errorNotification: () => {
          return {
            type: "error",
            message: "Failed to reject proposal",
          };
        },
      });

      // Manually invalidate the cache after successful mutation
      invalidate({
        resource: "proposals",
        invalidates: ["list", "many", "detail"],
      });
      invalidate({
        resource: "projects",
        id,
        invalidates: ["detail"],
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to reject proposal",
      });
    }
  };

  // Handle terminating a project
  const handleTerminateProject = async () => {
    try {
      await api.terminateProject({
        projectId: project?.projectId ?? -1,
      });

      open?.({
        type: "success",
        message: "Project closed successfully",
      });

      // Manually invalidate the cache after successful mutation
      invalidate({
        resource: "projects",
        id,
        invalidates: ["detail", "list"],
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to close project",
      });
    }
  };

  const confirmComplete = async (milestone: any) => {
    try {
      // Check if user has enough balance for next milestone
      if (!project?.milestones) return;

      const nextMilestone = project.milestones.find(
        (m) =>
          (m.milestoneId || 0) > (milestone.milestoneId || 0) &&
          m.status == "PENDING"
      );
      if (nextMilestone && project.contract?.budget) {
        const requiredAmount =
          (nextMilestone.budgetRatio || 0) * project.contract?.budget;

        if ((user?.balance || 0) < requiredAmount) {
          setSelectedMilestone(milestone);
          setShowDepositModal(true);
          open?.({
            type: "error",
            message: "Not enough balance for next milestone",
          });
          return;
        }
      }

      await api.confirmMilestoneWork({
        milestoneId: milestone.milestoneId,
      });

      open?.({
        type: "success",
        message: "Milestone completed",
      });

      // Manually invalidate the cache after successful mutation
      invalidate({
        resource: "projects",
        id,
        invalidates: ["detail"],
      });
      invalidate({
        resource: "milestones",
        invalidates: ["list", "many"],
      });
    } catch (e) {
      console.error(e);
      open?.({
        type: "error",
        message: "Failed to accept milestone",
      });
      throw e; // Re-throw to handle in the UI
    }
  };

  const handleDeposit = async (milestone: any) => {
    if (user?.balance! < project?.contract?.budget! * milestone.budgetRatio!) {
      open?.({
        type: "error",
        message: "Not enough balance to deposit for this milestone",
      });
      setShowDepositModal(true);
      return;
    }
    try {
      api
        .depositMilestoneFund({
          milestoneId: milestone.milestoneId,
        })
        .then(() => {
          open?.({
            type: "success",
            message: "Deposit successful",
          });
          refetch();
          refetchProject();
        });
    } catch (e) {
      console.error(e);
      open?.({
        type: "error",
        message: "Failed to deposit",
      });
      throw e;
    }
  };

  // Render loading state
  if (isProjectLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Skeleton active paragraph={{ rows: 12 }} />
        </div>
      </div>
    );
  }

  // Render error state
  if (isProjectError || !project) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <Empty
            description="Project not found or you don't have permission to view it"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <div className="mt-4">
            <Button type="primary" onClick={() => navigate("/client/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get current status details
  const currentStatus =
    statusMap[project.status as keyof typeof statusMap] || statusMap.OPEN;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Project Header - Full width with accent color */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <ProjectOutlined className="text-blue-500 text-2xl mr-3" />
              <div>
                <Title level={3} className="mb-0 text-gray-800">
                  {project.title}
                </Title>
                <Space className="mt-1">
                  <Tag
                    color={currentStatus.color}
                    className="flex items-center text-sm px-3 py-1"
                  >
                    {currentStatus.icon}
                    <span className="ml-1">{currentStatus.text}</span>
                  </Tag>
                  {!isCategoryLoading && categoryData?.data && (
                    <Tag color="default">{categoryData.data.name}</Tag>
                  )}
                </Space>
              </div>
            </div>
            <div>
              <Space>
                {project?.reports?.find((rp) => rp.status !== "SOLVED") && (
                  <Alert message="Reported" type="warning" showIcon />
                )}
              </Space>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                type="default"
                onClick={() => navigate("/client/projects")}
                icon={<ArrowLeftOutlined />}
              >
                Back
              </Button>

              {/* Add Edit Button Here */}
              {project.status === "OPEN" && (
                <ClientProjectEditButton
                  project={project}
                  onSuccess={projectQueryResult.refetch}
                />
              )}
              {project.status === "IN_PROGRESS" && (
                <Button
                  type="primary"
                  danger
                  style={{ marginLeft: 8 }}
                  onClick={() => setShowReportModal(true)}
                  disabled={
                    project?.reports?.find((rp) => rp.status !== "SOLVED")
                      ? true
                      : false
                  }
                >
                  Report
                </Button>
              )}

              {project.status === "OPEN" && (
                <Popconfirm
                  title="Are you sure you want to close this project?"
                  onConfirm={handleTerminateProject}
                  okText="Yes"
                  cancelText="No"
                  placement="bottomRight"
                >
                  <Button type="primary" danger>
                    Close Project
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Project Progress */}
        <Card className="mb-6 shadow-sm">
          <Steps current={currentStatus.step} className="py-2">
            <Step
              title="Open"
              description="Project Posted"
              icon={<BulbOutlined />}
            />
            <Step
              title="In Progress"
              description="Freelancer Assigned"
              icon={<TeamOutlined />}
            />
            <Step
              title="Completed"
              description="Project Finished"
              icon={<CheckCircleOutlined />}
            />
          </Steps>
        </Card>

        {/* Project Stats */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Proposals Received"
                value={proposals.length}
                valueStyle={{ color: "#1890ff" }}
                prefix={<TeamOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Created On"
                value={
                  project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"
                }
                prefix={<CalendarOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Budget Range"
                value={`$${project.minBudget} - $${project.maxBudget}`}
                valueStyle={{ fontSize: "16px" }}
                prefix={<DollarOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Start Date"
                value={
                  project.startDate
                    ? new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"
                }
                valueStyle={{ fontSize: "16px" }}
                prefix={<CalendarOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
        </Row>

        {/* Project Details & Proposals Tabs */}
        <Card className="shadow-sm">
          <Tabs
            defaultActiveKey="details"
            className="custom-tabs"
            animated={true}
          >
            <TabPane
              tab={
                <span className="px-1">
                  <FileTextOutlined /> Details
                </span>
              }
              key="details"
            >
              <div className="py-2">
                <Title level={5} className="text-blue-600">
                  Project Description
                </Title>
                <Paragraph className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-100">
                  {project.description}
                </Paragraph>

                <Divider />

                <Title level={5} className="text-blue-600">
                  Required Skills
                </Title>
                {project.requiredSkills && project.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.requiredSkills.map((projectSkill, index) => (
                      <Tag
                        key={projectSkill.projectSkillId || index}
                        color="blue"
                        className="flex items-center px-3 py-1 rounded-full"
                      >
                        <ToolOutlined className="mr-1" />
                        {projectSkill.skill?.name} - {projectSkill.proficiency}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary" className="italic">
                    No specific skills required
                  </Text>
                )}

                <Divider />

                <Title level={5} className="text-blue-600">
                  Milestones
                </Title>
                {project.milestones && project.milestones.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={project.milestones}
                    renderItem={(milestone, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar size="large">{index + 1}</Avatar>}
                          title={
                            <div className="flex justify-between">
                              <span>{milestone.title}</span>
                              <span>
                                Budget:{" "}
                                {milestone.budgetRatio
                                  ? (milestone.budgetRatio * 100).toFixed(0)
                                  : 0}
                                %
                              </span>
                            </div>
                          }
                          description={
                            <div>
                              <div>{milestone.description}</div>
                              <div className="mt-1">
                                <CalendarOutlined /> Deadline:{" "}
                                {localSettings.formatDateTime(
                                  milestone.deadline!
                                )}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary" className="italic">
                    No milestones defined
                  </Text>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="px-1">
                  <TeamOutlined /> Proposals ({proposals.length})
                </span>
              }
              key="proposals"
            >
              {isProposalsLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : proposals.length === 0 ? (
                <div className="py-12 text-center">
                  <Empty
                    description={
                      <span className="text-gray-500">
                        No proposals received yet
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={proposals}
                  className="proposal-list"
                  renderItem={(proposal) => (
                    <List.Item
                      key={proposal.proposalId}
                      className="bg-white hover:bg-gray-50 transition-colors rounded-lg p-5 mb-4 border border-gray-100"
                      actions={
                        proposal.status === "PENDING"
                          ? [
                              <div className="flex justify-end space-x-3 mt-4">
                                <Popconfirm
                                  title="Are you sure you want to reject this proposal?"
                                  onConfirm={() =>
                                    handleRejectProposal(
                                      proposal.proposalId || -1
                                    )
                                  }
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <Button danger>Reject Proposal</Button>
                                </Popconfirm>
                                <ContractCreateButton
                                  proposalId={proposal.proposalId || 0}
                                  projectTitle={project.title || ""}
                                  freelancerName={
                                    proposal.freelancer?.firstName +
                                      " " +
                                      proposal.freelancer?.lastName || ""
                                  }
                                  milestoneAmount={
                                    (proposal.budget || 0) *
                                    (project?.milestones?.[0]?.budgetRatio || 0)
                                  }
                                  onSubmit={projectQueryResult.refetch}
                                />
                              </div>,
                            ]
                          : []
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            size={64}
                            className="bg-blue-500"
                            src={proposal.freelancer?.avatarUrl}
                          />
                        }
                        title={
                          <div className="flex justify-between items-center">
                            <Text strong className="text-lg">
                              {`${proposal.freelancer?.firstName} ${proposal.freelancer?.lastName}`}
                            </Text>
                            <div className="flex items-center">
                              <Tag color="blue">Budget: ${proposal.budget}</Tag>
                              <Badge
                                status={
                                  proposal.status === "ACCEPTED"
                                    ? "success"
                                    : proposal.status === "REJECTED"
                                    ? "error"
                                    : "processing"
                                }
                                text={
                                  <span className="font-medium">
                                    {proposal.status}
                                  </span>
                                }
                                className="ml-2"
                              />
                            </div>
                          </div>
                        }
                        description={
                          <div className="mt-2 text-gray-600">
                            <div className="flex items-center mb-1">
                              <CalendarOutlined className="mr-2" />
                              Submitted{" "}
                              {proposal.createdAt
                                ? new Date(
                                    proposal.createdAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </div>
                            <div className="flex items-center">
                              <MessageOutlined className="mr-2" />
                              Proposal #{proposal.proposalId}
                            </div>
                          </div>
                        }
                      />

                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <Title level={5} className="text-gray-700">
                          Proposal Notes
                        </Title>
                        <Paragraph
                          ellipsis={{
                            rows: 3,
                            expandable: true,
                            symbol: "more",
                          }}
                        >
                          {proposal.notes}
                        </Paragraph>
                      </div>

                      {proposal.files && proposal.files.length > 0 && (
                        <div className="mt-4">
                          <Title level={5} className="text-gray-700">
                            Attachments
                          </Title>
                          <List
                            size="small"
                            dataSource={proposal.files}
                            renderItem={(file) => (
                              <List.Item>
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-500 hover:text-blue-700"
                                >
                                  <FileTextOutlined className="mr-2" />
                                  {file.fileName}
                                </a>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                    </List.Item>
                  )}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <span className="px-1">
                  <ClockCircleOutlined /> Milestones
                </span>
              }
              key="milestones"
            >
              {project.milestones && project.milestones.length > 0 ? (
                <Timeline className="mt-4 px-4">
                  {project.milestones.map((milestone, index) => (
                    <Timeline.Item
                      key={milestone.milestoneId || index}
                      color={
                        milestone.status === "FINISHED"
                          ? "green"
                          : milestone.status === "IN_PROGRESS"
                          ? "blue"
                          : milestone.status === "REVIEWING"
                          ? "orange"
                          : "gray"
                      }
                    >
                      <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
                        <Row>
                          <Col
                            span={18}
                            onClick={() => handleShowMilestoneDetail(milestone)}
                          >
                            <Title level={5}>{milestone.title}</Title>
                            <Paragraph>{milestone.description}</Paragraph>
                            <div className="flex gap-4 mt-2">
                              <Tag color="blue">
                                Budget:{" "}
                                {project.contract
                                  ? formatCurrency(
                                      project.contract.budget! *
                                        milestone.budgetRatio!
                                    )
                                  : milestone.budgetRatio
                                  ? (milestone.budgetRatio * 100).toFixed(0) +
                                    "%"
                                  : 0}
                              </Tag>
                              <Text type="secondary">
                                <CalendarOutlined className="mr-1" />
                                Deadline:{" "}
                                {localSettings.formatDate(milestone.deadline!)}
                              </Text>
                              {milestone.status && (
                                <Tag
                                  color={
                                    milestone.status === "FINISHED"
                                      ? "green"
                                      : milestone.status === "IN_PROGRESS"
                                      ? "blue"
                                      : milestone.status === "REVIEWING"
                                      ? "orange"
                                      : "default"
                                  }
                                >
                                  {milestone.status}
                                </Tag>
                              )}
                            </div>
                          </Col>
                          <Col span={6} className="flex justify-end">
                            {milestone.status === "REVIEWING" && (
                              <Button
                                type="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowMilestoneDetail(milestone);
                                }}
                              >
                                View Details
                              </Button>
                            )}
                            {milestone.status === "PENDING" &&
                              milestone.fundStatus != "DEPOSITED" && (
                                <Popconfirm
                                  title="Are you sure you want to deposit for this milestone?"
                                  onConfirm={() => handleDeposit(milestone)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <Button type="primary">Deposit</Button>
                                </Popconfirm>
                              )}
                          </Col>
                        </Row>
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <div className="py-8 text-center">
                  <Empty
                    description={
                      <span className="text-gray-500">
                        No milestones created yet for this project
                      </span>
                    }
                  />
                  {project.status === "IN_PROGRESS" && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="mt-4"
                    >
                      Create Milestone
                    </Button>
                  )}
                </div>
              )}
            </TabPane>
          </Tabs>
        </Card>
      </div>
      {user?.role == "CLIENT" ? (
        <>
          <ReportModal
            showReportModal={showReportModal}
            setShowReportModal={setShowReportModal}
            project={project}
          />
          <DepositModal
            visible={showDepositModal}
            onClose={() => {
              setShowDepositModal(false);
              setSelectedMilestone(null);
            }}
          />
          <MilestoneDetailModal
            visible={milestoneDetailVisible}
            milestone={selectedMilestone}
            project={project}
            onClose={() => {
              setMilestoneDetailVisible(false);
              setSelectedMilestone(null);
            }}
            onConfirmCompletion={confirmComplete}
            onReport={() => {
              setMilestoneDetailVisible(false);
              setShowReportModal(true);
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export default ClientProjectShow;
