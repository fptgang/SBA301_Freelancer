// src/pages/components/ChatArea.tsx
import { useList, useCreate, usePublish, HttpError } from "@refinedev/core";
import {
  Card,
  Layout,
  List,
  Typography,
  Space,
  Input,
  Button,
  Spin,
  Result,
} from "antd";
import { PaperClipOutlined, SendOutlined } from "@ant-design/icons";
import { MessageDto, AccountDto, ProjectDto } from "../../../generated";
import { MessageItem } from "./MessageItem";
import { useEffect, useState } from "react";
import { formatDistanceToNow, set } from "date-fns";
import { time } from "console";

interface ChatAreaProps {
  selectedProject?: ProjectDto;
  user?: AccountDto;
  files: File[];
  setFiles: (files: File[]) => void;
  newMessage?: MessageDto;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedProject,
  user,
  files,
  setFiles,
  newMessage,
}) => {
  const [content, setContent] = useState("");
  const publish = usePublish();
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const {
    data: messages,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useList<MessageDto>({
    resource: "messages",
    filters: [
      {
        field: "project.projectId",
        operator: "eq",
        value: selectedProject?.projectId,
      },
    ],
    queryOptions: { enabled: !!selectedProject },
    pagination: { pageSize: size },
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const [newMessages, setNewMessages] = useState<MessageDto[]>([]);

  const handleSendMessage = () => {
    if (!content.trim() && files.length === 0) return;

    const data: MessageDto = {
      content: content,
      projectId: selectedProject?.projectId,
      senderId: user?.id,
      files,
    };

    if (publish) {
      publish({
        channel: "/app/chat.sendMessage/" + selectedProject?.projectId,
        type: "SEND",
        payload: data,
        date: new Date(),
      });
    }
    setFiles([]);
    setContent("");
  };

  useEffect(() => {
    setSize(20);
    setNewMessages([]);
    const chatArea = document.querySelector(".ant-list") as HTMLElement;
    chatArea?.scrollTo({ top: chatArea.scrollHeight });
  }, [selectedProject]);

  useEffect(() => {
    const chatArea = document.querySelector(".ant-list") as HTMLElement;
    const handleScroll = () => {
      if (chatArea.scrollTop == chatArea.clientHeight - chatArea.scrollHeight) {
        console.log(messages, size, loading);
        if (messages?.data?.length === size && !loading) {
          const oldScrollTop = chatArea.scrollTop;
          setSize(size + 10);
          setLoading(true);
          setTimeout(() => {
            chatArea?.scrollTo({ top: oldScrollTop });
            setLoading(false);
          }, 1000);
        }
      }
    };

    chatArea?.addEventListener("scroll", handleScroll);

    return () => {
      chatArea?.removeEventListener("scroll", handleScroll);
    };
  }, [size, loading]);

  useEffect(() => {
    // console.log(newMessages);
    // if (newMessage?.projectId === selectedProject?.projectId && newMessage) {
    //   setNewMessages((prev) => [...prev, newMessage]);
    // }
    if (newMessage?.projectId === selectedProject?.projectId && newMessage) {
      setSize(size + 1);
      refetch();
    }
  }, [newMessage]);

  if (selectedProject && isLoading)
    return (
      <Layout.Content style={{ padding: "24px", overflow: "initial" }}>
        <Spin />
      </Layout.Content>
    );
  if (selectedProject && isError)
    return (
      <Layout.Content style={{ padding: "24px", overflow: "initial" }}>
        <Result status="warning" title="There are some problems." />
      </Layout.Content>
    );

  return (
    <Layout.Content style={{ padding: "24px", overflow: "initial" }}>
      {selectedProject ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          <Typography.Title level={4} style={{ marginBottom: 16 }}>
            {selectedProject.title}
          </Typography.Title>

          <List
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              overflowY: "auto",
              marginBottom: 16,
              maxHeight: "calc(100vh - 13rem)",
              height: "100%",
              minHeight: "calc(100vh - 13rem)",
            }}
            dataSource={
              // newMessages &&
              // (messages?.data.find(
              //   (m) => m.messageId != newMessage?.messageId
              // )
              //   ? messages?.data?.push(...newMessages)
              //   : true) &&
              messages?.data?.sort(
                (a, b) =>
                  new Date(a.createdAt || 0).getTime() -
                  new Date(b.createdAt || 0).getTime()
              ) || []
            }
            renderItem={(msg, i) => (
              <>
                <MessageItem
                  msg={msg}
                  isCurrentUser={msg.senderId === user?.id}
                />
                {i == (messages?.data?.length || 0) - 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.senderId === user?.id ? "end" : "start",
                      color: "gray",
                    }}
                  >
                    <Typography.Text
                      style={{
                        textAlign: msg.senderId === user?.id ? "right" : "left",
                        color: "gray",
                      }}
                    >
                      {msg.createdAt &&
                        formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        }).replace("about", "")}
                    </Typography.Text>
                  </div>
                )}
              </>
            )}
            loading={loading}
          />

          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Type a message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPressEnter={handleSendMessage}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
            />
          </Space.Compact>
        </div>
      ) : (
        <Typography.Text
          type="secondary"
          style={{
            textAlign: "center",
            padding: 24,
            maxHeight: "calc(100vh - 13rem)",
            height: "100%",
            minHeight: "calc(100vh - 13rem)",
          }}
        >
          Select a project to start chatting
        </Typography.Text>
      )}
    </Layout.Content>
  );
};
