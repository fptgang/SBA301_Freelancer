// src/pages/components/MessageItem.tsx
import { Card, Space, Avatar, Typography, Button, Tooltip } from "antd";
import { UserOutlined, PaperClipOutlined } from "@ant-design/icons";
import { MessageDto } from "../../../generated";
import { formatDistanceToNow, format } from "date-fns";
import {useLocalSettings} from "../../hooks/useLocalSettings";

interface MessageItemProps {
  msg: MessageDto;
  isCurrentUser: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  isCurrentUser,
}) => {
  const [localSettings] = useLocalSettings()
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          flexDirection: isCurrentUser ? "row-reverse" : ("row" as const),
          marginBottom: 16,
        }}
      >
        <Tooltip title={`${msg.sender?.firstName} ${msg.sender?.lastName}`}>
          <Avatar
            src={msg.sender?.avatarUrl}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
        </Tooltip>

        <Tooltip
          title={
            msg.createdAt &&
            localSettings.formatDateTime(new Date(msg.createdAt))
          }
          placement={isCurrentUser ? "left" : "right"}
        >
          <Card
            size="small"
            style={{
              maxWidth: "70%",
              background: isCurrentUser ? "#1890ff" : "#f0f2f5",
              cursor: "pointer",
              opacity: msg.isVisible ? 1 : 0.4,
            }}
          >
            <Space direction="vertical">
              <Typography.Text
                style={{
                  color: isCurrentUser ? "white" : "black",
                  display: "block",
                }}
              >
                {msg.content}
              </Typography.Text>
              {msg.files?.map((file) => (
                <Button
                  key={file.fileId}
                  icon={<PaperClipOutlined />}
                  type="link"
                  href={file.fileUrl}
                  target="_blank"
                  style={{
                    color: isCurrentUser ? "white" : "inherit",
                    padding: 0,
                  }}
                >
                  {file.fileName}
                </Button>
              ))}
            </Space>
          </Card>
        </Tooltip>
      </div>
    </div>
  );
};
