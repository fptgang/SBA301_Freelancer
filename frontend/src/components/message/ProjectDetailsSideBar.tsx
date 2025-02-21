import React, { useState } from "react";
import { Layout, Tabs, List, Typography, Space } from "antd";
import { ProjectDto } from "../../../generated";

interface ProjectDetailsSidebarProps {
  project?: ProjectDto;
}

export const ProjectDetailsSidebar: React.FC<ProjectDetailsSidebarProps> = ({
  project,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout.Sider
      width={400}
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      reverseArrow
    >
      {!collapsed && project && (
        <div style={{ padding: 24 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            Project Details
          </Typography.Title>

          <Tabs
            items={[
              {
                key: "overview",
                label: "Overview",
                children: (
                  <Space direction="vertical">
                    <Typography.Text>{project.description}</Typography.Text>
                    <Typography.Text>Status: {project.status}</Typography.Text>
                    <Typography.Text>
                      Budget: ${project.estimateBudget}
                    </Typography.Text>
                  </Space>
                ),
              },
              {
                key: "milestones",
                label: "Milestones",
                children: (
                  <List
                    dataSource={project.milestones}
                    renderItem={(milestone) => (
                      <List.Item>
                        <Typography.Text>{milestone.title}</Typography.Text>
                        <Typography.Text>${milestone.budget}</Typography.Text>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        </div>
      )}
    </Layout.Sider>
  );
};
