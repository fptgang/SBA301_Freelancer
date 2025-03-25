import { Typography, Table, Tag, Button, Space, Card } from "antd";
import React, { useState } from "react";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";
import { ProjectDto, ReportDto } from "../../../../../generated";
import dayjs from "dayjs";
import { EyeOutlined } from "@ant-design/icons";
import ReportDetailModal from "./report-detail-modal";

const { Title, Paragraph } = Typography;

const TabReports: React.FC<{
  project: ProjectDto;
}> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

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

  const handleViewDetail = (report: ReportDto) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedReport(null);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "reportId",
      key: "reportId",
      width: 80,
    },
    {
      title: "Reporter",
      dataIndex: "reporter",
      key: "reporter",
      render: (reporter: any) =>
        reporter
          ? `${reporter.firstName || ""} ${reporter.lastName || ""}` || "N/A"
          : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: Date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (_: any, record: ReportDto) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="mb-4">
      {project.reports && project.reports.length > 0 ? (
        <Card className="shadow-sm">
          <Table
            title={() => <Title level={5}>Reports </Title>}
            columns={columns}
            dataSource={project.reports}
            rowKey="reportId"
            pagination={{ pageSize: 10 }}
            className="reports-table"
            rowClassName={(record) =>
              record.status === "UNSOLVED" ? "unsolved-row" : ""
            }
          />
        </Card>
      ) : (
        <Card className="shadow-sm text-center py-5">
          <Paragraph>No reports found for this project.</Paragraph>
        </Card>
      )}

      {selectedReport && (
        <ReportDetailModal
          visible={detailModalVisible}
          reportId={selectedReport?.reportId || 0}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TabReports;
