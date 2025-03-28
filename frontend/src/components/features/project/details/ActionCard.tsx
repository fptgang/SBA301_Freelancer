import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Alert,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import {
  AccountDto,
  ProfileDto,
  ProjectDto,
  ProjectStatusDto,
} from "../../../../../generated";
import FreelancerCreateProposalButton from "../../../../pages/freelancer/proposal/freelancer-create";
import { HttpError, useGetIdentity, useOne } from "@refinedev/core";
import ContractShowModal from "../../../ContractShowModal";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface ActionCardProps {
  project: ProjectDto;
  freelancerId?: number;
  role: string | null;
  refetch?: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  project,
  role,
  freelancerId,
  refetch,
}) => {
  const [localSettings] = useLocalSettings();
  const navigate = useNavigate();
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number>();
  const { data: user } = useGetIdentity<AccountDto>();
  const { data: freelancerProfile } = useOne<ProfileDto, HttpError>({
    resource: "profiles",
    id: user?.profileId,
    queryOptions: {
      enabled: !!user && user?.role === "FREELANCER",
    },
  });
  const checkSkills = () => {
    if (freelancerProfile?.data?.skills) {
      return project?.requiredSkills?.some((reqiredSkill) =>
        freelancerProfile?.data?.skills?.some(
          (freelancerSkill) =>
            freelancerSkill?.skill?.skillId === reqiredSkill?.skill?.skillId
        )
      );
    }
    return true;
  };
  return (
    <Card
      title="Proposal Submission"
      style={{ borderRadius: 8 }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Budget Range:</Text>{" "}
            <Text>
              ${project.minBudget} - ${project.maxBudget}
            </Text>
          </Col>
          <Col span={24}>
            <Text strong>Start Date: </Text>
            <Text>{localSettings.formatDateTime(project.startDate!)}</Text>
          </Col>
          <Col span={24}>
            <Text strong>Submission Deadline:</Text>{" "}
            <Text>
              {localSettings.formatDateTime(
                dayjs(project.startDate!).subtract(1, "day").toDate()
              )}
            </Text>
          </Col>
        </Row>
      </Space>

      <Divider style={{ margin: "16px 0" }} />

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {role === "CLIENT" ? (
          <Button
            block
            type="default"
            size="large"
            onClick={() =>
              navigate(`/client/projects/create`, { state: { project } })
            }
          >
            Post Similar Project
          </Button>
        ) : project.status !== ProjectStatusDto.Open ? (
          <></>
        ) : role === "FREELANCER" ? (
          project?.myProposals?.find((p) => p.status === "PENDING") ? (
            <>
              <Button
                block
                type="primary"
                size="large"
                onClick={() =>
                  navigate(
                    `/freelancer/proposals/${
                      project?.myProposals?.find((p) => p.status === "PENDING")
                        ?.proposalId
                    }`
                  )
                }
              >
                View Your Proposal
              </Button>
            </>
          ) : (
            <>
              {!checkSkills() && (
                <Alert
                  message=" You don't have any required skills for this project. 
                  Consider carefully before apply!"
                  type="warning"
                  showIcon
                  style={{ padding: 16 }}
                />
              )}
              <Typography.Text
                type="secondary"
                style={{ textAlign: "center", display: "block" }}
              >
                {project?.proposalCount} proposals received
              </Typography.Text>
              <FreelancerCreateProposalButton
                project={project}
                freelancerId={freelancerId}
                refetch={refetch}
              />
            </>
          )
        ) : (
          <Button
            block
            type="primary"
            size="large"
            onClick={() => navigate(`/login`)}
          >
            Log in to Apply
          </Button>
        )}

        {project?.contract &&
          (user?.accountId === project.contract.freelancer?.accountId ||
            user?.accountId === project.client?.accountId) && (
            <>
              <Button
                block
                type="primary"
                size="large"
                onClick={() => {
                  setSelectedContractId(project.contract?.contractId);
                  setShowContractModal(true);
                }}
              >
                View Contract
              </Button>
              <ContractShowModal
                visible={showContractModal}
                onClose={() => {
                  setShowContractModal(false);
                  setSelectedContractId(undefined);
                }}
                contractId={selectedContractId || 0}
              />
            </>
          )}

        {role === "FREELANCER" &&
          project?.myProposals &&
          project?.myProposals?.length > 0 && (
            <>
              <Button
                block
                type="primary"
                size="large"
                onClick={() =>
                  navigate(`/freelancer/proposals`, {
                    state: { projectId: project.projectId },
                  })
                }
              >
                View Submited Proposals
              </Button>
            </>
          )}
      </Space>
    </Card>
  );
};
