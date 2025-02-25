import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  useShow, 
  useList,
  useOne,
  useApiUrl,
  useNotification
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
  Statistic
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
  PlusOutlined
} from "@ant-design/icons";

import { formatCurrency } from "../../../utils/formatter";
import { ProjectDto } from "../../../../generated/models/ProjectDto";
import { ProposalDto } from "../../../../generated/models/ProposalDto";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const ClientProjectShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  
  // Fetch project data
  const { queryResult: projectQueryResult } = useShow<ProjectDto>({
    resource: "projects",
    id,
  });
  
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = projectQueryResult;
  const project = projectData?.data;
  
  // Fetch project category
  const { data: categoryData, isLoading: isCategoryLoading } = useOne({
    resource: "projectCategories",
    id: project?.projectCategoryId || "",
    queryOptions: {
      enabled: !!project?.projectCategoryId,
    },
  });
  
  // Fetch proposals for this project
  const { data: proposalsData, isLoading: isProposalsLoading } = useList<ProposalDto>({
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
    IN_PROGRESS: { color: "orange", text: "In Progress", step: 1, icon: <ClockCircleOutlined /> },
    TERMINATED: { color: "red", text: "Terminated", step: 2, icon: <CloseCircleOutlined /> },
    FINISHED: { color: "green", text: "Finished", step: 2, icon: <CheckCircleOutlined /> },
  };
  
  // Handle accepting a proposal
  const handleAcceptProposal = async (proposalId: number) => {
    // Implementation would go here to accept a proposal
    try {
      open?.({
        type: "success",
        message: "Proposal accepted successfully",
        description: "The freelancer has been notified and the project is now in progress",
      });
      
      // Refresh data after successful operation
      projectQueryResult.refetch();
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to accept proposal",
        description: "Please try again later",
      });
    }
  };
  
  // Handle rejecting a proposal
  const handleRejectProposal = async (proposalId: number) => {
    // Implementation would go here to reject a proposal
    try {
      open?.({
        type: "success",
        message: "Proposal rejected",
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to reject proposal",
      });
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
  const currentStatus = statusMap[project.status as keyof typeof statusMap] || statusMap.OPEN;
  
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
                  <Tag color={currentStatus.color} className="flex items-center text-sm px-3 py-1">
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
                icon={<ArrowLeftOutlined   />}
              >
                Back
              </Button>
              {project.status === "OPEN" && (
                <Button 
                  type="primary" 
                  danger
                  onClick={() => {
                    // Logic to close project
                  }}
                >
                  Close Project
                </Button>
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
          <Col xs={24} sm={12} md={8}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Proposals Received"
                value={proposals.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<TeamOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Created On"
                value={new Date(project.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
                prefix={<CalendarOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full shadow-sm">
              <Statistic
                title="Project ID"
                value={`#${project.projectId}`}
                valueStyle={{ fontSize: '18px' }}
                prefix={<ProjectOutlined />}
                className="text-center"
              />
            </Card>
          </Col>
        </Row>
        
        {/* Project Details & Proposals Tabs */}
        <Card className="shadow-sm">
          <Tabs defaultActiveKey="details" className="custom-tabs" animated={true}>
            <TabPane 
              tab={
                <span className="px-1">
                  <FileTextOutlined /> Details
                </span>
              } 
              key="details"
            >
              <div className="py-2">
                <Title level={5} className="text-blue-600">Project Description</Title>
                <Paragraph className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-100">
                  {project.description}
                </Paragraph>
                
                <Divider />
                
                <Title level={5} className="text-blue-600">Required Skills</Title>
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
                  <Text type="secondary" className="italic">No specific skills required</Text>
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
                      <span className="text-gray-500">No proposals received yet</span>
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
                        proposal.status === "PENDING" ?
                        [
                          <div className="flex justify-end space-x-3 mt-4">
                            <Popconfirm
                              title="Are you sure you want to reject this proposal?"
                              onConfirm={() => handleRejectProposal(proposal.proposalId)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button danger>
                                Reject Proposal
                              </Button>
                            </Popconfirm>
                            <Popconfirm
                              title="Are you sure you want to accept this proposal?"
                              onConfirm={() => handleAcceptProposal(proposal.proposalId)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button type="primary">
                                Accept Proposal
                              </Button>
                            </Popconfirm>
                          </div>
                        ] : []
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<UserOutlined />} 
                            size={64}
                            className="bg-blue-500"
                          />
                        }
                        title={
                          <div className="flex justify-between items-center">
                            <Text strong className="text-lg">
                              Freelancer #{proposal.freelancerId}
                            </Text>
                            <Badge 
                              status={
                                proposal.status === "ACCEPTED" ? "success" :
                                proposal.status === "REJECTED" ? "error" :
                                "processing"
                              } 
                              text={
                                <span className="font-medium">
                                  {proposal.status}
                                </span>
                              }
                              className="px-3 py-1"
                            />
                          </div>
                        }
                        description={
                          <div className="mt-2 text-gray-600">
                            <div className="flex items-center mb-1">
                              <CalendarOutlined className="mr-2" />
                              Submitted {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </div>
                            <div className="flex items-center">
                              <MessageOutlined className="mr-2" />
                              Proposal #{proposal.proposalId}
                            </div>
                          </div>
                        }
                      />
                      
                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <Title level={5} className="text-gray-700">Proposal Notes</Title>
                        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                          {proposal.notes}
                        </Paragraph>
                      </div>
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
              <div className="py-8 text-center">
                <Empty 
                  description={
                    <span className="text-gray-500">
                      No milestones created yet for this project
                    </span>
                  } 
                />
                {/* Add Milestone button would go here for active projects */}
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
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ClientProjectShow;