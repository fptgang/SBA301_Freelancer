import React, { useState } from "react";
import { Modal, Upload, Button, Form, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { MilestoneDto } from "../../../../../generated";
import type { UploadFile } from "antd/es/upload/interface";
import api from "../../../../services/api/openapi-config";

interface MilestoneSubmissionModalProps {
  milestone: MilestoneDto;
  visible: boolean;
  onCancel: () => void;
  refetch: () => void;
}

export const MilestoneSubmissionModal: React.FC<
  MilestoneSubmissionModalProps
> = ({ milestone, visible, onCancel, refetch }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (milestone.milestoneId === undefined) {
        throw new Error("Milestone ID is required");
      }
      try {
        await api.submitMilestoneWork({
          milestoneId: milestone.milestoneId,
          blobs: fileList.map((f) => f.originFileObj),
        });

        message.success("Deliverables submitted successfully");
        refetch();
      } catch (error) {
        message.error("Failed to submit deliverables");
        throw error;
      }
      message.success("Deliverables submitted successfully");
      form.resetFields();
      setFileList([]);
      onCancel();
    } catch (error) {
      message.error("Failed to submit deliverables");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={`Submit Deliverables - ${milestone.title}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="files"
          label="Deliverable Files"
          rules={[
            { required: true, message: "Please upload at least one file" },
          ]}
        >
          <Upload
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="comment"
          label="Comment"
          rules={[{ required: true, message: "Please add a comment" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Add details about your submission"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
