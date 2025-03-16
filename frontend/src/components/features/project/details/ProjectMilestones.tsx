import React from "react";
import { Typography, Table, Tag } from "antd";
import { FlagOutlined } from "@ant-design/icons";
import { MilestoneDto } from "../../../../../generated";

interface ProjectMilestonesProps {
  milestones: MilestoneDto[] | undefined;
}

export const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({
  milestones,
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
        <Table.Column title="Budget" dataIndex="budget" key="budget" />
        <Table.Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string) => (
            <Tag color={status === "COMPLETED" ? "green" : "red"}>
              {status.replace("_", " ")}
            </Tag>
          )}
        />
      </Table>
    </>
  );
};
