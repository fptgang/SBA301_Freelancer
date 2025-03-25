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
import { MilestoneDto, ProjectDto } from "../../../../../generated";
import api from "../../../../services/api/openapi-config";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";

const { Step } = Steps;

interface ProjectUnpauseProps {
  project: ProjectDto;
  callback?: () => void;
}

export const ProjectUnpauseButton: React.FC<ProjectUnpauseProps> = ({
  project,
  callback,
}) => {
  const [localSettings] = useLocalSettings();
  const { modalProps, show, close } = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().add(1, 'day'));
  const [updatedDeadlines, setUpdatedDeadlines] = useState<Record<number, Dayjs>>({});
  const [originalDeadlines, setOriginalDeadlines] = useState<Record<number, Dayjs>>({});
  const [visibleMilestones, setVisibleMilestones] = useState<MilestoneDto[]>([]);

  useEffect(() => {
    if (!project.milestones) return;

    // Filter visible milestones and sort by ID
    const visible = project.milestones
      .filter(milestone => milestone.isVisible)
      .sort((a, b) => (a.milestoneId || 0) - (b.milestoneId || 0));
    setVisibleMilestones(visible);

    // Set original deadlines
    const deadlines: Record<number, Dayjs> = {};
    visible.forEach(milestone => {
      if (milestone.deadline && milestone.milestoneId) {
        deadlines[milestone.milestoneId] = dayjs(milestone.deadline);
      }
    });
    setOriginalDeadlines(deadlines);
    setUpdatedDeadlines({...deadlines});
  }, [project.milestones]);

  const validateDeadlines = () => {
    if (!project.milestones) return false;
    
    const sortedMilestones = [...visibleMilestones];
    
    // Check if start date is after now
    if (startDate.isBefore(dayjs(), 'day')) {
      message.error('Start date must be after today');
      return false;
    }

    // Check if all milestones have deadlines set
    const allDeadlinesSet = sortedMilestones.every(
      m => m.milestoneId && updatedDeadlines[m.milestoneId]
    );
    if (!allDeadlinesSet) {
      message.error('All milestones must have deadlines set');
      return false;
    }

    // Check first milestone timing relative to start date
    const firstMilestone = sortedMilestones[0];
    if (firstMilestone.milestoneId) {
      const firstDeadline = updatedDeadlines[firstMilestone.milestoneId];
      const daysToFirst = firstDeadline.diff(startDate, 'day');
      
      if (daysToFirst < 3) {
        message.error('First milestone must be at least 3 days after start date');
        return false;
      }
      if (daysToFirst > 30) {
        message.error('First milestone must be at most 30 days after start date');
        return false;
      }
    }
    
    // Check spacing between milestones
    for (let i = 0; i < sortedMilestones.length - 1; i++) {
      const currentId = sortedMilestones[i].milestoneId;
      const nextId = sortedMilestones[i + 1].milestoneId;
      
      if (!currentId || !nextId) continue;
      
      const currentDeadline = updatedDeadlines[currentId];
      const nextDeadline = updatedDeadlines[nextId];
      
      const daysDiff = nextDeadline.diff(currentDeadline, 'day');
      if (daysDiff < 3) {
        message.error('There must be at least 3 days between milestone deadlines');
        return false;
      }
      if (daysDiff > 30) {
        message.error('There must be at most 30 days between milestone deadlines');
        return false;
      }
    }
    
    return true;
  };

  const handleAutoAdjust = () => {
    const sortedMilestones = [...visibleMilestones];
    const newDeadlines = { ...updatedDeadlines };
    
    // Start from 3 days after start date
    let currentDate = startDate.add(3, 'day');
    
    // Update all milestones with 3-day spans
    sortedMilestones.forEach((milestone) => {
      const milestoneId = milestone.milestoneId;
      if (milestoneId) {
        newDeadlines[milestoneId] = currentDate;
        currentDate = currentDate.add(3, 'day');
      }
    });

    setUpdatedDeadlines(newDeadlines);
  };

  const handleStepSubmit = async () => {
    if (currentStep === 0) {
      if (!validateDeadlines()) {
        return;
      }
      setCurrentStep(1);
    } else {
      try {
        await api.unpauseProject({
          projectId: project.projectId!,
          projectTimelineDto: {
            newStartDate: startDate.toDate(),
            milestones: Object.entries(updatedDeadlines).map(([id, deadline]) => ({
              milestoneId: parseInt(id),
              newDeadline: deadline.toDate()
            }))
          }
        });
        
        message.success("Project timeline updated successfully");
        callback && callback();
        close();
      } catch (error) {
        message.error((error as HttpError).message || "Failed to update project timeline");
      }
    }
  };

  const handleDeadlineChange = (milestoneId: number, date: Dayjs | null) => {
    if (date) {
      setUpdatedDeadlines({
        ...updatedDeadlines,
        [milestoneId]: date,
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        if (visibleMilestones.length === 0) {
          return (
            <Alert
              message="No Milestones"
              description="There are no visible milestones in this project."
              type="info"
              showIcon
            />
          );
        }

        return (
          <Form form={form} layout="vertical" onFinish={handleStepSubmit}>
            <Alert
              message="Timeline Adjustment Rules"
              description={
                <>
                  <ul>
                    <li>Project start date must be after today</li>
                    <li>First milestone must be 3-30 days after start date</li>
                    <li>The minimum time between milestones is 3 days</li>
                    <li>The maximum time between milestones is 30 days</li>
                    <li>All visible milestones must have deadlines set</li>
                  </ul>
                </>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Set New Project Timeline" bordered={false}>
              <Form.Item
                label="New Start Date"
                required
                style={{ marginBottom: 24 }}
              >
                <DatePicker
                  showTime
                  format={localSettings.dateTimeFormat}
                  value={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  disabledDate={(current) => {
                    return current && current.isBefore(dayjs(), 'day');
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <div style={{ marginBottom: 16 }}>
                <Button onClick={handleAutoAdjust} type="primary">
                  Auto-adjust Deadlines
                </Button>
              </div>

              <Table
                dataSource={visibleMilestones}
                rowKey="milestoneId"
                pagination={false}
              >
                <Table.Column title="Title" dataIndex="title" />
                <Table.Column
                  title="Current Deadline"
                  dataIndex="deadline"
                  render={(deadline) => deadline ? localSettings.formatDateTime(deadline) : '-'}
                />
                <Table.Column
                  title="New Deadline"
                  dataIndex="milestoneId"
                  render={(milestoneId) => (
                    <DatePicker
                      showTime
                      format={localSettings.dateTimeFormat}
                      value={updatedDeadlines[milestoneId]}
                      onChange={(date) => handleDeadlineChange(milestoneId, date)}
                      disabledDate={(current) => {
                        // Cannot select days before start date
                        return current && current.isBefore(startDate, 'day');
                      }}
                      style={{ width: '100%' }}
                    />
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
            <Card title="Review Timeline Changes" bordered={false} style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <strong>New Start Date: </strong>
                {localSettings.formatDateTime(startDate)}
              </div>

              <Table
                dataSource={visibleMilestones}
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
                  I understand this will unpause the project and set new deadlines for all milestones
                </Checkbox>
              </Form.Item>
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setCurrentStep(0)}>Previous</Button>
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
        Unpause Project
      </Button>

      <Modal
        {...modalProps}
        title="Unpause Project"
        width={800}
        footer={null}
        maskClosable={false}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Edit" description="Set new timeline" />
          <Step title="Review" description="Confirm changes" />
        </Steps>
        {renderStepContent()}
      </Modal>
    </>
  );
};

export default ProjectUnpauseButton;
