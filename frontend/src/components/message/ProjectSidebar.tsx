import { Typography, Layout, Menu, MenuProps, Badge } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { MessageDto, ProjectDto } from "../../../generated";
import { useState } from "react";
import { MessageIcon } from "./MessageIcon";
import { ProjectMessageLabel } from "./ProjectMessageLabel";

interface ProjectSidebarProps {
  projects: ProjectDto[];
  selectedProject?: ProjectDto;
  onSelectProject: (project: ProjectDto) => void;
  newMessage?: MessageDto;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  newMessage,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Ensure menu items match the correct TypeScript definition
  const menuItems: MenuProps["items"] = projects.map((project) => ({
    key: project.projectId || "", // Ensure key is a string
    icon: (
      <MessageIcon
        project={project}
        selectedProject={selectedProject}
        newMessage={newMessage}
      />
    ),
    title: project.title,
    label: collapsed ? null : (
      <ProjectMessageLabel
        project={project}
        selectedProject={selectedProject}
        newMessage={newMessage}
      />
    ),
    style: {
      background:
        selectedProject?.projectId === project.projectId ? "#f0f2f5" : "white",
      height: 80,
      display: "flex",
    },
    onClick: () => onSelectProject(project),
  }));

  return (
    <Layout.Sider
      width={300}
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        overflow: "auto",
        left: 0,
        maxHeight: "90vh",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedProject?.projectId?.toString() || ""]}
        items={menuItems} // Use the new format with correct typing
      />
    </Layout.Sider>
  );
};
