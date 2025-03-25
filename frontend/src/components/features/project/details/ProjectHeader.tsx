import React from "react";
import { Typography, Tag, Space, Divider } from "antd";
import { CalendarOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { ProjectDto } from "../../../../../generated";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

interface ProjectHeaderProps {
  project: ProjectDto;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {project?.title} x
          <Tag
            color={project?.status === "OPEN" ? "#0f993e" : "red"}
            style={{
              marginLeft: 12,
              borderRadius: 4,
              fontWeight: 500,
              border: "none",
            }}
          >
            {project?.status?.replace("_", " ")}
          </Tag>
        </Typography.Title>

        <Space size="middle">
          <Typography.Text type="secondary">
            <CalendarOutlined /> Posted{" "}
            {localSettings.formatDate(project.createdAt!)}
          </Typography.Text>
          <Typography.Text type="secondary">
            <EyeInvisibleOutlined /> {project?.isVisible ? "Public" : "Private"}
          </Typography.Text>
        </Space>
      </Space>
      <Divider />
    </>
  );
};
