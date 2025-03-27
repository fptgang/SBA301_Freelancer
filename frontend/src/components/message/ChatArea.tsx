// src/pages/components/ChatArea.tsx
import {
  useList,
  useCreate,
  usePublish,
  HttpError,
  useGetIdentity,
} from "@refinedev/core";
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
  UploadFile,
  Upload,
  message,
} from "antd";
import {
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  InboxOutlined,
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
import api from "../../services/api/openapi-config";

// Add CSS for animations
const styles = {
  uploadCard: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .upload-card {
      animation: slideUp 0.3s ease-out;
    }
  `,
};

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
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [publisedFiles, setPublishedFiles] = useState<UploadFile[]>([]);
  const { data: user } = useGetIdentity<AccountDto>();

  // Inject CSS for animations
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = styles.uploadCard;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    if (
      publisedFiles &&
      newMessage &&
      newMessage.projectId === selectedProject?.projectId &&
      newMessage.sender?.accountId === user?.accountId
    ) {
      publisedFiles.forEach(async (file) => {
        const data = await api
          .uploadFile({
            blob: file.originFileObj,
            messageId: newMessage.messageId,
          })
          .then((res) => {
            console.log(res);
            refetch();
          });
        console.log(data);
      });
    }
  }, [newMessage]);

  const {
    data: messages,
    isLoading,
    isError,
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

  const props = {
    name: "file",
    multiple: true,
    onChange(info: any) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
      // Update the files state with the current fileList
      setFiles(info.fileList);
    },
    onRemove(file: any) {
      setFiles((prev) => prev.filter((f) => f.uid !== file.uid));
      return true;
    },
    beforeUpload: (file: any) => {
      // Update files but prevent automatic upload
      setFiles((prev) => [...prev, file]);
      return false;
    },
    fileList: files,
  };

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
    setPublishedFiles(files);
    setFiles([]);
    setContent("");
    setShowUpload(false);
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
                    zIndex: 10,
                  }}
                />
              )}

              {showUpload && (
                <Card
                  className="upload-card w-full"
                  style={{
                    position: "absolute",
                    bottom: 50,
                    left: 0,
                    zIndex: 10,
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                  }}
                >
                  <Upload.Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ color: "#1890ff" }} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag files to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for images, documents, and other files
                    </p>
                  </Upload.Dragger>
                  <div
                    style={{
                      marginTop: 16,
                      textAlign: "right",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button onClick={() => setFiles([])}>Clear All</Button>
                    <Button type="primary" onClick={() => setShowUpload(false)}>
                      Done
                    </Button>
                  </div>
                </Card>
              )}

              <Button
                icon={<PaperClipOutlined />}
                onClick={() => {
                  setShowUpload(!showUpload);
                  setShowEmoji(false);
                }}
              />
              <Button
                icon={<SmileOutlined />}
                onClick={() => {
                  setShowEmoji(!showEmoji);
                  setShowUpload(false);
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
