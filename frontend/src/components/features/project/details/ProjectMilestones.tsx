import React from "react";
import { Typography, Table, Tag, Button, Space } from "antd";
import { FlagOutlined } from "@ant-design/icons";
import { MilestoneDto } from "../../../../../generated";

interface ProjectMilestonesProps {
  budget: number;
  milestones: MilestoneDto[] | undefined;
  onSubmitClick?: (milestone: MilestoneDto) => void;
  showSubmitButton?: boolean;
}

export const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({
  budget,
  milestones,
  onSubmitClick,
  showSubmitButton = false,
}) => {
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        <FlagOutlined style={{ marginRight: 8 }} />
        Project Milestone
      </Typography.Title>
      <Table<MilestoneDto>
        dataSource={milestones}
        pagination={false}
        rowKey={(record) => record.milestoneId || 0}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>{record.description}</p>
          ),
          rowExpandable: (record) =>
            record.description !== "" && record.description !== null,
        }}
      >
        <Table.Column title="Milestone" dataIndex="title" key="title" />
        <Table.Column title="Deadline" dataIndex="deadline" key="deadline" />
        <Table.Column
          title="Budget"
          key="budget"
          render={(_, record: MilestoneDto) => (
            <p>
              ${parseFloat("" + (record.budgetRatio || 0) * budget).toFixed(2)}
            </p>
          )}
        />
        <Table.Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string) => (
            <Tag
              color={
                status === "COMPLETED"
                  ? "green"
                  : status === "IN_PROGRESS"
                  ? "blue"
                  : "red"
              }
            >
              {status.replace("_", " ")}
            </Tag>
          )}
        />
        {showSubmitButton && (
          <Table.Column
            title="Action"
            key="action"
            render={(_, record: MilestoneDto) => (
              <Space>
                {record.status === "IN_PROGRESS" && onSubmitClick && (
                  <Button type="primary" onClick={() => onSubmitClick(record)}>
                    Submit Deliverables
                  </Button>
                )}
              </Space>
            )}
          />
        )}
      </Table>
    </>
  );
};
