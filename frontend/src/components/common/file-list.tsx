import React from "react";
import {FileDto} from "../../../generated";
import {Avatar, Button, List, Typography} from "antd";
import {FileTextOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../hooks/useLocalSettings";


const {Title, Text, Paragraph} = Typography;

export const handleFileDownload = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FileList: React.FC<{ files: FileDto[] }> = ({files}) => {
  const [localSettings] = useLocalSettings();

  return <>
    <List
      size="small"
      itemLayout="vertical"
      dataSource={files}
      renderItem={(file: any, index: number) => (
        <List.Item
          key={index}
          className="border-b border-gray-100 last:border-0"
        >
          <List.Item.Meta
            avatar={
              <Avatar
                icon={<FileTextOutlined/>}
                size="large"
                className="bg-gray-500"
              />
            }
            description={
              <>
                <div className="flex justify-between items-center">
                  <Text>{file.fileName}</Text>
                  <Button
                    key="download"
                    type="link"
                    onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                    icon={<FileTextOutlined/>}
                  >
                    Download
                  </Button>
                </div>
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
              </>
            }
          />
        </List.Item>
      )}/>
  </>
};

export default FileList;