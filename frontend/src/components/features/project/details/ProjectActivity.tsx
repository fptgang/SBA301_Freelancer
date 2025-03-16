import React from "react";
import { Typography, Descriptions } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ProjectDto, ProjectCategoryDto } from "../../../../../generated";

interface ProjectActivityProps {
  project: ProjectDto;
  category: ProjectCategoryDto | undefined;
}

export const ProjectActivity: React.FC<ProjectActivityProps> = ({
  project,
  category,
}) => {
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        <CheckCircleOutlined style={{ marginRight: 8 }} />
        Project Activity
      </Typography.Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Proposals Received">
          {project.proposalCount}
        </Descriptions.Item>
        <Descriptions.Item label="Category">{category?.name}</Descriptions.Item>
      </Descriptions>
    </>
  );
};
