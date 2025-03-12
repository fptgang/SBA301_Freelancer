import React, { useState } from "react";
import {
  Layout,
  Tabs,
  List,
  Typography,
  Space,
  Grid,
  Button,
  Modal,
} from "antd";
import { ProjectDto } from "../../../generated";
import { ReportModal } from "./ReportModal";

interface ProjectDetailsSidebarProps {
  project?: ProjectDto;
}

export const ProjectDetailsSidebar: React.FC<ProjectDetailsSidebarProps> = ({
  project,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const screens = Grid.useBreakpoint();

  return (
    <Layout.Sider
      width={400}
      theme="light"
      collapsible={screens.xs ? false : true}
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      reverseArrow
    >
      {!collapsed && project && (
        <div style={{ padding: 24 }}>
          <Typography.Title
            level={5}
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <>Project Details</>
            {project?.status === "IN_PROGRESS" && (
              <>
                <Button
                  type="primary"
                  danger
                  style={{ marginLeft: 8 }}
                  onClick={() => setShowReportModal(true)}
                >
                  Report
                </Button>

                <ReportModal
                  showReportModal={showReportModal}
                  setShowReportModal={setShowReportModal}
                  project={project}
                />
              </>
            )}
          </Typography.Title>

          <Tabs
            items={[
              {
                key: "overview",
                label: "Overview",
                children: (
                  <Space
                    direction="vertical"
                    style={{ maxHeight: "65vh", overflow: "auto" }}
                  >
                    <Typography.Text
                      style={{
                        overflow: "auto",
                      }}
                    >
                      {project.description}
                    </Typography.Text>
                    <Typography.Text>Status: {project.status}</Typography.Text>
                    <Typography.Text>
                      Budget: ${project.minBudget} - ${project.maxBudget}
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
                        <Typography.Text>
                          ${milestone.budgetRatio}
                        </Typography.Text>
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
