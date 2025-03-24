import React from "react";
import {ProjectDto} from "../../../../../generated";
import {Card, Col, Row, Statistic} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

const ProjectStats: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings()

  return <>
    <Row gutter={16} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Created On"
            value={
              project.createdAt
                ? localSettings.formatDate(project.createdAt)
                : "N/A"
            }
            valueStyle={{ fontSize: "16px" }}
            prefix={<CalendarOutlined />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Budget Range"
            value={`$${project.minBudget} - $${project.maxBudget}`}
            valueStyle={{ fontSize: "16px" }}
            prefix={<DollarOutlined />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Proposals Received"
            value={project.proposalCount}
            valueStyle={{ color: "#1890ff", fontSize: "16px" }}
            prefix={<TeamOutlined />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Start Date"
            value={
              project.startDate
                ? localSettings.formatDateTime(project.startDate)
                : "N/A"
            }
            valueStyle={{ fontSize: "16px" }}
            prefix={<CalendarOutlined />}
            className="text-center"
          />
        </Card>
      </Col>
    </Row>
  </>
};

export default ProjectStats;