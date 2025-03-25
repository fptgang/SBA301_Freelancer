// Define MilestoneDetailModal component
import {ProjectDto} from "../../../../../generated";
import React, {useEffect, useState} from "react";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import {useNotification} from "@refinedev/core";
import api from "../../../../services/api/openapi-config";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  List,
  Modal,
  Popconfirm,
  Progress,
  Tag
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";

interface MilestoneDetailModalProps {
  visible: boolean;
  milestone: any;
  project: ProjectDto;
  onClose: () => void;
  onConfirmCompletion: (milestone: any) => Promise<void>;
  onReport: () => void;
}

const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
                                                                     visible,
                                                                     milestone,
                                                                     project,
                                                                     onClose,
                                                                     onConfirmCompletion,
                                                                     onReport,
                                                                   }) => {
  const [localSettings] = useLocalSettings();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const {open} = useNotification();

  // Fetch contract data if available
  useEffect(() => {
    const fetchContractData = async () => {
      if (visible && milestone && project?.contract?.contractId) {
        try {
          const contractData = await api.getContractById({
            contractId: project.contract.contractId
          });
          setContract(contractData);
        } catch (error) {
          console.error("Error fetching contract data:", error);
        }
      }
    };

    fetchContractData();
  }, [visible, milestone, project]);

  const handleConfirm = async () => {
    try {
      setConfirmLoading(true);
      await onConfirmCompletion(milestone);
      onClose();
    } catch (error) {
      console.error("Failed to confirm milestone:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine if contract is signed
  const isContractSigned = contract?.status === "SIGNED";

  if (!milestone) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ClockCircleOutlined className="text-blue-500 mr-2"/>
          <span>Milestone Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Card className="mb-4">
        <Title level={4}>{milestone.title}</Title>
        <Paragraph
          className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100 mt-3">
          {milestone.description}
        </Paragraph>

        <Descriptions layout="vertical" className="mt-4" bordered>
          <Descriptions.Item label="Status">
            <Tag
              color={
                milestone.status === "FINISHED"
                  ? "green"
                  : milestone.status === "IN_PROGRESS"
                    ? "blue"
                    : milestone.status === "REVIEWING"
                      ? "orange"
                      : "default"
              }
            >
              {milestone.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Budget Allocation">
            <Progress
              percent={milestone.budgetRatio ? (milestone.budgetRatio * 100) : 0}
              size="small"
              status="active"
              format={(percent) => `${percent?.toFixed(0)}%`}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {milestone.deadline ? localSettings.formatDateTime(milestone.deadline) : "Not set"}
          </Descriptions.Item>
        </Descriptions>

        {/* Contract Status - Show if there's a contract */}
        {contract && (
          <div className="mt-4">
            <Title level={5} className="mb-3">
              <FileTextOutlined className="mr-2"/> Contract Status
            </Title>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <Descriptions layout="horizontal" bordered size="small">
                <Descriptions.Item label="Contract ID">
                  {contract.contractId}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={contract.status === "SIGNED" ? "green" : "orange"}>
                    {contract.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {localSettings.formatDateTime(contract.createdAt)}
                </Descriptions.Item>
                {contract.signedAt && (
                  <Descriptions.Item label="Signed At">
                    {localSettings.formatDateTime(contract.signedAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>
        )}

        {/* Deliverable Files Section */}
        {milestone.deliverables && milestone.deliverables.length > 0 && (
          <div className="mt-4">
            <Title level={5} className="mb-3">
              <FileTextOutlined className="mr-2"/> Deliverable Files
            </Title>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <List
                itemLayout="horizontal"
                dataSource={milestone.deliverables}
                renderItem={(file: any, index: number) => (
                  <List.Item
                    key={index}
                    className="border-b border-gray-100 last:border-0 py-3"
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                        icon={<FileTextOutlined/>}
                      >
                        Download
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<FileTextOutlined/>}
                          size="large"
                          className={`${
                            file.fileType?.includes("image")
                              ? "bg-blue-500"
                              : file.fileType?.includes("pdf")
                                ? "bg-red-500"
                                : file.fileType?.includes("word") || file.fileType?.includes("doc")
                                  ? "bg-indigo-500"
                                  : file.fileType?.includes("excel") || file.fileType?.includes("sheet")
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                          }`}
                        />
                      }
                      title={
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {file.fileName}
                        </a>
                      }
                      description={
                        <div className="text-xs text-gray-500">
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "Unknown size"}
                          </span>
                          {file.uploadDate && (
                            <span className="ml-3">
                              Uploaded: {localSettings.formatDate(file.uploadDate)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* Files Preview Section - Show if there are files */}
        {milestone.files && milestone.files.length > 0 && (
          <div className="mt-4">
            <Title level={5} className="mb-3">
              <FileTextOutlined className="mr-2"/> Attachments
            </Title>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <List
                itemLayout="horizontal"
                dataSource={milestone.files}
                renderItem={(file: any, index: number) => (
                  <List.Item
                    key={index}
                    className="border-b border-gray-100 last:border-0 py-3"
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                        icon={<FileTextOutlined/>}
                      >
                        Download
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<FileTextOutlined/>}
                          size="large"
                          className={`${
                            file.fileType?.includes("image")
                              ? "bg-blue-500"
                              : file.fileType?.includes("pdf")
                                ? "bg-red-500"
                                : file.fileType?.includes("word") || file.fileType?.includes("doc")
                                  ? "bg-indigo-500"
                                  : file.fileType?.includes("excel") || file.fileType?.includes("sheet")
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                          }`}
                        />
                      }
                      title={
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {file.fileName}
                        </a>
                      }
                      description={
                        <div className="text-xs text-gray-500">
                          <span>
                            {file.fileSize
                              ? `${(file.fileSize / 1024).toFixed(2)} KB`
                              : "Unknown size"}
                          </span>
                          {file.uploadDate && (
                            <span className="ml-3">
                              Uploaded: {localSettings.formatDate(file.uploadDate)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* Only show actions if milestone is in REVIEWING status and contract is not already signed */}
        {milestone.status === "REVIEWING" && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              danger
              onClick={onReport}
            >
              Report Issue
            </Button>
            {(!contract || contract.status !== "SIGNED") && (
              <Popconfirm
                title="Confirm milestone completion"
                description="Are you sure you want to mark this milestone as complete? This action will release the payment to the freelancer."
                icon={<ExclamationCircleOutlined style={{color: 'green'}}/>}
                onConfirm={handleConfirm}
                okText="Yes, Complete"
                cancelText="Cancel"
                okButtonProps={{loading: confirmLoading}}
              >
                <Button type="primary">
                  Confirm Completion
                </Button>
              </Popconfirm>
            )}
            {contract && contract.status === "SIGNED" && (
              <Button type="primary" disabled>
                Already Completed
              </Button>
            )}
          </div>
        )}
      </Card>
    </Modal>
  );
};
