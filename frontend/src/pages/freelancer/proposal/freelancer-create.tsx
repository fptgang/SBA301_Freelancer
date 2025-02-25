import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Steps,
  Form,
  Input,
  Card,
  Typography,
  Select,
  Alert,
  Space,
  Divider,
  Upload,
  message,
} from "antd";
import {
  useCreate,
  useApiUrl,
  useNotification,
  useCustom,
  useList,
} from "@refinedev/core";
import { useForm } from "@refinedev/antd";
import {
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  UploadOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { ProjectDto, ProposalDto } from "../../../../generated";

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface FreelancerCreateProposalButtonProps {
  project?: ProjectDto;
}

const FreelancerCreateProposalButton: React.FC<
  FreelancerCreateProposalButtonProps
> = ({ project }) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(
    null
  );

  const [fileList, setFileList] = useState<any[]>([]);

  const apiUrl = useApiUrl();
  const { open } = useNotification();

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

  // Fetch project details if project ID is provided
  const { data: projectDetails, isLoading: projectDetailsLoading } = useCustom<{
    data: ProjectDto;
  }>({
    url: `${apiUrl}/projects/${project?.projectId}`,
    method: "get",
    queryOptions: {
      enabled: !!project?.projectId && visible,
    },
  });

  // Set selected project based on props or when fetched
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    } else if (projectDetails?.data) {
      setSelectedProject(projectDetails.data);
    }
  }, [project, projectDetails]);

  // Form for proposal creation
  const { formProps, saveButtonProps, onFinish } = useForm<ProposalDto>({
    action: "create",
    resource: "proposals",
    redirect: false,
    onMutationSuccess: () => {
      setVisible(false);
      setFileList([]);
      setCurrentStep(0);
      open?.({
        type: "success",
        message: "Proposal Submitted",
        description: "Your proposal has been successfully submitted.",
      });
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

  // Handle form submission with files
  const handleSubmit = async (values: any) => {
    // Prepare form data for file upload
    const formData = new FormData();

    // Add proposal data
    formData.append("projectId", values.projectId);
    formData.append("notes", values.notes);
    formData.append("status", "PENDING");
    formData.append("isVisible", "true");

    // Add files if any
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("files", file.originFileObj);
      }
    });

    try {
      // Use custom fetch to handle multipart data
      const response = await fetch(`${apiUrl}/proposals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refine-auth")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit proposal");
      }

      // Handle success
      setVisible(false);
      setFileList([]);
      setCurrentStep(0);
      formProps.form?.resetFields();

      open?.({
        type: "success",
        message: "Proposal Submitted",
        description: "Your proposal has been successfully submitted.",
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Submission Failed",
        description:
          "There was an error submitting your proposal. Please try again.",
      });
    }
  };

  // Steps configuration
  const steps = [
    {
      title: "Proposal Details",
      content: (
        <Card className="w-full">
          <Title level={4} className="mb-4 flex items-center">
            <FileTextOutlined className="mr-2" /> Proposal Details
          </Title>
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
            <div className="bg-gray-50 p-4 rounded-md">
              <Title level={5}>Project</Title>
              <Text>{selectedProject?.title}</Text>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <Title level={5}>Your Proposal</Title>
              <div className="whitespace-pre-wrap">
                <Form.Item noStyle shouldUpdate>
                  {(form) => <Text>{form.getFieldValue("notes")}</Text>}
                </Form.Item>
              </div>
            </div>

            {fileList.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
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

            <Form.Item name="status" hidden initialValue="PENDING" />
            <Form.Item name="isVisible" hidden initialValue={true} />
          </div>
        </Card>
      ),
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep === steps.length - 1) {
        // On final step, validate and submit
        await formProps.form?.validateFields();
        const values = await formProps.form?.getFieldsValue();
        await handleSubmit(values);
      } else {
        // Validate current step before moving to next
        if (currentStep === 0) {
          await formProps.form?.validateFields(["projectId"]);
        } else if (currentStep === 1) {
          await formProps.form?.validateFields(["notes"]);
        }
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

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

          <div>{steps[currentStep].content}</div>
        </Form>
      </Modal>
    </>
  );
};

export default FreelancerCreateProposalButton;
