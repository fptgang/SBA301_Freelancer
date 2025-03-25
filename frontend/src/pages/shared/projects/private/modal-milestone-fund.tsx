import React, {useState} from "react";
import {HttpError, useGetIdentity} from "@refinedev/core";
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
import {
  AccountDto,
  MilestoneDto,
  MilestoneFundStatusDto
} from "../../../../../generated";
import api from "../../../../services/api/openapi-config";
import ModalTopup from "./modal-topup";

const {Step} = Steps;
const {Text} = Typography;

interface MilestoneFundProps {
  milestone: MilestoneDto;
  onSubmit?: () => void;
}

export const MilestoneFundButton: React.FC<MilestoneFundProps> = ({
                                                                    milestone,
                                                                    onSubmit,
                                                                  }) => {
  const {data: user} = useGetIdentity<AccountDto>();
  const {modalProps, show, close} = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      await api
        .depositMilestoneFund({
          milestoneId: milestone.milestoneId || 0,
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
        // Check if milestone is already funded
        if (milestone.fundStatus === MilestoneFundStatusDto.Deposited) {
          return (
            <Alert
              message="Milestone Already Funded"
              description="This milestone has already been funded. No further action is required."
              type="warning"
              showIcon
            />
          );
        }
        if (milestone.fundStatus === MilestoneFundStatusDto.Released) {
          return (
            <Alert
              message="Milestone Already Released"
              description="This milestone has already been released. No further action is required."
              type="warning"
              showIcon
            />
          );
        }
        if (milestone.fundStatus === MilestoneFundStatusDto.Refunded) {
          return (
            <Alert
              message="Milestone Already Refunded"
              description="This milestone has already been refunded. No further action is required."
              type="warning"
              showIcon
            />
          );
        }

        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={{terms: false}}
          >
            <Card
              title="Milestone Funding Details"
              bordered={false}
              style={{marginBottom: 24}}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Milestone:</Text> <Text>{milestone.title}</Text>
                </Col>
                <Col span={24}>
                  <Text strong>Budget Amount:</Text>
                  <Text>${milestone.contractualBudget}</Text>
                </Col>
              </Row>
            </Card>

            <Alert
              message="Early Funding Notice"
              description="If the project is terminated before work on this milestone begins, you will receive a full refund of the funded amount."
              type="info"
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
                I accept funding this milestone ahead of the normal timeline
              </Checkbox>
            </Form.Item>

            <div style={{display: "flex", justifyContent: "flex-end"}}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={milestone.fundStatus !== MilestoneFundStatusDto.None}
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
              title="Payment Details"
              bordered={false}
              style={{marginBottom: 24}}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div
                    style={{display: "flex", justifyContent: "space-between"}}>
                    <div>
                      <Statistic
                        title="Milestone Amount"
                        value={milestone.contractualBudget}
                        precision={2}
                        prefix="$"
                        valueStyle={{color: "#3f8600"}}
                      />
                    </div>
                    <div>
                      <Statistic
                        title="Your Available Balance"
                        value={user?.balance || 0}
                        precision={2}
                        prefix="$"
                        valueStyle={{
                          color:
                            (user?.balance || 0) < (milestone.contractualBudget || 0)
                              ? "#ff4d4f"
                              : "#3f8600",
                        }}
                      />
                      {(user?.balance || 0) < (milestone.contractualBudget || 0) && (
                        <>
                          <Text
                            type="danger"
                            style={{display: "block", marginBottom: "8px"}}
                          >
                            Insufficient balance for milestone funding
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
                disabled={(user?.balance || 0) < (milestone.contractualBudget || 0)}
              >
                Fund Milestone
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
        onClick={() => {
          show();
          setCurrentStep(0);
        }}
      >
        Fund Milestone
      </Button>

      <Modal
        {...modalProps}
        title="Fund Milestone"
        width={700}
        footer={null}
        maskClosable={false}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Review" description="Review terms"/>
          <Step title="Payment" description="Confirm payment"/>
        </Steps>
        {renderStepContent()}
      </Modal>

      <ModalTopup
        visible={showTopUpModal}
        suggestedAmount={
          (milestone.contractualBudget || 0) - (user?.balance || 0)
        }
        onClose={() => {
          setShowTopUpModal(false);
        }}
      />
    </>
  );
};

export default MilestoneFundButton;
