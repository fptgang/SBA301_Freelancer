import React, { useState } from "react";
import { HttpError } from "@refinedev/core";
import {
  Button,
  Modal,
  Form,
  Upload,
  Steps,
  Card,
  Alert,
  Row,
  Col,
  Divider,
  Typography,
  message,
  Checkbox,
  Statistic,
} from "antd";
import { InboxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useModal } from "@refinedev/antd";
import type { UploadFile } from "antd/es/upload/interface";
import { store } from "../../../store";
import api from "../../../services/api/openapi-config";
import DepositModal from "../../../components/DepositModal";

const { Step } = Steps;
const { Dragger } = Upload;
const { Text } = Typography;

interface ContractCreateButtonProps {
  projectTitle: string;
  freelancerName: string;
  milestoneAmount: number;
  proposalId: number;
  onSubmit?: () => void;
}

export const ContractCreateButton: React.FC<ContractCreateButtonProps> = ({
  projectTitle,
  freelancerName,
  milestoneAmount,
  proposalId,
  onSubmit,
}) => {
  const user = store.getState().auth.account;
  // Modal state
  const { modalProps, show, close } = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  // Handle file upload
  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList([...fileList]);
  };

  // Handle step form submission
  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      // Final step - prepare the contract data
      // Add files if any
      await api
        .createContract({
          proposalId: proposalId,
        })
        .then(async (data) => {
          fileList.forEach((file) => {
            api
              .uploadFile({
                blob: file.originFileObj,
                contractId: data.contractId,
              })
              .catch((error: HttpError) => {
                message.error(error.message);
              });
          });
        })
        .catch((error: HttpError) => {
          message.error(error.message);
        });
      onSubmit && onSubmit();
      close();
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Step forms
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={{ terms: false }}
          >
            <Alert
              message="Contract Creation"
              description={
                <Text>
                  Once you accept, we will create a contract between you and{" "}
                  {freelancerName}. Please ensure that your balance has enough
                  funds to deposit for the first milestone payment.
                </Text>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card
              title="Contract Details"
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Project:</Text> <Text>{projectTitle}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Freelancer:</Text> <Text>{freelancerName}</Text>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: "12px 0" }} />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <Statistic
                        title="First Milestone Amount (Required Deposit)"
                        value={milestoneAmount}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: "#3f8600" }}
                      />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        This amount will be held in escrow until the milestone
                        is completed
                      </Text>
                    </div>
                    <div>
                      <Statistic
                        title="Your Available Balance"
                        value={user?.balance || 0}
                        precision={2}
                        prefix="$"
                        valueStyle={{
                          color:
                            (user?.balance || 0) < milestoneAmount
                              ? "#ff4d4f"
                              : "#3f8600",
                        }}
                      />
                      {(user?.balance || 0) < milestoneAmount && (
                        <>
                          <Text
                            type="danger"
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Insufficient balance for milestone payment
                          </Text>
                          <Button
                            type="primary"
                            danger
                            onClick={() => setShowTopUpModal(true)}
                          >
                            Top Up Balance
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Alert
              message="Important Notice"
              description="By creating this contract, you agree to deposit the first milestone amount into escrow. This amount will only be released to the freelancer upon your approval of the completed work."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("You must accept the terms to proceed")
                        ),
                },
              ]}
            >
              <Checkbox>
                I understand and agree to the terms of this contract
              </Checkbox>
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form layout="vertical" onFinish={handleStepSubmit}>
            <Form.Item
              name="files"
              label="Upload Contract Supporting Documents"
              help="Upload any additional documents relevant to this contract"
              getValueFromEvent={() => fileList}
            >
              <Dragger
                beforeUpload={() => false}
                onChange={handleFileChange}
                fileList={fileList}
                listType="picture"
                maxCount={5}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag a file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Supported file types: PDF, DOC, DOCX, JPG, PNG (Max: 10MB
                  each)
                </p>
              </Dragger>
            </Form.Item>

            <Alert
              message="Ready to Create Contract"
              description="Please review all details carefully before creating the contract. Once created, the first milestone amount will be reserved from your account."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button type="primary" htmlType="submit">
                Create Contract
              </Button>
            </div>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<CheckCircleOutlined />}
        onClick={() => {
          show();
          setCurrentStep(0);
          setFileList([]);
        }}
      >
        Accept Proposal
      </Button>

      <Modal
        {...modalProps}
        title="Create New Contract"
        width={700}
        footer={null}
        maskClosable={false}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Contract Details" description="Review terms" />
          <Step title="Documents" description="Upload files" />
        </Steps>
        {renderStepContent()}
      </Modal>

      <DepositModal
        visible={showTopUpModal}
        onClose={() => {
          setShowTopUpModal(false);
        }}
      />
    </>
  );
};

export default ContractCreateButton;
