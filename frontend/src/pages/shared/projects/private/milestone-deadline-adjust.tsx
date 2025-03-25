import React, { useState, useEffect } from "react";
import { HttpError } from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  message,
  Modal,
  Space,
  Steps,
  Table,
  Typography,
} from "antd";
import { useModal } from "@refinedev/antd";
import { MilestoneDto, MilestoneStatusDto, ProjectDto } from "../../../../../generated";
import api from "../../../../services/api/openapi-config";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";

const { Step } = Steps;
const { Text, Title } = Typography;

interface MilestoneDeadlineAdjustProps {
  project: ProjectDto;
  callback?: () => void;
}

export const MilestoneDeadlineAdjustButton: React.FC<MilestoneDeadlineAdjustProps> = ({
  project,
  callback,
}) => {
  const [localSettings] = useLocalSettings();
  const { modalProps, show, close } = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [updatedDeadlines, setUpdatedDeadlines] = useState<Record<number, Dayjs>>({});
  const [originalDeadlines, setOriginalDeadlines] = useState<Record<number, Dayjs>>({});
  const [eligibleMilestones, setEligibleMilestones] = useState<MilestoneDto[]>([]);

  useEffect(() => {
    if (!project.milestones) return;

    // Filter visible milestones
    const visibleMilestones = project.milestones
      .filter(milestone => milestone.isVisible)
      .sort((a, b) => (a.milestoneId || 0) - (b.milestoneId || 0));

    // Find active milestone index
    const activeIndex = visibleMilestones.findIndex(
      milestone => milestone.status === MilestoneStatusDto.InProgress
    );

    // If no active milestone, consider first milestone as active
    const effectiveActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    // Get eligible milestones (active and after)
    const eligible = visibleMilestones.slice(effectiveActiveIndex);
    setEligibleMilestones(eligible);

    // Set original deadlines
    const deadlines: Record<number, Dayjs> = {};
    eligible.forEach(milestone => {
      if (milestone.deadline && milestone.milestoneId) {
        deadlines[milestone.milestoneId] = dayjs(milestone.deadline);
      }
    });
    setOriginalDeadlines(deadlines);
    setUpdatedDeadlines({...deadlines});
  }, [project.milestones]);

  const isEligibleMilestone = (milestone: MilestoneDto) => {
    return eligibleMilestones.some(m => m.milestoneId === milestone.milestoneId);
  };

  const validateDeadlines = () => {
    if (!project.milestones) return true;
    
    const sortedMilestones = [...eligibleMilestones].sort(
      (a, b) => (a.milestoneId || 0) - (b.milestoneId || 0)
    );
    
    // Check each milestone's deadline against the next one
    for (let i = 0; i < sortedMilestones.length - 1; i++) {
      const currentId = sortedMilestones[i].milestoneId;
      const nextId = sortedMilestones[i + 1].milestoneId;
      
      if (!currentId || !nextId || !updatedDeadlines[currentId] || !updatedDeadlines[nextId]) {
        continue;
      }
      
      const currentDeadline = updatedDeadlines[currentId];
      const nextDeadline = updatedDeadlines[nextId];
      
      // Check if there's at least 3 days between deadlines
      const minDaysDiff = nextDeadline.diff(currentDeadline, 'day');
      if (minDaysDiff < 3) {
        message.error(`There must be at least 3 days between milestone deadlines`);
        return false;
      }
      
      // Check if there's at most 30 days between deadlines
      if (minDaysDiff > 30) {
        message.error(`There must be at most 30 days between milestone deadlines`);
        return false;
      }
    }
    
    return true;
  };

  const handleStepSubmit = async () => {
    if (currentStep === 0) {
      if (!validateDeadlines()) {
        return;
      }
      setCurrentStep(1);
    } else {
      try {
        // Only include deadlines for eligible milestones
        const eligibleMilestoneIds = new Set(eligibleMilestones.map(m => m.milestoneId));
        
        await api.extendProjectDeadline({
          projectId: project.projectId!,
          projectTimelineDto: {
            milestones: Object.entries(updatedDeadlines)
              .filter(([id]) => eligibleMilestoneIds.has(parseInt(id)))
              .map(([id, deadline]) => ({
                milestoneId: parseInt(id),
                newDeadline: deadline.toDate()
              }))
          }
        });
        
        message.success("Milestone deadlines updated successfully");
        callback && callback();
        close();
      } catch (error) {
        message.error((error as HttpError).message || "Failed to update deadlines");
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleDeadlineChange = (milestoneId: number | undefined, date: Dayjs | null) => {
    if (!milestoneId || !date) return;
    
    const newDeadlines = { ...updatedDeadlines };
    newDeadlines[milestoneId] = date;
    setUpdatedDeadlines(newDeadlines);
  };

  const isMilestoneDeadlineValid = (milestoneId: number, allMilestones: MilestoneDto[]) => {
    const currentDeadline = updatedDeadlines[milestoneId];
    if (!currentDeadline) return false;

    // Check if deadline is after current date
    if (currentDeadline.isBefore(dayjs(), 'day')) return false;

    // Find current milestone index
    const sortedMilestones = [...allMilestones].sort((a, b) => (a.milestoneId || 0) - (b.milestoneId || 0));
    const currentIndex = sortedMilestones.findIndex(m => m.milestoneId === milestoneId);
    
    if (currentIndex > 0) {
      // Check distance from previous milestone
      const prevId = sortedMilestones[currentIndex - 1].milestoneId;
      if (prevId && updatedDeadlines[prevId]) {
        const daysDiff = currentDeadline.diff(updatedDeadlines[prevId], 'day');
        if (daysDiff < 3 || daysDiff > 30) return false;
      }
    }

    if (currentIndex < sortedMilestones.length - 1) {
      // Check distance to next milestone
      const nextId = sortedMilestones[currentIndex + 1].milestoneId;
      if (nextId && updatedDeadlines[nextId]) {
        const daysDiff = updatedDeadlines[nextId].diff(currentDeadline, 'day');
        if (daysDiff < 3 || daysDiff > 30) return false;
      }
    }

    return true;
  };

  const handleAutoAdjust = () => {
    const sortedMilestones = [...eligibleMilestones].sort(
      (a, b) => (a.milestoneId || 0) - (b.milestoneId || 0)
    );

    const newDeadlines = { ...updatedDeadlines };
    
    // Set first eligible milestone to 3 days from now
    if (sortedMilestones[0]?.milestoneId) {
      // Start from current date for first milestone
      let currentDate = dayjs().add(3, 'day').startOf('day');
      
      // Update all eligible milestones with 3-day spans
      sortedMilestones.forEach((milestone, index) => {
        const milestoneId = milestone.milestoneId;
        if (milestoneId) {
          newDeadlines[milestoneId] = currentDate;
          currentDate = currentDate.add(3, 'day');
        }
      });
    }

    setUpdatedDeadlines(newDeadlines);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        if (eligibleMilestones.length === 0) {
          return (
            <Alert
              message="No Eligible Milestones"
              description="There are no milestones eligible for deadline adjustment."
              type="info"
              showIcon
            />
          );
        }

        return (
          <Form form={form} layout="vertical" onFinish={handleStepSubmit}>
            <Alert
              message="Deadline Adjustment Rules"
              description={
                <>
                  <ul>
                    <li>Only active and future milestones can have their deadlines adjusted</li>
                    <li>Deadlines can only be extended, not shortened</li>
                    <li>The minimum time between milestones is 3 days</li>
                    <li>The maximum time between milestones is 30 days</li>
                  </ul>
                </>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Adjust Milestone Deadlines" bordered={false}>
              <div style={{ marginBottom: 16 }}>
                <Button onClick={handleAutoAdjust} type="primary">
                  Auto-adjust Deadlines
                </Button>
              </div>
              <Table
                dataSource={project.milestones?.filter(m => m.isVisible).sort((a, b) => (a.milestoneId || 0) - (b.milestoneId || 0))}
                rowKey="milestoneId"
                pagination={false}
              >
                <Table.Column title="Title" dataIndex="title" />
                <Table.Column
                  title="Status"
                  dataIndex="status"
                  render={(status) => status?.toString()}
                />
                <Table.Column
                  title="Current Deadline"
                  dataIndex="deadline"
                  render={(deadline) => deadline ? localSettings.formatDateTime(deadline) : '-'}
                />
                <Table.Column
                  title="New Deadline"
                  dataIndex="milestoneId"
                  render={(milestoneId, record: MilestoneDto) => (
                    <Space>
                      <DatePicker
                        showTime
                        format={localSettings.dateTimeFormat}
                        value={updatedDeadlines[milestoneId]}
                        onChange={(date) => handleDeadlineChange(milestoneId, date)}
                        disabled={!isEligibleMilestone(record)}
                        disabledDate={(current) => {
                          // Cannot select days before original deadline
                          return current && current.isBefore(dayjs(record.deadline), 'day');
                        }}
                        style={{ width: '100%' }}
                      />
                      {isEligibleMilestone(record) && updatedDeadlines[milestoneId] && (
                        <span style={{ color: isMilestoneDeadlineValid(milestoneId, project.milestones || []) ? '#52c41a' : '#ff4d4f' }}>
                          {isMilestoneDeadlineValid(milestoneId, project.milestones || []) ? '✓' : '✗'}
                        </span>
                      )}
                    </Space>
                  )}
                />
              </Table>
            </Card>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form layout="vertical" onFinish={handleStepSubmit}>
            <Card title="Review Deadline Changes" bordered={false} style={{ marginBottom: 24 }}>
              <Table
                dataSource={eligibleMilestones}
                rowKey="milestoneId"
                pagination={false}
              >
                <Table.Column title="Milestone" dataIndex="title" />
                <Table.Column
                  title="Original Deadline"
                  dataIndex="milestoneId"
                  render={(milestoneId) => 
                    originalDeadlines[milestoneId] ? localSettings.formatDateTime(originalDeadlines[milestoneId]) : '-'
                  }
                />
                <Table.Column
                  title="New Deadline"
                  dataIndex="milestoneId"
                  render={(milestoneId) => 
                    updatedDeadlines[milestoneId] ? localSettings.formatDateTime(updatedDeadlines[milestoneId]) : '-'
                  }
                />
                <Table.Column
                  title="Change"
                  dataIndex="milestoneId"
                  render={(milestoneId) => {
                    if (!originalDeadlines[milestoneId] || !updatedDeadlines[milestoneId]) return '-';
                    
                    const diff = updatedDeadlines[milestoneId].diff(originalDeadlines[milestoneId], 'days');
                    return diff > 0 ? `+${diff} days` : `${diff} days`;
                  }}
                />
              </Table>

              <Form.Item
                name="confirmation"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error("You must confirm to proceed")),
                  },
                ]}
                style={{ marginTop: 16 }}
              >
                <Checkbox>
                  I understand this action is undoable and I can no longer shorten deadlines
                </Checkbox>
              </Form.Item>
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button type="primary" htmlType="submit">
                Confirm Changes
              </Button>
            </div>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          show();
          setCurrentStep(0);
        }}
      >
        Adjust Deadlines
      </Button>

      <Modal
        {...modalProps}
        title="Adjust Milestone Deadlines"
        width={800}
        footer={null}
        maskClosable={false}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Edit" description="Adjust deadlines" />
          <Step title="Review" description="Confirm changes" />
        </Steps>
        {renderStepContent()}
      </Modal>
    </>
  );
};

export default MilestoneDeadlineAdjustButton;
