import React from "react";
import {ProjectDto} from "../../../../../generated";
import {Avatar, Button, Divider, List, Tag, Typography} from "antd";
import {FileTextOutlined, ToolOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import FileList from "../../../../components/common/file-list";

const { Title, Text, Paragraph } = Typography;

const TabProjectDetail: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings();

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <>
      <div className="py-2">
        <Title level={5} className="text-blue-600">
          Project Description
        </Title>
        <Paragraph className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-100">
          {project.description}
        </Paragraph>

        <Divider />

        <Title level={5} className="text-blue-600">
          Required Skills
        </Title>
        {project.requiredSkills && project.requiredSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.requiredSkills.map((projectSkill, index) => (
              <Tag
                key={projectSkill.projectSkillId || index}
                color="blue"
                className="flex items-center px-3 py-1 rounded-full"
              >
                <ToolOutlined className="mr-1" />
                {projectSkill.skill?.name} - {projectSkill.proficiency}
              </Tag>
            ))}
          </div>
        ) : (
          <Text type="secondary" className="italic">
            No specific skills required
          </Text>
        )}

        <Divider />

        
        <Title level={5} className="text-gray-700">
          Attachments
        </Title>
        {project.files && project.files.length > 0 ? (
          <>
            <FileList files={project.files.filter(file => file.isVisible)} />
          </>
        ) : (
          <Text type="secondary" className="italic">
            No attachments
          </Text>
        )}
      </div>
    </>
};

export default TabProjectDetail;