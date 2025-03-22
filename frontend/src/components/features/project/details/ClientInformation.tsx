import React from "react";
import { Card, Space, Avatar, Typography, Divider, Tag } from "antd";
import { DollarOutlined, UserOutlined } from "@ant-design/icons";
import { ProjectDto } from "../../../../../generated";

interface ClientInformationProps {
  project: ProjectDto;
}

export const ClientInformation: React.FC<ClientInformationProps> = ({
  project,
}) => {
  return (
    <Card
      title="Client Information"
      headStyle={{ fontSize: 16, fontWeight: 600 }}
      style={{ borderRadius: 8, marginBottom: 24 }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space align="start">
          <Avatar
            src={project?.client?.avatarUrl}
            size={64}
            icon={<UserOutlined />}
          />
          <div>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {project?.client?.firstName} {project?.client?.lastName}
            </Typography.Text>
            <br />
            {/*<Typography.Text type="secondary">*/}
            {/*  Member since {new Date(project?.client?.createdAt!).getFullYear()}*/}
            {/*</Typography.Text>*/}
          </div>
        </Space>

        <Divider style={{ margin: "16px 0" }} />

        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text strong>
            <DollarOutlined /> Project Estimated Budget
          </Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>
            $
            {project?.minBudget
              ?.toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            - $
            {project?.maxBudget
              ?.toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </Typography.Title>
        </Space>

        <Divider style={{ margin: "16px 0" }} />

        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text strong>Client Verified Status</Typography.Text>
          <Tag color={project?.client?.isVerified ? "green" : "red"}>
            {project?.client?.isVerified ? "Verified" : "Not Verified"}
          </Tag>
        </Space>
      </Space>
    </Card>
  );
};
