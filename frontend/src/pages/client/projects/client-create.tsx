import React, { useState } from "react";
import { useGetIdentity, useCreate, HttpError } from "@refinedev/core";
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
  Upload,
  Tooltip,
  Alert,
  Space,
  notification,
} from "antd";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { useForm, useModal, useSelect } from "@refinedev/antd";
import moment, { Moment } from "moment";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import api from "../../../services/api/openapi-config";
import { store } from "../../../store";
import {
  ProjectCreateDto,
  SkillSetDto,
  MilestoneCreateDto,
  ProficiencyEnum,
  ProjectSkillDto,
} from "../../../../generated/models";
import dayjs from "dayjs";

const { Step } = Steps;
interface ClientCreateButtonProps {
  refetch: () => void;
}
const ClientCreateButton: React.FC<ClientCreateButtonProps> = ({ refetch }) => {
  // Get current user identity
  const { data: identity } = useGetIdentity<{ id: number }>();
  const userId = identity?.id;

  // Modal state
  const { modalProps, show, close } = useModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<any>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<ProjectSkillDto>>({});
  const [skills, setSkills] = useState<ProjectSkillDto[]>([]);

  // Fetch categories for select
  const { selectProps: categorySelectProps } = useSelect({
    resource: "project-categories",
    optionLabel: "name",
    optionValue: "projectCategoryId",
  });

  // Fetch skills for select
  const { selectProps: skillSelectProps, queryResult: skillsQueryResult } =
    useSelect({
      resource: "skills",
      optionLabel: "name",
      optionValue: "skillId",
    });
  const skillOptions = skillsQueryResult?.data?.data;

  // Create project form
  const { formProps, form } = useForm({
    resource: "projects",
    redirect: false,
    onMutationSuccess: () => {
      message.success("Project created successfully");
      close();
      setCurrentStep(0);
      setProjectData({});
      setFileList([]);
    },
  });

  // Handle file change
  const handleFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    // Limit to 5 files
    const limitedList = newFileList.slice(-5);
    setFileList(limitedList);
  };

  // Date validation rules
  const isDateValid = (date: Moment | null) => {
    const minDate = moment().add(3, "days");
    return date && date.isAfter(minDate);
  };

  // Validate milestone dates
  const validateMilestoneDates = (milestones: any[]) => {
    if (!milestones || milestones.length === 0) {
      return false;
    }

    if (milestones.length > 10) {
      message.error("Maximum 10 milestones allowed");
      return false;
    }

    // Sort milestones by deadline
    const sortedMilestones = [...milestones].sort(
      (a, b) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf()
    );

    // Check if first milestone is at least 3 days from now
    const firstMilestoneDate = moment(new Date(sortedMilestones[0].deadline));
    if (!isDateValid(firstMilestoneDate)) {
      message.error(
        "First milestone deadline must be at least 3 days from now"
      );
      return false;
    }

    // Check distance between milestones (3-30 days)
    for (let i = 1; i < sortedMilestones.length; i++) {
      const prevDate = dayjs(sortedMilestones[i - 1].deadline);
      const currDate = dayjs(sortedMilestones[i].deadline);

      // Use dayjs's diff method to get difference in days
      const daysBetween = currDate.diff(prevDate, 'day', true);
      
      // Round to nearest whole number for better user experience
      const roundedDaysBetween = Math.round(daysBetween);

      if (roundedDaysBetween < 3) {
        message.error("Milestones must be at least 3 days apart");
        return false;
      }

      if (roundedDaysBetween > 30) {
        message.error("Milestones should not be more than 30 days apart");
        return false;
      }
    }

    return true;
  };

  // Upload files after project creation
  const uploadProjectFiles = async (projectId: number) => {
    if (fileList.length === 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = store?.getState().auth.accessToken;
      const uploadPromises = fileList.map((file) => {
        return api.uploadFile({
          blob: file.originFileObj,
          projectId: projectId,
        });
      });

      await Promise.all(uploadPromises);
      message.success("Files uploaded successfully");
    } catch (error) {
      console.error("File upload error:", error);
      message.error("Error uploading files. Project was created successfully.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step form submission
  const handleStepSubmit = async (values: any) => {
    const updatedProjectData = { ...projectData, ...values };
    setProjectData(updatedProjectData);

    if (currentStep === 2) {
      // Final step - validate milestones
      if (!validateMilestoneDates(updatedProjectData.milestones)) {
        return;
      }

      setIsSubmitting(true);

      // Create the DTO with properly typed properties
      const projectCreateDto: ProjectCreateDto = {
        title: updatedProjectData.title,
        description: updatedProjectData.description,
        projectCategoryId: updatedProjectData.projectCategoryId,
        minBudget: updatedProjectData.minBudget,
        maxBudget: updatedProjectData.maxBudget,
        requiredSkills: [],
        milestones: [],
        startDate: moment(new Date(updatedProjectData.startDate)).toDate(),
      };

      // Transform the skills to match SkillSetDto format
      if (
        updatedProjectData.requiredSkills &&
        Array.isArray(updatedProjectData.requiredSkills)
      ) {
        projectCreateDto.requiredSkills = updatedProjectData.requiredSkills.map(
          (skill: ProjectSkillDto): SkillSetDto => ({
            skillId: skill.skill?.skillId || 0,
            proficiency: skill.proficiency || ProficiencyEnum.Beginner,
          })
        );
      }

      // Format milestones according to MilestoneCreateDto
      if (
        updatedProjectData.milestones &&
        Array.isArray(updatedProjectData.milestones)
      ) {
        projectCreateDto.milestones = updatedProjectData.milestones.map(
          (milestone: any): MilestoneCreateDto => ({
            title: milestone.title,
            description: milestone.description,
            budgetRatio: milestone.budget,
            deadline: moment(new Date(milestone.deadline)).toDate(),
          })
        );
      }

      try {
        // Create project
        const response = await api.createProject({
          projectCreateDto: projectCreateDto,
        });

        // After successful project creation, upload files
        if (response && response.projectId) {
          await uploadProjectFiles(response.projectId);
        }

        // Reset state and close modal
        message.success("Project created successfully");
        close();
        setCurrentStep(0);
        setProjectData({});
        setFileList([]);
        setIsSubmitting(false);
        form.resetFields();
        refetch();
      } catch (error) {
        console.error("Project creation error:", error);
        message.error("Failed to create project. Please try again.");
        setIsSubmitting(false);
      }
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
              label={
                <span className="flex items-center">
                  Project Title
                  <Tooltip title="Give your project a clear, descriptive name">
                    <QuestionCircleOutlined className="ml-1" />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: "Please enter a project title" },
                { min: 3, message: "Title must be at least 3 characters" },
                { max: 100, message: "Title cannot exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter project title" />
            </Form.Item>

            <Form.Item
              name="projectCategoryId"
              label={
                <span className="flex items-center">
                  Project Category
                  <Tooltip title="Select the most relevant category for your project">
                    <QuestionCircleOutlined className="ml-1" />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select placeholder="Select category" {...categorySelectProps} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minBudget"
                  label={
                    <span className="flex items-center">
                      Minimum Budget ($)
                      <Tooltip title="The minimum budget you're willing to spend">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter minimum budget" },
                    {
                      validator: (_, value) => {
                        if (value <= 0) {
                          return Promise.reject(
                            "Budget must be greater than 0"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder="Min budget"
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      parseFloat(value!.replace(/\$\s?|(,*)/g, "")) as any
                    }
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxBudget"
                  label={
                    <span className="flex items-center">
                      Maximum Budget ($)
                      <Tooltip title="The maximum budget you're willing to spend">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter maximum budget" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder="Max budget"
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      parseFloat(value!.replace(/\$\s?|(,*)/g, "")) as any
                    }
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="startDate"
                  label={
                    <span className="flex items-center">
                      Project Start Date
                      <Tooltip title="When would you like the project to start?">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a start date" },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject("Start date is required");
                        }

                        const minDate = moment().add(3, "d");

                        if (moment(new Date(value)).isBefore(minDate)) {
                          return Promise.reject(
                            "Start date must be at least 3 days from today"
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    disabledDate={(current) => {
                      // Can't select days before today + 3 days
                      return (
                        current &&
                        current < moment().add(3, "days").startOf("day")
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

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
              label={
                <span className="flex items-center">
                  Project Description
                  <Tooltip title="Provide detailed information about your project requirements">
                    <QuestionCircleOutlined className="ml-1" />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: "Please enter a description" },
                {
                  min: 10,
                  message: "Description must be at least 10 characters",
                },
                {
                  max: 1000,
                  message: "Description cannot exceed 1000 characters",
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Describe your project in detail..."
              />
            </Form.Item>

            <Form.List name="requiredSkills">
              {(fields, { add, remove }) => (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Form.Item label="Required Skills">
                    <Space>
                      <Select
                        {...skillSelectProps}
                        placeholder="Select skill"
                        onSelect={(option) => {
                          setNewSkill((prev) => ({
                            ...prev,
                            skill: {
                              skillId: Number(option),
                              name:
                                skillOptions?.find(
                                  (skill) => skill.skillId === Number(option)
                                )?.name || "abc",
                            },
                          }));
                        }}
                        value={newSkill.skill?.skillId}
                      />
                      <Select
                        options={Object.values(ProficiencyEnum).map(
                          (value) => ({
                            label: value,
                            value,
                          })
                        )}
                        placeholder="Select proficiency level"
                        onSelect={(value) => {
                          setNewSkill((prev) => ({
                            ...prev,
                            proficiency: value as ProficiencyEnum,
                          }));
                        }}
                        value={newSkill?.proficiency}
                      />
                      <a
                        onClick={() => {
                          if (newSkill?.skill && newSkill?.proficiency) {
                            const currentSkills = skills;
                            console.log(skills);
                            const skillExists = currentSkills.some(
                              (item: ProjectSkillDto) =>
                                item.skill?.skillId === newSkill.skill?.skillId
                            );

                            if (skillExists) {
                              notification.warning({
                                message: "This skill is existed",
                              });
                              return;
                            }
                            setSkills((prev) => [...prev, newSkill]);
                            add(newSkill);
                            setNewSkill({});
                          }
                        }}
                      >
                        Add skill
                      </a>
                    </Space>
                  </Form.Item>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline">
                      <Form.Item
                        name={[name, "skill", "name"]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          {...skillSelectProps}
                          placeholder="Select skill"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[name, "proficiency"]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          options={Object.values(ProficiencyEnum).map(
                            (value) => ({
                              label: value,
                              value,
                            })
                          )}
                          placeholder="Select proficiency level"
                        />
                      </Form.Item>
                      <a
                        onClick={() => {
                          setSkills((prev) =>
                            prev.filter((_, i) => i !== name)
                          );
                          remove(name);
                        }}
                      >
                        Remove
                      </a>
                    </Space>
                  ))}
                </Space>
              )}
            </Form.List>

            <Form.Item
              name="files"
              label={
                <span className="flex items-center">
                  Project Documents (Optional)
                  <Tooltip title="Upload any relevant files or documentation">
                    <QuestionCircleOutlined className="ml-1" />
                  </Tooltip>
                </span>
              }
              getValueFromEvent={() => fileList}
            >
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
            <div className="text-xs text-gray-500 mt-1 mb-4">
              Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max 5MB per file)
            </div>

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
            <Alert
              message="Milestone Requirements"
              description={
                <ul className="list-disc pl-4 mt-2">
                  <li>At least 1 milestone is required (maximum 10)</li>
                  <li>First milestone must be at least 3 days from today</li>
                  <li>Milestones must be spaced 3-30 days apart</li>
                  <li>Deadlines must be in chronological order</li>
                </ul>
              }
              type="info"
              showIcon
              className="mb-4"
            />

            <Form.List
              name="milestones"
              rules={[
                {
                  validator: async (_, milestones) => {
                    if (!milestones || milestones.length < 1) {
                      return Promise.reject(
                        new Error("At least one milestone is required")
                      );
                    }
                    if (milestones.length > 10) {
                      return Promise.reject(
                        new Error("Maximum 10 milestones allowed")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} className="mb-4" size="small">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Milestone Title"
                        rules={[
                          { required: true, message: "Missing title" },
                          {
                            max: 100,
                            message: "Title cannot exceed 100 characters",
                          },
                        ]}
                      >
                        <Input placeholder="Milestone title" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Description"
                        rules={[
                          {
                            required: true,
                            message: "Description is required",
                          },
                          {
                            max: 500,
                            message: "Description cannot exceed 500 characters",
                          },
                        ]}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Milestone description"
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Budget Ratio"
                            name={[name, "budget"]}
                            rules={[
                              {
                                required: true,
                              },
                              {
                                validator: (_, value) => {
                                  if (value <= 0) {
                                    return Promise.reject(
                                      "Budget ratio must be greater than 0"
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            getValueProps={(value) => ({
                              value: value
                                ? Math.round(value * 100)
                                : undefined,
                            })}
                            normalize={(value) => value / 100}
                          >
                            <InputNumber
                              placeholder="e.g. 20"
                              className="w-full"
                              min={1}
                              max={100}
                              formatter={(value) => `${Math.round(value)}`}
                              parser={(value) => value?.replace("%", "")}
                              suffix={<PercentageOutlined />}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "deadline"]}
                            label={
                              <span className="flex items-center">
                                Deadline
                                <Tooltip title="Must be at least 3 days from today, and milestones must be 3-30 days apart">
                                  <InfoCircleOutlined className="ml-1" />
                                </Tooltip>
                              </span>
                            }
                            rules={[
                              { required: true, message: "Missing deadline" },
                              {
                                validator: (_, value) => {
                                  if (!value) {
                                    return Promise.reject("Date is required");
                                  }

                                  const minDate = moment().add(3, "d");

                                  if (
                                    moment(new Date(value)).isBefore(minDate)
                                  ) {
                                    return Promise.reject(
                                      "Date must be at least 3 days from today"
                                    );
                                  }

                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <DatePicker
                              className="w-full"
                              disabledDate={(current) => {
                                // Can't select days before today + 3 days
                                return (
                                  current &&
                                  current <
                                    moment().add(3, "days").startOf("day")
                                );
                              }}
                            />
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
                      disabled={fields.length >= 10}
                    >
                      Add Milestone
                    </Button>
                    {fields.length >= 10 && (
                      <div className="text-red-500 mt-1">
                        Maximum 10 milestones allowed
                      </div>
                    )}
                  </Form.Item>
                </>
              )}
            </Form.List>

            <div className="flex justify-between">
              <Button onClick={handlePrevStep}>Previous</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
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
          setFileList([]);
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
        maskClosable={false}
        closable={!isSubmitting}
        onCancel={() => {
          if (!isSubmitting) {
            close();
            setCurrentStep(0);
            setProjectData({});
            setFileList([]);
          }
        }}
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
