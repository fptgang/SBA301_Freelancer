import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Alert,
  Popconfirm,
} from "antd";
import { HttpError, useNotification } from "@refinedev/core";
import { CloseCircleOutlined } from "@ant-design/icons";
import { ProposalDto } from "../../../../../generated";
import api from "../../../../services/api/openapi-config";

const { TextArea } = Input;
const { Text } = Typography;

interface ContractRejectButtonProps {
  proposalId: number;
  onSuccess?: () => void;
}

export const ContractRejectButton: React.FC<ContractRejectButtonProps> = ({
  proposalId,
  onSuccess,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { open } = useNotification();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleReject = async (values: { rejectReason: string }) => {
    setSubmitting(true);
    try {
      await api.rejectProposal({
        proposalId,
        rejectReason: values.rejectReason,
      });

      open?.({
        type: "success",
        message: "Proposal rejected successfully",
      });

      setIsModalVisible(false);
      form.resetFields();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const httpError = error as HttpError;
      open?.({
        type: "error",
        message: "Failed to reject proposal",
        description: httpError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        danger 
        icon={<CloseCircleOutlined />} 
        onClick={showModal}
      >
        Reject Proposal
      </Button>

      <Modal
        title="Reject Proposal"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        maskClosable={false}
        width={600}
      >
        <Alert
          message="Rejection Information"
          description="Please provide a reason for rejecting this proposal. This feedback will be sent to the freelancer."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleReject}
          initialValues={{ rejectReason: "" }}
        >
          <Form.Item
            name="rejectReason"
            label="Rejection Reason"
            rules={[
              {
                required: true,
                message: "Please provide a reason for rejection",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please explain why you are rejecting this proposal..."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" danger htmlType="submit" loading={submitting}>
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ContractRejectButton;