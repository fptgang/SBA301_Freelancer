import React from "react";
import {ProjectDto} from "../../../../../generated";
import {Alert} from "antd";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

const ProjectToTerminate: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings()

  if (!project.toTerminate || !project.activeMilestone?.deadline) {
    return <></>
  }

  const toTerminateAt = localSettings.formatDateTime(project.activeMilestone.deadline)

  return <>
    <Alert
      message={`Project has been scheduled to be terminated at ${toTerminateAt}`}
      type="error"
      showIcon
      className="mb-6 shadow-sm"
    />
  </>
};

export default ProjectToTerminate;