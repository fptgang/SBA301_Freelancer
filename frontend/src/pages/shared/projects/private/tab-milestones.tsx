import {Button, Card, Col, Empty, Row, Tag, Timeline, Typography} from "antd";
import {CalendarOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import {ProjectDto} from "../../../../../generated";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

const { Title, Text, Paragraph } = Typography;

const TabMilestones: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneDetailVisible, setMilestoneDetailVisible] = useState(false);

  const handleShowMilestoneDetail = (milestone: any) => {
    setSelectedMilestone(milestone);
    setMilestoneDetailVisible(true);
  };

  return <>
{project.milestones && project.milestones.length > 0 ? (
  <Timeline className="mt-4 px-4">
    {project.milestones.map((milestone, index) => (
      <Timeline.Item
        key={milestone.milestoneId || index}
        color={
          milestone.status === "FINISHED"
            ? "green"
            : milestone.status === "IN_PROGRESS"
              ? "blue"
              : milestone.status === "REVIEWING"
                ? "orange"
                : "gray"
        }
      >
        <Card
          className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleShowMilestoneDetail(milestone)}
        >
          <Row>
            <Col span={18}>
              <Title level={5}>{milestone.title}</Title>
              <Paragraph>{milestone.description}</Paragraph>
              <div className="flex gap-4 mt-2">
                <Tag color="blue">
                  Budget:{" "}
                  {milestone.budgetRatio ? (milestone.budgetRatio * 100).toFixed(0) : 0}%
                </Tag>
                <Text type="secondary">
                  <CalendarOutlined className="mr-1" />
                  Deadline:{" "}
                  {localSettings.formatDate(
                    milestone.deadline!
                  )}
                </Text>
                {milestone.status && (
                  <Tag
                    color={
                      milestone.status === "FINISHED"
                        ? "green"
                        : milestone.status === "IN_PROGRESS"
                          ? "blue"
                          : milestone.status === "REVIEWING"
                            ? "orange"
                            : "default"
                    }
                  >
                    {milestone.status}
                  </Tag>
                )}
              </div>
            </Col>
            <Col span={6} className="flex justify-end">
              {milestone.status === "REVIEWING" && (
                <Button
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMilestoneDetail(milestone);
                  }}
                >
                  View Details
                </Button>
              )}
            </Col>
          </Row>
        </Card>
      </Timeline.Item>
    ))}
  </Timeline>
) : (
  <div className="py-8 text-center">
    <Empty
      description={
        <span className="text-gray-500">
                        No milestones created yet for this project
                      </span>
      }
    />
    {project.status === "IN_PROGRESS" && (
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="mt-4"
      >
        Create Milestone
      </Button>
    )}
  </div>
)}
</>
};

export default TabMilestones;