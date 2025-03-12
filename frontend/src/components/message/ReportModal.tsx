import { useCreate } from "@refinedev/core";
import {
  Alert,
  Button,
  Input,
  Modal,
  notification,
  Result,
  Typography,
} from "antd";
import React from "react";
import { ProjectDto, ReportDto } from "../../../generated";
import { store } from "../../store";
interface ReportModalProps {
  showReportModal: boolean;
  setShowReportModal: (value: boolean) => void;
  project: ProjectDto;
}
export const ReportModal: React.FC<ReportModalProps> = ({
  showReportModal,
  setShowReportModal,
  project,
}) => {
  const reporterId = store.getState().auth.account?.accountId;
  const [reason, setReason] = React.useState("");
  const { mutate } = useCreate<ReportDto>({
    resource: "reports",
  });
  const handleReport = () => {
    if (!reporterId) return;
    if (!reason) {
      notification.error({ message: "Please provide a reason" });
      return;
    }
    mutate({
      values: {
        reporterId: reporterId,
        projectId: project.projectId,
        reason: reason,
      },
    });
    setReason("");
  };
  return (
    <Modal
      title={`Report ${project.title}`}
      visible={showReportModal}
      onOk={() => {
        handleReport();
        setShowReportModal(false);
      }}
      onCancel={() => {
        setShowReportModal(false);
        setReason("");
      }}
    >
      <Typography.Title level={5}>Reason:</Typography.Title>
      <Input.TextArea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />
      <br />
      <br />
      <Alert
        type="warning"
        message="After you report this project, it will be reviewed by our team. If the project violates our terms of service, it will be removed from the platform."
      />
    </Modal>
  );
};
