import { MessageOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import React, { useEffect, useState } from "react";
import { MessageDto, ProjectDto } from "../../../generated";

interface MessageIconProps {
  project: ProjectDto;
  selectedProject?: ProjectDto;
  newMessage?: MessageDto;
}
export const MessageIcon: React.FC<MessageIconProps> = ({
  project,
  selectedProject,
  newMessage,
}) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (
      newMessage?.projectId === project.projectId &&
      newMessage?.projectId !== selectedProject?.projectId
    ) {
      setShow(true);
    }
  }, [newMessage, project]);

  useEffect(() => {
    if (newMessage?.projectId === selectedProject?.projectId) {
      setShow(false);
    }
  }, [selectedProject, project]);
  return (
    <Badge dot={show}>
      <MessageOutlined />
    </Badge>
  );
};
