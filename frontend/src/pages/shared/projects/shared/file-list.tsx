import React from "react";
import {FileDto, ProjectDto} from "../../../../../generated";
import {Avatar, Button, Divider, List, Tag, Typography} from "antd";
import {FileTextOutlined, ToolOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";


const FileList: React.FC<{ files: FileDto[] }> = ({ files }) => {
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
<List
          itemLayout="horizontal"
          dataSource={files}
          renderItem={(file: any, index: number) => (
            <List.Item
              key={index}
              className="border-b border-gray-100 last:border-0"
              actions={[
                <Button
                  key="download"
                  type="link"
                  onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                  icon={<FileTextOutlined />}
                >
                  Download
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<FileTextOutlined />}
                    size="large"
                    className="bg-gray-500"
                  />
                }
                title={
                  file.fileName
                }
                description={
                  <div className="text-xs text-gray-500">
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "Unknown size"}
                          </span>
                    {file.createdAt && (
                      <span className="ml-3">
                              Uploaded: {localSettings.formatDate(file.createdAt)}
                            </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}/>
          </>
      };
      
      export default FileList;