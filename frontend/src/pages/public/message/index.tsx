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
import { parseJwt } from "../../../utils/parse-jwt";

export const Message: React.FC = () => {
  const { data: user } = useGetIdentity<AccountDto>();
  const [selectedProject, setSelectedProject] = useState<ProjectDto>();
  const [files, setFiles] = useState<File[]>([]);
  const [newMessage, setNewMessage] = useState<MessageDto>();
  const [pageSize, setPageSize] = useState(20);
  const email = parseJwt(localStorage.getItem("refine-auth") ?? "")?.sub;
  const userId = parseJwt(localStorage.getItem("refine-auth") ?? "")?.accountId;

  // Fetch projects where current user is participant
  const { data: projects, refetch } = useList<ProjectDto>({
    resource: "projects",
    pagination: { pageSize },
    // sorters: [{ field: "messages.createdAt", order: "desc" }],
    meta: {
      param: [
        { field: "participantId", value: userId },
        { field: "type", value: "chat" },
      ],
    },
  });

  if (email)
    useSubscription({
      channel: "message/" + email,
      onLiveEvent: (event) => {
        console.log(event);
        setNewMessage(event.payload as MessageDto);
        if (
          // (event.payload as MessageDto).senderId !== user?.id ||
          (event.payload as MessageDto).senderId !== userId
        ) {
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

  const handleScroll = (e: any) => {
    if (
      e.currentTarget.scrollTop + e.currentTarget.clientHeight ===
      e.currentTarget.scrollHeight
    ) {
      if (projects?.data?.length === pageSize) {
        setPageSize((size: number) => size + 10);
      }
    }
  };
  return (
    <Layout hasSider>
      <ProjectSidebar
        projects={
          projects?.data?.sort(
            (a, b) =>
              new Date(b.latestMessage?.createdAt || "").getTime() -
              new Date(a.latestMessage?.createdAt || "").getTime()
          ) || []
        }
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        newMessage={newMessage}
        handleScroll={handleScroll}
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
