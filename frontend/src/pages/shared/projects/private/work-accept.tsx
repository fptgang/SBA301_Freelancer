import React, {useState} from "react";
import {useGetIdentity} from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  message,
  Modal,
  Row,
  Statistic,
  Steps,
  Typography,
} from "antd";
import {useModal} from "@refinedev/antd";
import {AccountDto, MilestoneDto, ProjectDto} from "../../../../../generated";
import api from "../../../../services/api/openapi-config";
import ModalTopup from "./modal-topup";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import FileList from "../../../../components/common/file-list";
import {CheckOutlined} from "@ant-design/icons";

const {Step} = Steps;
const {Text, Title} = Typography;

interface WorkAcceptProps {
  project: ProjectDto;
  milestone: MilestoneDto;
  onSubmit?: () => void;
}

export const WorkAcceptButton: React.FC<WorkAcceptProps> = ({
                                                              project,
                                                              milestone,
                                                              onSubmit,
                                                            }) => {
  const [localSettings] = useLocalSettings();
  const {data: user} = useGetIdentity<AccountDto>();
  const {modalProps, show, close} = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Find next milestone
  const visibleMilestones = project.milestones?.filter(m => m.isVisible) || [];
  const currentIndex = visibleMilestones.findIndex(m => m.milestoneId === milestone.milestoneId);
  const nextMilestone = currentIndex < visibleMilestones.length - 1 ? visibleMilestones[currentIndex + 1] : null;
  const nextMilestoneAmount = nextMilestone ? nextMilestone.budgetRatio! * (project.contract?.budget || 0) : 0;

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      try {
        await api.confirmMilestoneWork({
          milestoneId: milestone.milestoneId!,
        });
        onSubmit && onSubmit();
        close();
      } catch (error: any) {
        message.error(error.message);
      }
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
        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={{terms: false}}
          >
            <Card bordered={false} style={{marginBottom: 24}}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>{milestone.title}</Title>
                  <Text>Budget:
                    ${milestone.contractualBudget?.toFixed(2)}</Text>
                </Col>

                <Col span={24}>
                  <Title level={5}>Deliverables</Title>
                  {milestone.deliverables && milestone.deliverables.filter(d => d.isVisible).length > 0 ? (
                    <FileList
                      files={milestone.deliverables.filter(d => d.isVisible)}/>
                  ) : (
                    <Text type="secondary" italic>No deliverables
                      attached</Text>
                  )}
                </Col>
              </Row>
            </Card>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                        new Error("You must review and accept the work to proceed")
                      ),
                },
              ]}
            >
              <Checkbox>
                I have thoroughly reviewed the deliverables and accept the
                freelancer's work on the current milestone. I acknowledge that
                this action is undoable.
              </Checkbox>
            </Form.Item>

            <div style={{display: "flex", justifyContent: "flex-end"}}>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form layout="vertical" onFinish={handleStepSubmit}>
            <Card bordered={false} style={{marginBottom: 24}}>
              {nextMilestone ? (
                <>
                  {nextMilestone.fundStatus === 'DEPOSITED' ? (
                    <Alert
                      message="Next Milestone Already Funded"
                      description="The next milestone has already been funded. You can proceed with accepting the current milestone's work."
                      type="success"
                      showIcon
                      style={{marginBottom: 24}}
                    />
                  ) : (
                    <>
                      <Alert
                        message="Next Milestone Deposit Required"
                        description="To proceed with accepting the current milestone's work, you need to deposit the budget for the next milestone."
                        type="info"
                        showIcon
                        style={{marginBottom: 24}}
                      />

                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between"
                          }}>
                            <div>
                              <Statistic
                                title="Next Milestone Amount (Required Deposit)"
                                value={nextMilestoneAmount}
                                precision={2}
                                prefix="$"
                                valueStyle={{color: "#3f8600"}}
                              />
                              <Text type="secondary" style={{fontSize: "12px"}}>
                                This amount will be held in escrow until the
                                next milestone is completed
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
                                    (user?.balance || 0) < nextMilestoneAmount
                                      ? "#ff4d4f"
                                      : "#3f8600",
                                }}
                              />
                              {(user?.balance || 0) < nextMilestoneAmount && (
                                <>
                                  <Text type="danger" style={{
                                    display: "block",
                                    marginBottom: "8px"
                                  }}>
                                    Insufficient balance for next milestone
                                    payment
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
                    </>
                  )}
                </>
              ) : (
                <Alert
                  message="Final Milestone"
                  description="This is the final milestone of the project. Upon acceptance, the project will be marked as completed."
                  type="success"
                  showIcon
                  style={{marginBottom: 24}}
                />
              )}
            </Card>

            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={nextMilestone && nextMilestone.fundStatus !== 'DEPOSITED' ? (user?.balance || 0) < nextMilestoneAmount : false}
              >
                Accept Work
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
      <Button type="primary"
              icon={<CheckOutlined/>} onClick={() => show()}>
        Accept Work
      </Button>

      <Modal
        {...modalProps}
        title="Accept Milestone Work"
        width={700}
        footer={null}
        maskClosable={false}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Review" description="Review deliverables"/>
          <Step title="Confirm" description="Confirm acceptance"/>
        </Steps>
        {renderStepContent()}
      </Modal>

      {nextMilestone && (
        <ModalTopup
          visible={showTopUpModal}
          suggestedAmount={nextMilestoneAmount - (user?.balance || 0)}
          onClose={() => {
            setShowTopUpModal(false);
          }}
        />
      )}
    </>
  );
};

export default WorkAcceptButton;
