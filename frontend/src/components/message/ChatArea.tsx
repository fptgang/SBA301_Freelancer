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
import {
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  MessageDto,
  AccountDto,
  ProjectDto,
  FileDto,
} from "../../../generated";
import { MessageItem } from "./MessageItem";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow, set } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { store } from "../../store";

interface ChatAreaProps {
  selectedProject?: ProjectDto;
  newMessage?: MessageDto;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedProject,
  newMessage,
}) => {
  const [content, setContent] = useState("");
  const publish = usePublish();
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles] = useState<FileDto[]>([]);
  const [inputFiles, setInputFiles] = useState<FileList | null>(null);
  const user = store.getState().auth.account;

  const {
    data: messages,
    isLoading,
    isError,
    isFetching,
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

  const chatArea = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!content.trim() && files.length === 0) return;

    const data: MessageDto = {
      content: content,
      projectId: selectedProject?.projectId,
      sender: user,
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
    chatArea?.current?.scrollTo({ top: chatArea?.current?.scrollHeight });
  }, [selectedProject]);

  useEffect(() => {
    const handleScroll = () => {
      const current = chatArea?.current;
      if (
        current &&
        current.scrollTop === current.clientHeight - current.scrollHeight
      ) {
        if (messages?.data?.length === size && !loading) {
          const oldScrollTop = chatArea?.current?.scrollTop;
          setSize(size + 10);
          setLoading(true);
          setTimeout(() => {
            chatArea?.current?.scrollTo({ top: oldScrollTop });
            setLoading(false);
          }, 1000);
        }
      }
    };

    chatArea?.current?.addEventListener("scroll", handleScroll);

    return () => {
      chatArea?.current?.removeEventListener("scroll", handleScroll);
    };
  }, [size, loading, selectedProject, messages]);

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
            {selectedProject.status !== "IN_PROGRESS" ? (
              <Typography.Text type="danger" style={{ marginLeft: 8 }}>
                {selectedProject.status}
              </Typography.Text>
            ) : (
              ""
            )}
          </Typography.Title>

          <List
            ref={chatArea}
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
                  isCurrentUser={msg.sender?.accountId === user?.accountId}
                />
                {i == (messages?.data?.length || 0) - 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.sender?.accountId === user?.accountId
                          ? "end"
                          : "start",
                      color: "gray",
                    }}
                  >
                    <Typography.Text
                      style={{
                        textAlign:
                          msg.sender?.accountId === user?.accountId
                            ? "right"
                            : "left",
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
          {selectedProject?.status === "IN_PROGRESS" ? (
            <Space.Compact style={{ width: "100%", position: "relative" }}>
              {showEmoji && (
                <EmojiPicker
                  onEmojiClick={(e) => {
                    console.log(e);
                    setContent(content + e.emoji);
                  }}
                  style={{
                    position: "absolute",
                    bottom: 50,
                    left: 0,
                  }}
                />
              )}
              {/* <Button
              icon={<PaperClipOutlined />}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "image/*";
                input.onchange = (e) => {
                  console.log(e);
                  const fileList = (e.target as HTMLInputElement).files;
                  console.log(fileList);
                  if (fileList) {
                    setInputFiles(fileList);
                  }
                };
                input.click();
              }}
            /> */}
              <Button
                icon={<SmileOutlined />}
                onClick={() => {
                  setShowEmoji((prev) => !prev);
                }}
              />
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
          ) : (
            ""
          )}
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
