import React from "react";
import { Col, Descriptions, Row, Typography, Divider, Tag } from "antd";
import { useGetIdentity } from "@refinedev/core";
import { ProjectHeader } from "../../../components/features/project/details/ProjectHeader";
import { ProjectDescription } from "../../../components/features/project/details/ProjectDescription";
import { CheckCircleOutlined } from "@ant-design/icons";
import { AccountDto, ProjectDto } from "../../../../generated";
import { ActionCard } from "../../../components/features/project/details/ActionCard";
import { ClientInformation } from "../../../components/features/project/details/ClientInformation";
import FileList from "../../../components/common/file-list";

const { Title, Text } = Typography;

const ProjectPublicDetail: React.FC<{
  project: ProjectDto;
  refetch?: () => void;
}> = ({ project, refetch }) => {
  const { data: user } = useGetIdentity<AccountDto>();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <Row gutter={[32, 32]}>
        {/* Left Column */}
        <Col xs={24} md={16}>
          {project && <ProjectHeader project={project} />}
          {project && <ProjectDescription project={project} />}
          
          <Divider />
          
          <Title level={5} className="text-gray-700">
            Attachments
          </Title>
          {project.files && project.files.length > 0 ? (
            <FileList files={project.files.filter(file => file.isVisible)} />
          ) : (
            <Text type="secondary" className="italic">
              No attachments
            </Text>
          )}
        </Col>
        <Col xs={24} md={8}>
          <ClientInformation project={project} />
          <ActionCard
            project={project}
            freelancerId={user?.accountId}
            role={user?.role?.toString() || ""}
            refetch={() => {
              refetch && refetch();
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ProjectPublicDetail;
