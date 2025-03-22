import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  message,
  Spin,
  Typography,
  Space,
  Alert,
} from "antd";
import { UploadOutlined, SendOutlined } from "@ant-design/icons";
import { useApiUrl, useCreate, useCustomMutation } from "@refinedev/core";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { RcFile } from "antd/es/upload";
import { ProposalCreateDto } from "../../../../generated";

const { TextArea } = Input;
const { Text } = Typography;

interface CreateProposalButtonProps {
  projectId: number;
  minBudget?: number;
  maxBudget?: number;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export const CreateProposalButton: React.FC<CreateProposalButtonProps> = ({
  projectId,
  minBudget,
  maxBudget,
  onSuccess,
  disabled = false,
  className,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const apiUrl = useApiUrl();

  // Create proposal mutation using Refine's hooks
  const { mutate: createProposal, isLoading: isCreatingProposal } = useCreate();
  
  // Custom mutation for file upload
  const { mutate: uploadFile, isLoading: isUploadingFile } = useCustomMutation();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleUploadChange: UploadProps["onChange"] = ({ fileList }) => {
    setFileList(fileList);
  };

  const beforeUpload = (file: RcFile) => {
    const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
    
    if (!isValidSize) {
      message.error('File size must be smaller than 10MB!');
    }
    
    // Return false to stop automatic upload
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      
      // Create proposal data according to the API schema
      const proposalData: ProposalCreateDto = {
       
      };
      
      // Call the API using Refine hooks
      createProposal(
        {
          resource: "proposals",
          values: {
        projectId,
        notes: values.notes,
        budget: values.budget,
          },
        },
        {
          onSuccess: (data) => {
            const proposalId = data.data.proposalId;
            
            // If there are files to upload
            if (fileList.length > 0) {
              uploadFiles(proposalId);
            } else {
              setUploading(false);
              message.success("Proposal submitted successfully");
              handleCancel();
              onSuccess?.();
            }
          },
          onError: (error) => {
            setUploading(false);
            message.error("Failed to create proposal: " + (error?.message || "Unknown error"));
          },
        }
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const uploadFiles = async (proposalId: number) => {
    const uploadPromises = fileList.map((file) => {
      const formData = new FormData();
      if (file.originFileObj) {
        formData.append("blob", file.originFileObj);
        formData.append("proposalId", proposalId.toString());
        
        return uploadFile(
          {
            url: `${apiUrl}/files`,
            method: "post",
            values: formData,
          }
        );
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(uploadPromises);
      message.success("Proposal and files submitted successfully");
      setUploading(false);
      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error("Error uploading files:", error);
      message.error("Failed to upload files, but proposal was created");
      setUploading(false);
      handleCancel();
      onSuccess?.();
    }
  };

  const formatCurrency = (value: number) => {
    return value?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <Button 
        type="primary" 
        onClick={showModal} 
        icon={<SendOutlined />}
        disabled={disabled}
        block
        size="large"
        className={className}
        aria-label="Submit Proposal"
        tabIndex={0}
      >
        Submit Proposal
      </Button>

      <Modal
        title="Create Proposal"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Spin spinning={isCreatingProposal || isUploadingFile || uploading}>
          <Form 
            form={form} 
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ projectId }}
          >
            <Form.Item name="projectId" hidden>
              <Input />
            </Form.Item>

            {minBudget && maxBudget && (
              <Alert
                message={`Client's budget range: $${formatCurrency(minBudget)} - $${formatCurrency(maxBudget)}`}
                type="info"
                showIcon
                className="mb-4"
              />
            )}

            <Form.Item
              name="budget"
              label="Your Bid"
              rules={[
                { required: true, message: "Please enter your proposed budget" },
                { type: "number", min: 1, message: "Budget must be greater than 0" },
                {
                  validator: (_, value) => {
                    if (minBudget && value < minBudget) {
                      return Promise.reject(`Bid should be at least $${formatCurrency(minBudget)}`);
                    }
                    if (maxBudget && value > maxBudget) {
                      return Promise.reject(`Bid should not exceed $${formatCurrency(maxBudget)}`);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              tooltip="Your bid should be within the project's budget range"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                prefix="$" 
                placeholder="Enter amount" 
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number((value || "0").replace(/\$\s?|(,*)/g, ""))}
                min={minBudget || 1}
                max={maxBudget}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Cover Letter"
              rules={[
                { required: true, message: "Please write a cover letter" },
                { min: 50, message: "Cover letter should be at least 50 characters" }
              ]}
            >
              <TextArea 
                rows={6} 
                placeholder="Introduce yourself and explain why you're a good fit for this project"
              />
            </Form.Item>

            <Form.Item label="Attachments">
              <Upload
                listType="text"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                multiple
                maxCount={5}
              >
                <Button icon={<UploadOutlined />}>Select Files</Button>
              </Upload>
              <Text type="secondary" className="block mt-2">
                Attach portfolio samples, CVs, or other relevant documents (up to 5 files, max 10MB each)
              </Text>
            </Form.Item>

            <Form.Item className="mt-4">
              <Space className="w-full justify-end">
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={isCreatingProposal || isUploadingFile || uploading}
                >
                  Submit Proposal
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default CreateProposalButton; 