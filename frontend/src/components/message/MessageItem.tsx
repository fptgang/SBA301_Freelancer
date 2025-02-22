// src/pages/components/MessageItem.tsx
import { Card, Space, Avatar, Typography, Button, Tooltip } from "antd";
import { UserOutlined, PaperClipOutlined } from "@ant-design/icons";
import { MessageDto } from "../../../generated";
import { formatDistanceToNow, format } from "date-fns";

interface MessageItemProps {
  msg: MessageDto;
  isCurrentUser: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  isCurrentUser,
}) => {
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
        <Tooltip title={`Sender: User #${msg.senderId}`}>
          <Avatar
            src={msg.senderId}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
        </Tooltip>

        <Tooltip
          title={
            msg.createdAt &&
            format(new Date(msg.createdAt), "yyyy-MM-dd HH:mm:ss")
          }
          placement={isCurrentUser ? "left" : "right"}
        >
          <Card
            size="small"
            style={{
              maxWidth: "70%",
              background: isCurrentUser ? "#1890ff" : "#f0f2f5",
              cursor: "pointer",
            }}
          >
            <Space direction="vertical">
              <Typography.Text
                style={{
                  color: isCurrentUser ? "white" : "inherit",
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
