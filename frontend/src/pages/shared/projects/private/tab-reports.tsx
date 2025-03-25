import {Typography} from "antd";
import React from "react";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import {ProjectDto} from "../../../../../generated";

const {Title, Text, Paragraph} = Typography;

const TabReports: React.FC<{
  project: ProjectDto
}>
  = ({project}) => {
  const [localSettings] = useLocalSettings()

  return <>
    <div className="mb-4">

    </div>
  </>
};

export default TabReports;