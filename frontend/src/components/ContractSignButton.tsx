import React, { useState } from "react";
import { Button, Modal, Checkbox, Alert, message, Form, Space } from "antd";
import { ContractDto } from "../../generated/models/ContractDto";
import { ProjectDto } from "../../generated/models/ProjectDto";
import { CheckCircleOutlined } from "@ant-design/icons";
import api from "../services/api/openapi-config";
import { useInvalidate } from "@refinedev/core";

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const invalidate = useInvalidate();

  // Only show the button if the project is IN_PROGRESS and contract is not already signed
  const canSignContract = project.status === "IN_PROGRESS" && contract.status === "UNSIGNED";

  // Handle signing the contract
  const handleSignContract = async () => {
    try {
      // Validate the form first to ensure user has agreed to terms
      await form.validateFields();
      
      setIsLoading(true);
      
      console.log("Signing contract ID:", contract.contractId);
      
      // Call the API to sign the contract
      const response = await api.signContract({
        contractId: contract.contractId || -1,
      });
      
      console.log("Contract signed successfully:", response);
      
      setIsLoading(false);
      setIsModalVisible(false);
      
      // Show success message
      message.success("Contract signed successfully!");
      
      // Invalidate relevant cache to reflect the changes
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
      
      // Call onSuccess handler if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing contract:", error);
      
      // Show more detailed error message if available
      if (error instanceof Error) {
        message.error(`Failed to sign contract: ${error.message}`);
      } else {
        message.error("Failed to sign contract. Please try again.");
      }
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
        icon={<CheckCircleOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        Sign Contract
      </Button>

      <Modal
        title="Sign Contract Agreement"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSignContract}
        okText="Sign Contract"
        confirmLoading={isLoading}
        width={600}
      >
        <Alert
          message="Ready to Begin Work"
          description="By signing this contract, you agree to the terms and deadlines outlined in the project. After signing, the first milestone will be activated and you can begin work immediately."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form}>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("You must accept the terms to proceed")),
              },
            ]}
          >
            <Checkbox>
              I understand and agree to the contract terms, project requirements, and milestone deadlines. I will complete the work as specified.
            </Checkbox>
          </Form.Item>
        </Form>

        <Space direction="vertical" className="mt-4 w-full">
          <Alert
            message="What happens next:"
            description={
              <ul className="list-disc pl-5 mt-2">
                <li>The first milestone will be activated and start immediately</li>
                <li>You'll need to submit your work by the milestone deadline</li>
                <li>The client will review and approve each milestone</li>
                <li>Payment will be released upon milestone completion</li>
              </ul>
            }
            type="success"
            showIcon
          />
        </Space>
      </Modal>
    </>
  );
};

export default ContractSignButton; 