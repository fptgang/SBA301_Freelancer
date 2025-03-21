import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Steps,
  Form,
  Input,
  Card,
  Typography,
  Alert,
  Space,
  Divider,
  Upload,
  message,
  InputNumber,
} from "antd";
import {
  useCreate,
  useApiUrl,
  useNotification,
  useCustom,
  useList,
  useGetIdentity,
} from "@refinedev/core";
import { useForm } from "@refinedev/antd";
import {
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  PaperClipOutlined,
  DollarTwoTone,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { AccountDto, ProjectDto, ProposalDto } from "../../../../generated";
import { store } from "../../../store";
import api from "../../../services/api/openapi-config";

const { Step } = Steps;
const { Title, Text } = Typography;

interface FreelancerCreateProposalButtonProps {
  project?: ProjectDto;
  freelancerId?: number;
  refetch?: () => void;
}

const FreelancerCreateProposalButton: React.FC<
  FreelancerCreateProposalButtonProps
> = ({ project, freelancerId, refetch }) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(
    null
  );
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const { data: identity } = useGetIdentity<AccountDto>();
  const freelancerIdUsed = freelancerId ?? identity?.accountId;
  const token = store?.getState().auth.accessToken;

  // Fetch projects for selection if not provided
  const { data: projectsData, isLoading: projectsLoading } =
    useList<ProjectDto>({
      resource: "projects",
      filters: [
        {
          field: "status",
          operator: "eq",
          value: "OPEN",
        },
      ],
      pagination: {
        pageSize: 100,
      },
      queryOptions: {
        enabled: visible && !project,
      },
    });

  // Update selectedProject when the project prop changes or modal becomes visible
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    } else if (
      visible &&
      projectsData?.data &&
      projectsData.data.length > 0 &&
      !selectedProject
    ) {
      setSelectedProject(projectsData.data[0]);
    }
  }, [project, visible, projectsData]);

  // Form for proposal creation
  const { formProps, saveButtonProps, onFinish } = useForm<ProposalDto>({
    action: "create",
    resource: "proposals",
    redirect: false,

    onMutationError(error, variables, context, isAutoSave) {
      setSubmitting(false);
      open?.({
        type: "error",
        message: "Proposal Creation Failed",
        description: error.message,
      });
    },
    onMutationSuccess: (data) => {
      // Upload files after proposal is created
      if (fileList.length > 0 && data.data.proposalId) {
        handleFileUpload(data.data.proposalId);
      } else {
        handleSubmitSuccess();
      }
    },
  });

  // Handle file upload changes
  const handleFileChange = (info: any) => {
    const newFileList = [...info.fileList];

    // Limit to 5 files
    const limitedList = newFileList.slice(-5);
    setFileList(limitedList);

    // Handle status changes
    const { status } = info.file;
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // Handle file upload after proposal creation
  const handleFileUpload = async (proposalId: number) => {
    if (fileList.length === 0) {
      handleSubmitSuccess();
      return;
    }

    try {
      // Add files
      fileList.forEach(async (file) => {
        if (file.originFileObj) {
          const response = await api.uploadFile({
            proposalId,
            blob: file.originFileObj,
          });
          if (!response) {
            throw new Error("Failed to upload files");
          }
        }
      });

      // Upload files to the proposal

      handleSubmitSuccess();
    } catch (error) {
      setSubmitting(false);
      open?.({
        type: "error",
        message: "File Upload Failed",
        description:
          "Your proposal was created, but there was an error uploading files.",
      });
    }
  };

  // Handle successful submission
  const handleSubmitSuccess = () => {
    setVisible(false);
    setFileList([]);
    setCurrentStep(0);
    setSubmitting(false);
    refetch && refetch();
    formProps.form?.resetFields();
  };

  // Steps configuration
  const steps = [
    {
      title: "Proposal Details",
      content: (
        <>
          <Card className="w-full">
            <Title level={4} className="mb-4 flex items-center">
              <FileTextOutlined className="mr-2" /> Define Your Budget
            </Title>
            <Form.Item name="budget" label="Your Budget">
              <InputNumber prefix={<DollarTwoTone />} className="w-full" />
            </Form.Item>
          </Card>
          <br />
          <Card className="w-full">
            <Title level={4} className="mb-4 flex items-center">
              <FileTextOutlined className="mr-2" /> Proposal Details
            </Title>

            {/* Project ID hidden field */}
            <Form.Item name="projectId" hidden>
              <Input />
            </Form.Item>

            {/* Freelancer ID hidden field */}
            <Form.Item name="freelancerId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Proposal Message"
              rules={[
                {
                  required: true,
                  message: "Please provide details about your proposal",
                },
                {
                  min: 50,
                  message: "Your proposal should be at least 50 characters",
                },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Describe why you're a good fit for this project, your approach, timeline, and any questions you have."
                showCount
                maxLength={2000}
                className="w-full"
              />
            </Form.Item>

            <Divider orientation="left">
              <Space>
                <PaperClipOutlined />
                Attachments
              </Space>
            </Divider>

            <Form.Item name="files" label="Supporting Documents (Optional)">
              <Upload
                multiple
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false} // Prevent auto upload
                maxCount={5}
              >
                <Button icon={<UploadOutlined />}>Select Files (Max 5)</Button>
              </Upload>
            </Form.Item>
            <div className="text-xs text-gray-500 mt-2">
              Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max 5MB per file)
            </div>

            <Alert
              message="Tips for a Great Proposal"
              description={
                <ul className="list-disc pl-4 mt-2">
                  <li>Address client requirements specifically</li>
                  <li>Highlight relevant experience and skills</li>
                  <li>Be clear about your timeline and availability</li>
                  <li>Provide examples of similar work if possible</li>
                </ul>
              }
              type="info"
              showIcon
              className="mt-4"
            />
          </Card>
        </>
      ),
    },
    {
      title: "Review & Submit",
      content: (
        <Card className="w-full">
          <Title level={4} className="mb-4 flex items-center">
            <CheckCircleOutlined className="mr-2" /> Review Your Proposal
          </Title>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-gray-50">
              <Title level={5}>Project</Title>
              <Text>{selectedProject?.title}</Text>
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <Title level={5}>Your Proposal</Title>
              <div className="whitespace-pre-wrap">
                <Form.Item noStyle shouldUpdate>
                  {(form) => <Text>{form.getFieldValue("notes")}</Text>}
                </Form.Item>
              </div>
            </div>

            {fileList.length > 0 && (
              <div className="p-4 rounded-md bg-gray-50">
                <Title level={5}>Attachments</Title>
                <ul className="list-disc pl-4">
                  {fileList.map((file, index) => (
                    <li key={index} className="text-blue-600">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Alert
              message="Ready to Submit?"
              description="Once submitted, your proposal will be reviewed by the client. You will be notified if the client responds to your proposal."
              type="warning"
              showIcon
            />
          </div>
        </Card>
      ),
    },
  ];

  // Initialize form fields when modal is opened or selectedProject changes
  useEffect(() => {
    if (visible && formProps.form && selectedProject && freelancerIdUsed) {
      formProps.form.setFieldsValue({
        projectId: selectedProject.projectId,
        freelancerId: freelancerIdUsed,
        status: "PENDING",
        isVisible: true,
      });
    }
  }, [visible, selectedProject, freelancerIdUsed, formProps.form]);

  // Handle next button click
  const handleNext = async () => {
    try {
      if (currentStep === steps.length - 1) {
        // On final step, validate and submit
        await formProps.form?.validateFields();
        setSubmitting(true);

        const values = await formProps.form?.getFieldsValue();

        // Ensure required fields are set
        const completeValues = {
          ...values,
          projectId: selectedProject?.projectId,
          freelancerId: freelancerIdUsed,
          status: "PENDING",
          isVisible: true,
        };

        console.log("Submitting proposal with values:", completeValues);

        // Submit the form
        onFinish(completeValues);
      } else {
        // Validate current step before moving to next
        if (currentStep === 0) {
          await formProps.form?.validateFields(["notes"]);
        }
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle cancel button click
  const handleCancel = () => {
    Modal.confirm({
      title: "Cancel Proposal Creation",
      content:
        "Are you sure you want to cancel? Your changes will not be saved.",
      okText: "Yes, cancel",
      cancelText: "No, continue",
      onOk: () => {
        setVisible(false);
        setCurrentStep(0);
        setFileList([]);
        formProps.form?.resetFields();
      },
    });
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
        icon={<SendOutlined />}
        className="bg-blue-500 hover:bg-blue-600"
        block
        size="large"
      >
        Create Proposal
      </Button>

      <Modal
        title={
          <div className="flex items-center">
            <SendOutlined className="mr-2 text-blue-500" />
            <span>Create Proposal</span>
          </div>
        }
        open={visible}
        maskClosable={false}
        closable={false}
        width={700}
        footer={
          <div className="flex justify-between">
            <Button onClick={handleCancel}>Cancel</Button>
            <div>
              {currentStep > 0 && (
                <Button style={{ marginRight: 8 }} onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleNext}
                loading={submitting}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {currentStep === steps.length - 1 ? "Submit Proposal" : "Next"}
              </Button>
            </div>
          </div>
        }
      >
        <Form {...formProps} layout="vertical" className="mt-4">
          <Steps current={currentStep} className="mb-8">
            {steps.map((step) => (
              <Step key={step.title} title={step.title} />
            ))}
          </Steps>

          {steps.map((step, index) => (
            <div
              key={index}
              className={currentStep === index ? "block" : "hidden"}
            >
              {step.content}
            </div>
          ))}
        </Form>
      </Modal>
    </>
  );
};

export default FreelancerCreateProposalButton;
