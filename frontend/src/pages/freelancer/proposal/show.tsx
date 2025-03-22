import React from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Timeline,
  Divider,
  Alert,
  Statistic,
  Avatar,
  Badge,
  Modal
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LinkOutlined,
  DownloadOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useOne, useNavigation } from "@refinedev/core";
import { ProposalDto, ProposalStatusDto } from "../../../../generated";
import { useNavigate, useParams } from "react-router";
import api from "../../../services/api/openapi-config";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const FreelancerProposalShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOne<ProposalDto>({
    resource: "proposals",
    id: id || "",
  });

  const proposal = data?.data;

  const statusColors: Record<ProposalStatusDto, string> = {
    PENDING: "orange",
    ACCEPTED: "green",
    REJECTED: "red",
    WITHDRAWN: "gray",
    EXPIRED: "purple",
  };

  const statusIcons: Record<ProposalStatusDto, React.ReactNode> = {
    PENDING: <ClockCircleOutlined />,
    ACCEPTED: <CheckCircleOutlined />,
    REJECTED: <CloseCircleOutlined />,
    WITHDRAWN: <CloseCircleOutlined />,
    EXPIRED: <ClockCircleOutlined />,
  };

  const getStatusTag = (status: ProposalStatusDto) => (
    <Tag 
      color={statusColors[status] || "default"} 
      icon={statusIcons[status]}
      className="px-4 py-1 text-sm rounded-full"
      style={{ fontSize: "14px" }}
    >
      {status}
    </Tag>
  );

  const handleWithdrawProposal = () => {
    Modal.confirm({
      title: 'Withdraw Proposal',
      content: 'Are you sure you want to withdraw this proposal? This action cannot be undone.',
      okText: 'Yes, Withdraw',
      okType: 'danger',
      cancelText: 'Cancel',
      icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      onOk: () => {
        if (proposal?.proposalId) {
          api
            .withdrawProposal({
              proposalId: proposal.proposalId,
            })
            .then(() => {
              navigate("/freelancer/proposals");
            });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          message="Proposal Not Found"
          description="The proposal you're looking for doesn't exist or you don't have permission to view it."
          type="error"
          showIcon
          className="shadow-md"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card bordered={false} className="shadow-sm mb-6">
              <Space className="flex items-center justify-between w-full">
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/freelancer/proposals")}
                    className="flex items-center"
                    type="default"
                  >
                    Back to Proposals
                  </Button>
                  <Divider type="vertical" />
                  <Title level={4} className="m-0">Proposal #{proposal.proposalId}</Title>
                </Space>
                {proposal.status && getStatusTag(proposal.status)}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Key Stats Section */}
          <Col xs={24}>
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <Statistic 
                    title="Proposed Budget" 
                    value={proposal.budget || 0} 
                    prefix={<DollarOutlined />} 
                    valueStyle={{ color: '#52c41a' }}
                    precision={2}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <Statistic 
                    title="Date Submitted" 
                    value={proposal.createdAt ? dayjs(proposal.createdAt).format("MMM D, YYYY") : "N/A"} 
                    prefix={<CalendarOutlined />} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <Statistic 
                    title="Status" 
                    value={proposal.status || "N/A"} 
                    prefix={statusIcons[proposal.status as ProposalStatusDto]} 
                    valueStyle={{ color: proposal.status ? (statusColors[proposal.status as ProposalStatusDto] === "green" ? '#52c41a' : 
                                            statusColors[proposal.status as ProposalStatusDto] === "orange" ? '#fa8c16' : 
                                            statusColors[proposal.status as ProposalStatusDto] === "red" ? '#f5222d' : '#1890ff') : '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={16}>
            <Card 
              bordered={false} 
              className="shadow-md"
              title={
                <Space className="py-2">
                  <ProjectOutlined className="text-blue-500" />
                  <span className="font-medium">Proposal Details</span>
                </Space>
              }
            >
              <div className="mb-8">
                <Button 
                  type="primary" 
                  ghost
                  icon={<LinkOutlined />}
                  onClick={() => proposal.projectId && navigate("/projects/" + proposal.projectId)}
                  className="mb-6"
                >
                  View Project Details
                </Button>
              </div>

              <Space direction="vertical" size={16} className="w-full">
                {/* Proposal Note Block */}
                <Card 
                  bordered={false}
                  className="bg-gray-50 shadow-sm hover:shadow transition-shadow"
                  title={
                    <Space>
                      <BookOutlined className="text-blue-500" /> 
                      <span className="font-medium">Proposal Note</span>
                    </Space>
                  }
                >
                  <div className="py-2">
                    {proposal.notes ? (
                      <Paragraph>{proposal.notes}</Paragraph>
                    ) : (
                      <Text type="secondary">No notes provided</Text>
                    )}
                  </div>
                </Card>

                {/* Budget Details Block */}
                <Card 
                  bordered={false}
                  className="bg-gray-50 shadow-sm hover:shadow transition-shadow"
                  title={
                    <Space>
                      <DollarOutlined className="text-green-500" /> 
                      <span className="font-medium">Budget Details</span>
                    </Space>
                  }
                >
                  <div className="flex items-center py-2">
                    <span className="text-lg font-semibold">${proposal.budget || 0}</span>
                  </div>
                </Card>

                {/* Attached Files Block */}
                <Card 
                  bordered={false}
                  className="bg-gray-50 shadow-sm hover:shadow transition-shadow"
                  title={
                    <Space>
                      <FileTextOutlined className="text-purple-500" /> 
                      <span className="font-medium">Attached Files</span>
                    </Space>
                  }
                >
                  <div className="py-2">
                    {proposal.files && proposal.files.length > 0 ? (
                      <Space direction="vertical" className="w-full">
                        {proposal.files.map((file, index) => (
                          <Space key={index} className="border p-2 rounded-md w-full bg-white">
                            <FileTextOutlined />
                            <a 
                              href={file.fileUrl}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.fileName}
                            </a>
                            <Button 
                              size="small" 
                              type="link" 
                              icon={<DownloadOutlined />}
                              href={file.fileUrl}
                              target="_blank"
                            >
                              Download
                            </Button>
                          </Space>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No files attached</Text>
                    )}
                  </div>
                </Card>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={24} className="w-full">
              <Card 
                bordered={false} 
                className="shadow-md"
                title={
                  <Space className="py-2">
                    <ClockCircleOutlined className="text-blue-500" />
                    <span className="font-medium">Proposal Timeline</span>
                  </Space>
                }
              >
                <Timeline>
                  <Timeline.Item
                    dot={<CalendarOutlined style={{ fontSize: "16px", color: "#1890ff" }} />}
                    color="blue"
                  >
                    <div className="mb-2">
                      <Text strong>Proposal Submitted</Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        {proposal.createdAt
                          ? dayjs(proposal.createdAt).format("MMM D, YYYY [at] h:mm A")
                          : "Submission date not available"}
                      </Text>
                    </div>
                  </Timeline.Item>
                  
                  {proposal.status === "ACCEPTED" && (
                    <Timeline.Item
                      dot={<CheckCircleOutlined style={{ fontSize: "16px", color: "#52c41a" }} />}
                      color="green"
                    >
                      <div className="mb-2">
                        <Text strong>Proposal Accepted</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {proposal.updatedAt
                            ? dayjs(proposal.updatedAt).format("MMM D, YYYY [at] h:mm A")
                            : "Date not available"}
                        </Text>
                      </div>
                    </Timeline.Item>
                  )}
                  
                  {proposal.status === "REJECTED" && (
                    <Timeline.Item
                      dot={<CloseCircleOutlined style={{ fontSize: "16px", color: "#f5222d" }} />}
                      color="red"
                    >
                      <div className="mb-2">
                        <Text strong>Proposal Rejected</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {proposal.updatedAt
                            ? dayjs(proposal.updatedAt).format("MMM D, YYYY [at] h:mm A")
                            : "Date not available"}
                        </Text>
                      </div>
                    </Timeline.Item>
                  )}
                  
                  {proposal.status === "WITHDRAWN" && (
                    <Timeline.Item
                      dot={<CloseCircleOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />}
                      color="gray"
                    >
                      <div className="mb-2">
                        <Text strong>Proposal Withdrawn</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {proposal.updatedAt
                            ? dayjs(proposal.updatedAt).format("MMM D, YYYY [at] h:mm A")
                            : "Date not available"}
                        </Text>
                      </div>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Card>

              {proposal.status === "PENDING" && (
                <Card bordered={false} className="shadow-md">
                  <Space direction="vertical" size="middle" className="w-full">
                    <div className="text-center mb-2">
                      <Title level={5}>Action Required</Title>
                      <Text type="secondary">
                        You can withdraw this proposal if you wish to retract your offer.
                      </Text>
                    </div>
                    <Button
                      danger
                      block
                      size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={handleWithdrawProposal}
                      className="mt-4"
                    >
                      Withdraw Proposal
                    </Button>
                  </Space>
                </Card>
              )}
              
              {proposal.status === "ACCEPTED" && (
                <Card bordered={false} className="shadow-md bg-green-50">
                  <div className="text-center">
                    <CheckCircleOutlined className="text-green-500 text-4xl mb-3" />
                    <Title level={5} className="text-green-700 mb-1">Congratulations!</Title>
                    <Paragraph className="text-green-700">
                      Your proposal has been accepted. The client has chosen to work with you on this project.
                    </Paragraph>
                  </div>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FreelancerProposalShow;
