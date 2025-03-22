import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Space,
  Button,
  message,
} from "antd";
import { useParams } from "react-router";
import { ProjectDto, MilestoneDto, AccountDto } from "../../../../generated";
import { ProjectMilestones } from "../../../components/features/project/details/ProjectMilestones";
import { MilestoneSubmissionModal } from "../../../components/features/project/milestones/MilestoneSubmissionModal";
import type { UploadFile } from "antd/es/upload/interface";
import { useGetIdentity, useOne } from "@refinedev/core";
import api from "../../../services/api/openapi-config";
import dayjs from "dayjs";
import { store } from "../../../store";
import ContractShowModal from "../../../components/ContractShowModal";

const { Title } = Typography;

const SharedProjectShow: React.FC = () => {
  const { id } = useParams();
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDto>();
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const { data: user } = useGetIdentity<AccountDto>();

  const {
    data,
    isLoading: loading,
    refetch,
  } = useOne<ProjectDto>({
    resource: "projects",
    id: id,
    queryOptions: {
      enabled: !!user,
    },
  });
  const project = data?.data;

  const handleSubmitClick = (milestone: MilestoneDto) => {
    setSelectedMilestone(milestone);
    setSubmissionModalVisible(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row justify="space-between">
            <Col>
              <Title level={2}>{project.title}</Title>
            </Col>
            <Col>
              <Button type="primary" onClick={() => setShowContractModal(true)}>
                View Contract
              </Button>
            </Col>
          </Row>
          <Descriptions column={2}>
            <Descriptions.Item label="Status">
              {project.status}
            </Descriptions.Item>
            <Descriptions.Item label="Budget">
              ${project.contract?.budget}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {project.startDate
                ? dayjs(project.startDate).format("MMM D, YYYY")
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
          <Typography.Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: "Read more",
            }}
          >
            {project.description}
          </Typography.Paragraph>
        </Card>
        <Card title="Files">
          {project.files?.map((f) => {
            const imageTypes = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
            const fileExt = f.fileName?.split(".").pop()?.toLowerCase() || "";
            return imageTypes.includes(fileExt) ? (
              <>
                <img src={f.fileUrl} alt={f.fileName} />
                <br />
              </>
            ) : (
              <>
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                  {f.fileName}
                </a>
                <br />
              </>
            );
          })}
        </Card>
        <Card>
          <ProjectMilestones
            budget={project.contract?.budget || 0}
            milestones={project.milestones}
            onSubmitClick={handleSubmitClick}
            showSubmitButton={true}
          />
        </Card>
      </Space>

      {selectedMilestone && (
        <MilestoneSubmissionModal
          milestone={selectedMilestone}
          visible={submissionModalVisible}
          onCancel={() => setSubmissionModalVisible(false)}
          refetch={refetch}
        />
      )}
      {project.contract?.status === "SIGNED" && (
        <ContractShowModal
          contractId={project.contract.contractId}
          visible={showContractModal}
          onClose={() => setShowContractModal(false)}
        />
      )}
    </div>
  );
};

export default SharedProjectShow;
