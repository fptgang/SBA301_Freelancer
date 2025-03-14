// src/pages/project-chat.tsx
import {
  useList,
  useOne,
  useCreate,
  useGetIdentity,
  useSubscription,
} from "@refinedev/core";
import { Layout, Grid, Tabs, Typography } from "antd";
import { data, useLocation, useParams } from "react-router";
import { useEffect, useState } from "react";
import { AccountDto, MessageDto, ProjectDto } from "../../../../generated";
import { ProjectSidebar } from "../../../components/message/ProjectSidebar";
import { ChatArea } from "../../../components/message/ChatArea";
import { ProjectDetailsSidebar } from "../../../components/message/ProjectDetailsSideBar";
import { parseJwt } from "../../../utils/parse-jwt";
import { store } from "../../../store";

export const Message: React.FC = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState<ProjectDto>();
  const [files, setFiles] = useState<File[]>([]);
  const [newMessage, setNewMessage] = useState<MessageDto>();
  const [pageSize, setPageSize] = useState(20);
  const email = store?.getState().auth.account?.email;
  const userId = store?.getState().auth.account?.accountId;

  // Fetch projects where current user is participant
  const { data: projects, refetch } = useList<ProjectDto>({
    resource: "projects",
    pagination: { pageSize },
    // sorters: [{ field: "messages.createdAt", order: "desc" }],
    meta: {
      param: [
        // { field: "participantId", value: userId },
        { field: "type", value: "chat" },
      ],
    },
  });

  useSubscription({
    channel: "message/" + email,
    onLiveEvent: (event) => {
      console.log(event);
      setNewMessage(event.payload as MessageDto);
      if (
        // (event.payload as MessageDto).senderId !== user?.id ||
        (event.payload as MessageDto).sender?.accountId !== userId
      ) {
        const audio = new Audio("./src/assets/notification.mp3");
        audio.play();
      }
    },
    enabled: !!email,
  });

  useEffect(() => {
    if (projects?.data?.length) {
      if (location?.state?.projectId) {
        setSelectedProject(
          projects.data.find(
            (project) => project.projectId === location.state.projectId
          )
        );
      } else {
        setSelectedProject(projects.data[0]);
      }
    }
  }, [projects]);

  useEffect(() => {
    refetch().then((data) => {
      if (data?.data?.length) {
        if (location?.state?.projectId) {
          setSelectedProject(
            data?.data.find(
              (project: ProjectDto) =>
                project.projectId === location.state.projectId
            )
          );
        } else {
          setSelectedProject(data.data[0]);
        }
      }
    });
  }, [location]);

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

      <ChatArea selectedProject={selectedProject} newMessage={newMessage} />

      <ProjectDetailsSidebar project={selectedProject} />
    </Layout>
  );
};
