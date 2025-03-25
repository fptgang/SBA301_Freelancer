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
  Alert,
  Divider,
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
  ToolOutlined,
} from "@ant-design/icons";
import Countdown from "../../../../components/Countdown";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

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
              <Space style={{ marginTop: 8, marginBottom: 8 }}>
                {project.projectCategory && (
                  <Tag color="blue">{project.projectCategory.name}</Tag>
                )}
                <Tag color={project.status === "OPEN" ? "green" : "red"}>
                  {project.status}
                </Tag>
              </Space>
              <Typography.Title level={4}>{project.title}</Typography.Title>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>
                    <CalendarOutlined /> Created At:{" "}
                  </Text>
                  <Text>
                    {localSettings.formatDateTime(project.createdAt!)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>
                    <CalendarOutlined /> Start Date:{" "}
                  </Text>
                  <Text>
                    {localSettings.formatDateTime(project.startDate!)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>
                    <CalendarOutlined /> Proposal Submission Deadline:{" "}
                  </Text>
                  <Text>
                    <Countdown
                      targetDate={dayjs(project.startDate)
                        .subtract(1, "day")
                        .toDate()}
                    />
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>
                    <DollarOutlined /> Budget Range:{" "}
                  </Text>
                  <Text>{budgetRange}</Text>
                </Col>
              </Row>

              <Divider />

              <Paragraph
                className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-100"
                ellipsis={{ rows: 5, expandable: true, symbol: "" }}
              >
                {project.description}
              </Paragraph>

              <Divider />

              <Title level={5} className="text-blue-600">
                Required Skills
              </Title>
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
                <Text type="secondary" className="italic">
                  No specific skills required
                </Text>
              )}
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
