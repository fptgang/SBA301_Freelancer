import {Button, Card, Col, Empty, Row, Tag, Timeline, Typography, Checkbox} from "antd";
import {CalendarOutlined, ClockCircleOutlined, DollarOutlined, PlusOutlined, FileTextOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import {
  AccountDto,
  AccountDtoRoleEnum,
  ProjectDto
} from "../../../../../generated";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import {MilestoneStatusDto} from "../../../../../generated/models/MilestoneStatusDto";
import Countdown from "../../../../components/Countdown";
import FileList from "../../../../components/common/file-list";
import ManageDeliverables from "./modal-manage-deliverables";
import {useGetIdentity} from "@refinedev/core";

const KEY_SHOW_MILESTONE_COUNTDOWN = "hirable-showMilestoneCountdown";
const { Title, Text, Paragraph } = Typography;

const TabMilestones: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  const { data: user } = useGetIdentity<AccountDto>();
  const [showCountdown, setShowCountdown] = useState(() => {
    const saved = localStorage.getItem(KEY_SHOW_MILESTONE_COUNTDOWN);
    return saved ? JSON.parse(saved) : false;
  });
  const [isManageDeliverablesVisible, setIsManageDeliverablesVisible] = useState(false);
  const [selectedMilestoneForDeliverables, setSelectedMilestoneForDeliverables] = useState<any>(null);

  const handleShowCountdownChange = (e: any) => {
    const newValue = e.target.checked;
    setShowCountdown(newValue);
    localStorage.setItem(KEY_SHOW_MILESTONE_COUNTDOWN, JSON.stringify(newValue));
  };

  const handleManageDeliverables = (milestone: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMilestoneForDeliverables(milestone);
    setIsManageDeliverablesVisible(true);
  };

  if (!project.milestones || project.milestones.length == 0) {
    return <Text type="secondary" className="italic">
      No milestones available
    </Text>
  }

  return <>
    <div className="mb-4 px-4">
      <Checkbox 
        checked={showCountdown}
        onChange={handleShowCountdownChange}
      >
        Show Countdown
      </Checkbox>
    </div>
    <Timeline className="mt-4 px-4">
      {project.milestones.filter(milestone => milestone.isVisible).map((milestone, index) => (
        <Timeline.Item
          key={milestone.milestoneId || index}
          color={
            milestone.status === MilestoneStatusDto.Finished
              ? "green"
              : milestone.status === MilestoneStatusDto.InProgress
              ? "blue"
              : milestone.status === MilestoneStatusDto.Reviewing
              ? "orange"
              : milestone.status === MilestoneStatusDto.Terminated
              ? "red"
              : "gray" // for PENDING or default case
          }
        >
          <Card
            className="mb-4"
          >
            <Row>
              <Col span={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {milestone.title}
                  </Title>
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
                <div className="flex gap-4 mt-2">
                  <Text type="secondary">
                    <DollarOutlined className="mr-1" />
                    Budget:{" "}
                    {milestone.budgetRatio ? (milestone.budgetRatio * 100).toFixed(0) : 0}%
                  </Text>
                  <Text type="secondary">
                    <CalendarOutlined className="mr-1" />
                    Deadline:{" "}
                    {localSettings.formatDateTime(milestone.deadline!)}
                  </Text>
                  {showCountdown && <Text type="secondary">
                    <ClockCircleOutlined className="mr-1" />
                    Time left:{" "}
                    <Countdown targetDate={milestone.deadline!} />
                  </Text>}
                </div>
                <Paragraph className="mt-2">{milestone.description}</Paragraph>

                {milestone.status != MilestoneStatusDto.Pending && <div className="mt-4">
                    <Title level={5}>Deliverables</Title> 
                    
                    {milestone.deliverables && milestone.deliverables.filter(d => d.isVisible).length > 0 ? (
                    <FileList files={milestone.deliverables.filter(d => d.isVisible)} />
                ) : (
                  <Text type="secondary" className="italic">No deliverables attached</Text>
                )}
                  </div>}
              </Col>

              <Col span={6} className="flex justify-end">
                <div className="flex flex-col gap-2">
                  {user && user.role == AccountDtoRoleEnum.Freelancer && (
                    <>
                      {(milestone.status ===MilestoneStatusDto.InProgress ||
                        milestone.status === MilestoneStatusDto.Reviewing) && <Button
                        onClick={(e) => handleManageDeliverables(milestone, e)}
                        icon={<FileTextOutlined />}
                      >
                        Manage Deliverables
                      </Button>}
                    </>
                  )}

                  {user && user.role == AccountDtoRoleEnum.Client && (
                    <>
                      {(milestone.status === MilestoneStatusDto.Reviewing) && <Button
                        onClick={(e) => handleManageDeliverables(milestone, e)}
                        icon={<FileTextOutlined />}
                      >
                        Review Deliverables
                      </Button>}
                    </>
                  )}

                </div>
              </Col>
            </Row>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>

    <ManageDeliverables
      visible={isManageDeliverablesVisible}
      milestone={selectedMilestoneForDeliverables}
      onClose={() => {
        setIsManageDeliverablesVisible(false);
        setSelectedMilestoneForDeliverables(null);
      }}
    />
  </>
};

export default TabMilestones;