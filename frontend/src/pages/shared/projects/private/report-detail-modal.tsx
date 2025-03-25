import React from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Timeline,
  Space,
  Avatar,
} from "antd";
import { ReportDto } from "../../../../../generated";
import dayjs from "dayjs";
import {
  UserOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useOne } from "@refinedev/core";

const { Title, Text, Paragraph } = Typography;

interface ReportDetailModalProps {
  visible: boolean;
  reportId: number;
  onClose: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  visible,
  reportId,
  onClose,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "UNSOLVED":
        return "red";
      case "SOLVING":
        return "orange";
      case "SOLVED":
        return "green";
      default:
        return "default";
    }
  };

  const { data } = useOne<ReportDto>({
    resource: "reports",
    id: reportId,
  });

  const report = data?.data;

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Report Details</span>
          <Tag color={getStatusColor(report?.status)}>{report?.status}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={1} className="mb-4">
        <Descriptions.Item label="Report ID">
          {report?.reportId}
        </Descriptions.Item>
        <Descriptions.Item label="Reporter">
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            {report?.reporter
              ? `${report.reporter.firstName || ""} ${
                  report.reporter.lastName || ""
                }`
              : "N/A"}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Project ID">
          {report?.projectId}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Report Content</Divider>

      <Title level={5}>Reason</Title>
      <Paragraph className="bg-gray-50 p-3 rounded mb-4">
        {report?.reason || "No reason provided"}
      </Paragraph>

      <Title level={5}>Solution</Title>
      <Paragraph className="bg-gray-50 p-3 rounded">
        {report?.solution || "No solution yet"}
      </Paragraph>

      <Divider orientation="left">Timeline</Divider>

      <Timeline
        items={[
          {
            dot: <ClockCircleOutlined className="timeline-clock-icon" />,
            children: (
              <Space direction="vertical">
                <Text strong>Created</Text>
                <Text type="secondary">
                  {report?.createdAt
                    ? dayjs(report.createdAt).format("YYYY-MM-DD HH:mm:ss")
                    : "N/A"}
                </Text>
              </Space>
            ),
          },
          {
            dot: <EditOutlined className="timeline-edit-icon" />,
            children: (
              <Space direction="vertical">
                <Text strong>Last Updated</Text>
                <Text type="secondary">
                  {report?.updatedAt
                    ? dayjs(report.updatedAt).format("YYYY-MM-DD HH:mm:ss")
                    : "N/A"}
                </Text>
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ReportDetailModal;
