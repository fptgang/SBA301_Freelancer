import React, { useState } from "react";
import { useGetIdentity, useCreate } from "@refinedev/core";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Steps,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useForm, useModal, useSelect } from "@refinedev/antd";

const { Step } = Steps;

const ClientCreateButton = () => {
  // Get current user identity
  const { data: identity } = useGetIdentity<{ id: number }>();
  const userId = identity?.id;

  // Modal state
  const { modalProps, show, close } = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<any>({});

  // Fetch categories for select
  const { selectProps: categorySelectProps } = useSelect({
    resource: "project-categories",
    optionLabel: "name",
    optionValue: "projectCategoryId",
  });

  // Fetch skills for select
  const { selectProps: skillsSelectProps, queryResult: skillsQueryResult } =
    useSelect({
      resource: "skills",
      optionLabel: "name",
      optionValue: "skillId",
    });

  // Create project form
  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "projects",
    redirect: false,
    onMutationSuccess: () => {
      message.success("Project created successfully");
      close();
      setCurrentStep(0);
      setProjectData({});
    },
  });

  // Handle step form submission
  const handleStepSubmit = async (values: any) => {
    const updatedProjectData = { ...projectData, ...values };
    setProjectData(updatedProjectData);

    if (currentStep === 2) {
      // Final step - prepare the project data according to API spec
      const formattedData = {
        title: updatedProjectData.title,
        description: updatedProjectData.description,
        projectCategoryId: updatedProjectData.projectCategoryId,
        client: {
          accountId: userId,
        },
        estimateBudget: updatedProjectData.estimateBudget,
        status: "OPEN",
        isVisible: true,
      };

      // Transform the skills to match ProjectSkillDto format
      if (
        updatedProjectData.requiredSkills &&
        Array.isArray(updatedProjectData.requiredSkills)
      ) {
        formattedData.requiredSkills = updatedProjectData.requiredSkills.map(
          (skillId: number) => ({
            skill: {
              skillId: skillId,
            },
            proficiency: "INTERMEDIATE", // Default proficiency level
          })
        );
      }

      // Format milestones according to MilestoneDto
      if (
        updatedProjectData.milestones &&
        Array.isArray(updatedProjectData.milestones)
      ) {
        formattedData.milestones = updatedProjectData.milestones.map(
          (milestone: any) => ({
            title: milestone.title,
            description: milestone.description,
            budget: milestone.budget,
            deadline: milestone.deadline?.toISOString(),
            status: "PENDING",
            isVisible: true,
          })
        );
      }

      // Submit the formatted data
      await onFinish(formattedData);
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
            initialValues={projectData}
          >
            <Form.Item
              name="title"
              label="Project Title"
              rules={[
                { required: true, message: "Please enter a project title" },
              ]}
            >
              <Input placeholder="Enter project title" />
            </Form.Item>

            <Form.Item
              name="projectCategoryId"
              label="Project Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select placeholder="Select category" {...categorySelectProps} />
            </Form.Item>

            <Form.Item
              name="estimateBudget"
              label="Estimated Budget ($)"
              rules={[{ required: true, message: "Please enter budget" }]}
            >
              <InputNumber
                min={1}
                placeholder="Enter budget"
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                className="w-full"
              />
            </Form.Item>

            <div className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={projectData}
          >
            <Form.Item
              name="description"
              label="Project Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Describe your project in detail..."
              />
            </Form.Item>

            <Form.Item
              name="requiredSkills"
              label="Required Skills"
              rules={[
                { required: true, message: "Please select at least one skill" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select required skills"
                loading={skillsQueryResult?.isLoading}
                options={skillsQueryResult?.data?.data?.map((skill: any) => ({
                  label: skill.name,
                  value: skill.skillId,
                }))}
              />
            </Form.Item>

            <div className="flex justify-between">
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button type="primary" htmlType="submit">
                Next
              </Button>
            </div>
          </Form>
        );

      case 2:
        return (
          <Form
            layout="vertical"
            onFinish={handleStepSubmit}
            initialValues={{
              ...projectData,
              milestones: projectData.milestones || [
                { title: "", budget: 0, deadline: null, description: "" },
              ],
            }}
          >
            <Form.List name="milestones">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} className="mb-4" size="small">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Milestone Title"
                        rules={[{ required: true, message: "Missing title" }]}
                      >
                        <Input placeholder="Milestone title" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Description"
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Milestone description"
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "budget"]}
                            label="Budget"
                            rules={[
                              { required: true, message: "Missing budget" },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              placeholder="Budget"
                              formatter={(value) =>
                                `$ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value!.replace(/\$\s?|(,*)/g, "")
                              }
                              className="w-full"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "deadline"]}
                            label="Deadline"
                            rules={[
                              { required: true, message: "Missing deadline" },
                            ]}
                          >
                            <DatePicker className="w-full" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {fields.length > 1 && (
                        <Button
                          danger
                          onClick={() => remove(name)}
                          className="mt-2"
                        >
                          Remove Milestone
                        </Button>
                      )}
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Milestone
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <div className="flex justify-between">
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button type="primary" htmlType="submit">
                Create Project
              </Button>
            </div>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          show();
          setCurrentStep(0);
          setProjectData({});
        }}
      >
        Create Project
      </Button>

      {/* Create Project Modal */}
      <Modal
        {...modalProps}
        title="Create New Project"
        width={700}
        footer={null}
      >
        <Steps current={currentStep} className="mb-8">
          <Step title="Basic Info" description="Project details" />
          <Step title="Description" description="Requirements" />
          <Step title="Milestones" description="Project phases" />
        </Steps>
        {renderStepContent()}
      </Modal>
    </div>
  );
};

export default ClientCreateButton;
