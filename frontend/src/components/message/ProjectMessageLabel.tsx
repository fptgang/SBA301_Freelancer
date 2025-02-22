import { Typography } from "antd";
import React, { useEffect, useState } from "react";
import { MessageDto, ProjectDto } from "../../../generated";
interface LabelProps {
  project: ProjectDto;
  selectedProject?: ProjectDto;
  newMessage?: MessageDto;
}
export const ProjectMessageLabel: React.FC<LabelProps> = ({
  project,
  newMessage,
  selectedProject,
}) => {
  const [strong, setStrong] = useState(false);
  useEffect(() => {
    if (
      newMessage?.projectId === project.projectId &&
      newMessage?.projectId !== selectedProject?.projectId
    ) {
      setStrong(true);
    }
  }, [newMessage, project]);

  useEffect(() => {
    if (newMessage?.projectId === selectedProject?.projectId) {
      setStrong(false);
    }
  }, [selectedProject, project]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 10,
      }}
    >
      <Typography.Title style={{ margin: 0, fontSize: "1rem" }}>
        {project.title}
      </Typography.Title>
      <Typography.Text
        ellipsis
        style={{ width: "100%", paddingRight: 15 }}
        strong={strong}
      >
        {newMessage?.projectId === project.projectId
          ? newMessage?.content?.slice(0, 50)
          : project.latestMessage?.content?.slice(0, 50)}{" "}
      </Typography.Text>
    </div>
  );
};
