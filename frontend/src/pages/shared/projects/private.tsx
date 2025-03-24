import React, {useEffect, useState} from "react";
import {AccountDto, ProjectDto, ProposalDto} from "../../../../generated";
import {
  Avatar, Badge,
  Button,
  Card, Col,
  Descriptions, Divider, Empty, List,
  Modal, Popconfirm,
  Progress, Row, Skeleton, Space, Statistic,
  Steps,
  Tabs,
  Tag, Timeline,
  Typography
} from "antd";
import {useLocalSettings} from "../../../hooks/useLocalSettings";
import {
  useCustomMutation,
  useGetIdentity,
  useInvalidate, useList,
  useNotification, useOne, useShow
} from "@refinedev/core";
import api from "../../../services/api/openapi-config";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined, MessageOutlined,
  PlayCircleOutlined, PlusOutlined,
  ProjectOutlined,
  TeamOutlined,
  ToolOutlined, UserOutlined
} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router";
import ClientProjectEditButton from "../../client/projects/client-edit";
import ContractCreateButton from "../../client/projects/contract-create";
import {ReportModal} from "../../../components/message/ReportModal";
import DepositModal from "../../../components/DepositModal";
import ProjectProgress from "./private/project-progress";
import ProjectStats from "./private/project-stats";
import ProjectToTerminate from "./private/project-to-terminate";
import TabProjectDetail from "./private/tab-project-detail";
import TabMilestones from "./private/tab-milestones";
import TabProposals from "./private/tab-proposals";
import ModalProfile from "./private/modal-profile";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const ProjectInternalDetail: React.FC<{ project: ProjectDto }> = ({ project }) => {
  
  
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileIdModal, setProfileIdModal] = useState(0);
  
  
  
  
  
  
  
  
  const [localSettings] = useLocalSettings();
  const { data: user } = useGetIdentity<AccountDto>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const invalidate = useInvalidate();
  const { mutate: rejectProposal } = useCustomMutation();
  const { mutate: terminateProject } = useCustomMutation();
  const { mutate: completeMilestone } = useCustomMutation();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

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
  } = projectQueryResult;

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
        if (user?.balance && user.balance < requiredAmount) {
          // setSelectedMilestone(milestone);
          setShowDepositModal(true);
          open?.({
            type: "error",
            message: "Not enough balance to complete milestone",
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

  const openProfile = (profileId: number) => {
    setProfileIdModal(profileId);
    setShowProfileModal(true);
  };

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
                    className="flex items-center"
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
        {/* Project ToTerminate */}
        <ProjectToTerminate project={project} />

        {/* Project Progress */}
        <ProjectProgress project={project} />

        {/* Project Stats */}
        <ProjectStats project={project} />

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
            <TabProjectDetail project={project} />
          </TabPane>

            <TabPane
              tab={
                <span className="px-1">
                  <ClockCircleOutlined /> Milestones
                </span>
              }
              key="milestones"
            >
              <TabMilestones project={project} />
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
                <TabProposals project={project} openProfile={openProfile}/>
              )}
            </TabPane>
          </Tabs>
        </Card>
      </div>
      {user?.role == "CLIENT" ? (
        <>
          <ModalProfile
            profileId={profileIdModal}
            visible={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />
          <ReportModal
            showReportModal={showReportModal}
            setShowReportModal={setShowReportModal}
            project={project}
          />
          <DepositModal
            visible={showDepositModal}
            onClose={() => {
              setShowDepositModal(false);
              // setSelectedMilestone(null);
            }}
          />
          {/*<MilestoneDetailModal*/}
          {/*  visible={milestoneDetailVisible}*/}
          {/*  milestone={selectedMilestone}*/}
          {/*  project={project}*/}
          {/*  onClose={() => {*/}
          {/*    setMilestoneDetailVisible(false);*/}
          {/*    setSelectedMilestone(null);*/}
          {/*  }}*/}
          {/*  onConfirmCompletion={confirmComplete}*/}
          {/*  onReport={() => {*/}
          {/*    setMilestoneDetailVisible(false);*/}
          {/*    setShowReportModal(true);*/}
          {/*  }}*/}
          {/*/>*/}
        </>
      ) : null}
    </div>
  );
};

export default ProjectInternalDetail;
