// src/pages/project-chat.tsx
import {
  useList,
  useOne,
  useCreate,
  useGetIdentity,
  useSubscription,
} from "@refinedev/core";
import { Layout, Grid, Tabs, Typography } from "antd";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { AccountDto, MessageDto, ProjectDto } from "../../../../generated";
import { ProjectSidebar } from "../../../components/message/ProjectSidebar";
import { ChatArea } from "../../../components/message/ChatArea";
import { ProjectDetailsSidebar } from "../../../components/message/ProjectDetailsSideBar";

export const Message: React.FC = () => {
  const { data: user } = useGetIdentity<AccountDto>();
  const [selectedProject, setSelectedProject] = useState<ProjectDto>();
  const [files, setFiles] = useState<File[]>([]);
  const [newMessage, setNewMessage] = useState<MessageDto>();
  const [pageSize, setPageSize] = useState(10);

  // Fetch projects where current user is participant
  const { data: projects, refetch } = useList<ProjectDto>({
    resource: "projects",
    filters: [{ field: "client.accountId", operator: "eq", value: user?.id }],
    pagination: { pageSize },
  });

  useSubscription({
    channel: "message/escrow@hirable.com",
    onLiveEvent: (event) => {
      console.log(event);
      setNewMessage(event.payload as MessageDto);
      if ((event.payload as MessageDto).senderId !== user?.id) {
        const audio = new Audio("./src/assets/notification.mp3");
        audio.play();
      }
    },
  });

  useEffect(() => {
    if (projects?.data?.length && !selectedProject) {
      setSelectedProject(projects.data[0]);
    }
  }, [projects]);

  useEffect(() => {
    refetch();
  }, [newMessage]);

  // useEffect(() => {
  //   if (newMessage) {
  //     setSelectedProject((prev) => {
  //       if (prev?.projectId === newMessage.project.projectId) {
  //         return prev;
  //       }
  //       return newMessage.project;
  //     });
  //   }
  return (
    <Layout hasSider>
      <ProjectSidebar
        projects={projects?.data || []}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        newMessage={newMessage}
        // collapsed={!screens.md}
      />

      <ChatArea
        selectedProject={selectedProject}
        user={user}
        files={files}
        setFiles={setFiles}
        newMessage={newMessage}
      />

      <ProjectDetailsSidebar project={selectedProject} />
    </Layout>
  );
};
