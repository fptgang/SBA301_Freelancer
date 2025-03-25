import React, {useState} from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Space,
  Steps,
  Table,
  Typography
} from "antd";
import {ContractDto} from "../../../generated/models/ContractDto";
import {ProjectDto} from "../../../generated/models/ProjectDto";
import {CheckCircleOutlined} from "@ant-design/icons";
import api from "../../services/api/openapi-config";
import {useInvalidate} from "@refinedev/core"
import FileList from "../common/file-list";
import {useLocalSettings} from "../../hooks/useLocalSettings";

const {Title, Text, Paragraph} = Typography;
const {Step} = Steps;

interface ContractSignButtonProps {
  contract: ContractDto;
  project: ProjectDto;
  onSuccess?: () => void;
}

const ContractSignButton: React.FC<ContractSignButtonProps> = ({
                                                                 contract,
                                                                 project,
                                                                 onSuccess
                                                               }) => {
  const [localSettings] = useLocalSettings()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const invalidate = useInvalidate();
  const [currentStep, setCurrentStep] = useState(0);

  const canSignContract = project.status === "IN_PROGRESS" && contract.status === "UNSIGNED";

  const handleSignContract = async () => {
    try {
      await form.validateFields();

      setIsLoading(true);

      console.log("Signing contract ID:", contract.contractId);

      const response = await api.signContract({
        contractId: contract.contractId || -1,
      });

      console.log("Contract signed successfully:", response);

      setIsLoading(false);
      setIsModalVisible(false);

      message.success("Contract signed successfully!");

      invalidate({
        resource: "contracts",
        invalidates: ["list", "many"],
        id: contract.contractId,
      });

      invalidate({
        resource: "projects",
        invalidates: ["detail", "list"],
        id: project.projectId,
      });

      invalidate({
        resource: "milestones",
        invalidates: ["list", "many"],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing contract:", error);

      if (error instanceof Error) {
        message.error(`Failed to sign contract: ${error.message}`);
      } else {
        message.error("Failed to sign contract. Please try again.");
      }
    }
  };

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      // Only sign contract in the final step
      await handleSignContract();
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
          m.contractualBudget = m.budgetRatio! * (contract.budget || 0);
          return m
        }) || [];

        return (
          <Form layout="vertical" onFinish={handleStepSubmit}>
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
                  <Text strong>Client:</Text>
                  <Text>{`${project.client?.firstName} ${project.client?.lastName || ''}`}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Freelancer:</Text>
                  <Text>{`${contract.freelancer?.firstName} ${contract.freelancer?.lastName || ''}`}</Text>
                </Col>
              </Row>
              <Divider/>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Start Date:</Text>
                  <Text>{localSettings.formatDateTime(project.startDate!)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Total Budget:</Text>
                  <Text>${contract.budget}</Text>
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
              {contract.contractFile && (
                <>
                  <Divider/>
                  <Title level={5} className="text-gray-700">
                    Attachments
                  </Title>
                  <FileList files={[contract.contractFile]}/>
                </>
              )}
            </Card>
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
            <Space direction="vertical" className="mt-4 w-full">
              <Alert
                message="What happens next:"
                description={
                  <ul className="list-disc pl-5 mt-2">
                    <li>The first milestone will be activated</li>
                    <li>You'll need to submit your work by the milestone
                      deadline
                    </li>
                    <li>The client will review and approve the work</li>
                    <li>Payment will be released upon milestone completion</li>
                    <li>At any time, you can raise a dispute to the staff by
                      clicking on "Report" button
                    </li>
                  </ul>
                }
                type="success"
                showIcon
              />
            </Space>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "24px"
            }}>
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Sign Contract
              </Button>
            </div>
          </Form>
        );

      default:
        return null;
    }
  };

  // If freelancer can't sign the contract, don't render the button
  if (!canSignContract) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        icon={<CheckCircleOutlined/>}
        onClick={() => {
          setIsModalVisible(true);
          setCurrentStep(0);
        }}
      >
        Sign Contract
      </Button>

      <Modal
        title="Sign Contract Agreement"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Preview Terms"/>
          <Step title="Guidelines for Freelancer"/>
        </Steps>
        {renderStepContent()}
      </Modal>
    </>
  );
};

export default ContractSignButton; 