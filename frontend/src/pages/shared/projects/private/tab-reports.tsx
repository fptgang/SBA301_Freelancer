import {Avatar, Badge, Button, List, Popconfirm, Tag, Typography, Select} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined
} from "@ant-design/icons";
import React, {useState} from "react";
import {useCustomMutation, useInvalidate, useList} from "@refinedev/core";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import { ProjectDto } from "../../../../../generated";

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