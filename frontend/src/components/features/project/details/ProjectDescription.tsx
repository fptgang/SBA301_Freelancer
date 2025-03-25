import React from "react";
import { Tag, Typography } from "antd";
import { UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { ProjectDto } from "../../../../../generated";
import { renderSkillTags } from "../../../../utils/renderSkillTags";

interface ProjectDescriptionProps {
  project: ProjectDto;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  project,
}) => {
  return (
    <>

      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        <UserOutlined style={{ marginRight: 8 }} />
        Project Description
      </Typography.Title>
      <Typography.Paragraph style={{ color: "#595959", lineHeight: 1.6 }}>
        {project?.description}
      </Typography.Paragraph>

      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        <SafetyCertificateOutlined style={{ marginRight: 8 }} />
        Required Skills
      </Typography.Title>
      <Typography.Text type="secondary">
        {project?.requiredSkills && renderSkillTags(project.requiredSkills)}
      </Typography.Text>
    </>
  );
};
