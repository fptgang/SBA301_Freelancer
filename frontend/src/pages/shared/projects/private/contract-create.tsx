import React, {useState} from "react";
import {HttpError, useGetIdentity} from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Statistic,
  Steps,
  Table,
  Typography,
  Upload,
} from "antd";
import {CheckCircleOutlined, InboxOutlined} from "@ant-design/icons";
import {useModal} from "@refinedev/antd";
import type {UploadFile} from "antd/es/upload/interface";
import {AccountDto, ProjectDto, ProposalDto} from "../../../../../generated";
import api from "../../../../services/api/openapi-config";
import ModalTopup from "./modal-topup";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";


const {Step} = Steps;
const {Dragger} = Upload;
const {Text} = Typography;

interface ContractCreateButtonProps {
  project: ProjectDto;
  proposal: ProposalDto;
  onSubmit?: () => void;
}

export const ContractCreateButton: React.FC<ContractCreateButtonProps> = ({
                                                                            project,
                                                                            proposal,
                                                                            onSubmit,
                                                                          }) => {
  const [localSettings] = useLocalSettings()
  const milestoneAmount = (project.milestones?.filter(m => m.isVisible)[0]?.budgetRatio || 0) * (proposal.budget || 0);
  const {data: user} = useGetIdentity<AccountDto>();
  const {modalProps, show, close} = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const handleFileChange = ({fileList}: { fileList: UploadFile[] }) => {
    setFileList([...fileList]);
  };

  const handleStepSubmit = async () => {
    if (currentStep === 2) {
      await api
        .createContract({
          proposalId: proposal.proposalId || 0,
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
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        const visibleMilestones = project.milestones?.filter(m => m.isVisible).map(m => {
          m.contractualBudget = m.budgetRatio! * (proposal.budget || 0);
          return m
        }) || [];

        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={{terms: false}}
          >
            <Card
              title="Contract Details"
              bordered={false}
              style={{marginBottom: 24}}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Project:</Text> <Text>{project.title}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Client:</Text>{" "}
                  <Text>{`${project.client?.firstName} ${project.client?.lastName || ''}`}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Freelancer:</Text>{" "}
                  <Text>{`${proposal.freelancer?.firstName} ${proposal.freelancer?.lastName || ''}`}</Text>
                </Col>
              </Row>
              <Divider/>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Start Date:</Text>{" "}
                  <Text>{localSettings.formatDateTime(project.startDate!)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Total Budget:</Text>{" "}
                  <Text>${proposal.budget}</Text>
                </Col>

                <Col span={24}>
                  <Text strong>Milestones:</Text>
                  <Table
                    dataSource={visibleMilestones}
                    style={{width: '100%', marginTop: '16px'}}
                    pagination={false}
                    rowKey="milestoneId"
                  >
                    <Table.Column title="Title" dataIndex="title" key="title"/>
                    <Table.Column title="Budget Ratio" dataIndex="budgetRatio"
                                  key="budgetRatio"
                                  render={(text) => `${(text * 100).toFixed(0)}%`}/>
                    <Table.Column title="Absolute Budget"
                                  dataIndex="contractualBudget"
                                  key="contractualBudget"
                                  render={(text) => `$${text.toFixed(2)}`}/>
                    <Table.Column title="Deadline" dataIndex="deadline"
                                  key="deadline"
                                  render={(text) => localSettings.formatDateTime(text)}/>
                  </Table>
                </Col>
              </Row>
            </Card>

            <Alert
              message="Important Notice"
              description="By creating this contract, you agree to deposit the first milestone amount into escrow. This amount will only be released to the freelancer upon your approval of the completed work."
              type="warning"
              showIcon
              style={{marginBottom: 24}}
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

            <div style={{display: "flex", justifyContent: "flex-end"}}>
              <Button
                type="primary"
                htmlType="submit"
              >
                Next
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form layout="vertical" onFinish={handleStepSubmit}>

            <Card
              title="Contract Details"
              bordered={false}
              style={{marginBottom: 24}}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div
                    style={{display: "flex", justifyContent: "space-between"}}
                  >
                    <div>
                      <Statistic
                        title="First Milestone Amount (Required Deposit)"
                        value={milestoneAmount}
                        precision={2}
                        prefix="$"
                        valueStyle={{color: "#3f8600"}}
                      />
                      <Text type="secondary" style={{fontSize: "12px"}}>
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
                            style={{display: "block", marginBottom: "8px"}}
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


            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={(user?.balance || 0) < milestoneAmount}
              >
                Next
              </Button>
            </div>
          </Form>
        );

      case 2:
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
                  <InboxOutlined/>
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
              style={{marginBottom: 24}}
            />

            <div style={{display: "flex", justifyContent: "space-between"}}>
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
        icon={<CheckCircleOutlined/>}
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
          <Step title="Reviews" description="Review terms"/>
          <Step title="Deposit" description="Review deposit"/>
          <Step title="Documents" description="Upload files"/>
        </Steps>
        {renderStepContent()}
      </Modal>

      <ModalTopup
        visible={showTopUpModal}
        suggestedAmount={milestoneAmount - (user?.balance || 0)}
        onClose={() => {
          setShowTopUpModal(false);
        }}
      />
    </>
  );
};

export default ContractCreateButton;
