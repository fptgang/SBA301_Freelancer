import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Tag,
  Typography,
  Drawer,
  Space,
  Avatar,
  Tooltip,
} from "antd";
import { ProjectDto } from "../../../../../generated";
import { renderSkillTags } from "../../../../utils/renderSkillTags";
import ProjectDrawer from "../drawers/projectDrawer";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";
import {
  UserOutlined,
  FileOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const ProjectCard: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const onClose = () => {
    setIsDrawerVisible(false);
  };

  // Format budget as a range
  const budgetRange =
    project.minBudget && project.maxBudget
      ? `$${project.minBudget} - $${project.maxBudget}`
      : project.minBudget
      ? `From $${project.minBudget}`
      : project.maxBudget
      ? `Up to $${project.maxBudget}`
      : "Budget not specified";

  return (
    <>
      <Card
        className="mb-4"
        onClick={showDrawer}
        style={{ cursor: "pointer" }}
        hoverable
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Space style={{ marginTop: 8 }}>
                {project.projectCategory && (
                  <Tag color="blue">{project.projectCategory.name}</Tag>
                )}
                <Tag color={project.status === "OPEN" ? "green" : "red"}>
                  {project.status}
                </Tag>
              </Space>
              <Typography.Title level={4}>{project.title}</Typography.Title>

              <Space align="center">
                <CalendarOutlined />
                <Typography.Text type="secondary">
                  Posted: {localSettings.formatDate(project.createdAt!)}
                </Typography.Text>
              </Space>

              <Space align="center">
                <DollarOutlined />
                <Typography.Text>{budgetRange}</Typography.Text>
              </Space>

              <Typography.Paragraph
                ellipsis={{ rows: 3 }}
                style={{ marginBottom: 12 }}
              >
                {project.description}
              </Typography.Paragraph>

              {project.requiredSkills &&
                renderSkillTags(project.requiredSkills)}
            </Space>
          </Col>
        </Row>
      </Card>
      {isDrawerVisible && (
        <ProjectDrawer
          project={project}
          isDrawerVisible={isDrawerVisible}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ProjectCard;
