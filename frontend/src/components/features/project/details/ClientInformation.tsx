import React from "react";
import { Card, Space, Avatar, Typography, Divider, Tag } from "antd";
import { CheckCircleOutlined, DollarOutlined, UserOutlined } from "@ant-design/icons";
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                  icon={<UserOutlined/>} 
                  src={project?.client?.avatarUrl} 
                  className="bg-blue-500"
                  size={32} />
              <div style={{ marginLeft: '16px' }}>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {project?.client?.firstName} {project?.client?.lastName}
                  {project.client?.isVerified &&
                    <CheckCircleOutlined className="ml-1 text-blue-500"/>}
            </Typography.Text>
            </div>
          </div>
        </Space>
      </Space>
    </Card>
  );
};
