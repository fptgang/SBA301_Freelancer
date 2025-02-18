import React from "react";
import { Card, Button, Space, Divider, Typography } from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { ProjectDto, ProjectDtoStatusEnum } from "../../../generated";

interface ActionCardProps {
  project: ProjectDto;
  role: string | null;
}

export const ActionCard: React.FC<ActionCardProps> = ({ project, role }) => {
  const navigate = useNavigate();

  return (
    <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {role === "CLIENT" ? (
          <Button
            block
            type="default"
            size="large"
            onClick={() =>
              navigate(`/client/projects/create`, { state: { project } })
            }
          >
            Post Similar Project
          </Button>
        ) : project.status !== ProjectDtoStatusEnum.Open ? (
          <></>
        ) : role === "FREELANCER" ? (
          <>
            <Button
              block
              type="primary"
              size="large"
              style={{ backgroundColor: "#0f993e" }}
              onClick={() =>
                navigate(`/freelancer/projects/apply/${project?.projectId}`)
              }
            >
              Apply Now
            </Button>
            <Typography.Text
              type="secondary"
              style={{ textAlign: "center", display: "block" }}
            >
              {project?.proposalCount} proposals received
            </Typography.Text>
          </>
        ) : (
          <Button
            block
            type="primary"
            size="large"
            onClick={() => navigate(`/login`)}
          >
            Log in to Apply
          </Button>
        )}

        {role === "CLIENT" ||
          (project.status === ProjectDtoStatusEnum.Open && (
            <Divider style={{ margin: "16px 0" }} />
          ))}
        <Space direction="vertical" size="small">
          <Typography.Text strong>Project Details</Typography.Text>
          <Typography.Text>
            <DollarOutlined /> <strong>Budget:</strong> $
            {project?.estimateBudget
              ?.toFixed(0)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </Typography.Text>
          <Typography.Text>
            <CalendarOutlined /> <strong>Posted:</strong>{" "}
            {new Date(project?.createdAt!).toLocaleDateString()}
          </Typography.Text>
          <Typography.Text>
            <UserOutlined /> <strong>Client:</strong>{" "}
            {project?.client?.firstName}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};
