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
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  ArrowLeftOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useOne, useNavigation } from "@refinedev/core";
import { ProposalDto, ProposalStatusDto } from "../../../../generated";
import { useNavigate, useParams } from "react-router";
import api from "../../../services/api/openapi-config";
import dayjs from "dayjs";
import {useLocalSettings} from "../../../hooks/useLocalSettings";

const { Title, Text, Paragraph } = Typography;

const FreelancerProposalShow: React.FC = () => {
  const [localSettings] = useLocalSettings()
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

  const getStatusTag = (status: ProposalStatusDto) => (
    <Tag color={statusColors[status] || "default"} style={{ fontSize: "14px" }}>
      {status}
    </Tag>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!proposal) {
    return (
      <Alert
        message="Proposal Not Found"
        description="The proposal you're looking for doesn't exist or you don't have permission to view it."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space style={{ marginBottom: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/freelancer/proposals")}
            >
              Back to Proposals
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Title level={4}>Proposal Details</Title>
                {proposal.status && getStatusTag(proposal.status)}
              </Space>

              <Descriptions column={1} bordered>
                <Descriptions.Item
                  label={
                    <Space>
                      <ProjectOutlined /> Project
                    </Space>
                  }
                >
                  <a
                    onClick={() =>
                      proposal.projectId &&
                      navigate("/projects/" + proposal.projectId)
                    }
                  >
                    View Project Details
                  </a>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <DollarOutlined /> Budget
                    </Space>
                  }
                >
                  ${proposal.budget || 0}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Space>
                      <BookOutlined /> Note
                    </Space>
                  }
                >
                  {proposal.notes}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <FileTextOutlined /> Files
                    </Space>
                  }
                >
                  {proposal.files?.map((f) => (
                    <a href={f.fileUrl}>{f.fileName}</a>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <ClockCircleOutlined /> Submitted
                    </Space>
                  }
                >
                  {proposal.createdAt
                    ? localSettings.formatDate(proposal.createdAt)
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card>
              <Title level={5}>Proposal Timeline</Title>
              <Timeline>
                <Timeline.Item
                  dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
                >
                  {proposal.createdAt
                    ? `Submitted on ${localSettings.formatDate(proposal.createdAt)}`
                    : "Submission date not available"}
                </Timeline.Item>
                {proposal.status === "ACCEPTED" && (
                  <Timeline.Item
                    dot={
                      <CheckCircleOutlined
                        style={{ fontSize: "16px" }}
                        color="green"
                      />
                    }
                  >
                    Accepted
                  </Timeline.Item>
                )}
                {proposal.status === "REJECTED" && (
                  <Timeline.Item
                    dot={
                      <CheckCircleOutlined
                        style={{ fontSize: "16px" }}
                        color="red"
                      />
                    }
                  >
                    Rejected
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>

            {proposal.status === "PENDING" && (
              <Button
                danger
                block
                onClick={() => {
                  if (proposal.proposalId) {
                    api
                      .withdrawProposal({
                        proposalId: proposal.proposalId,
                      })
                      .then(() => {
                        navigate("/freelancer/proposals");
                      });
                  }
                }}
              >
                Withdraw Proposal
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default FreelancerProposalShow;
