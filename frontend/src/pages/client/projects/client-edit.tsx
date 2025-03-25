import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Divider,
  Typography,
  notification,
  Select,
  Card,
  Tabs,
  Badge,
  Progress,
  Row,
  Col,
  Tooltip,
  Alert,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ToolOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { HttpError, useApiUrl, useCustomMutation } from "@refinedev/core";
import dayjs from "dayjs";
import { ProjectDto } from "../../../../generated/models/ProjectDto";
import { ProficiencyEnum } from "../../../../generated/models/ProficiencyEnum";
import api from "../../../services/api/openapi-config";
import { useSelect } from "@refinedev/antd";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ClientProjectEditButtonProps {
  project: ProjectDto;
  onSuccess?: () => void;
}

const ClientProjectEditButton: React.FC<ClientProjectEditButtonProps> = ({
  project,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [tabValidation, setTabValidation] = useState({
    "1": false, // Basic Info tab
    "2": false, // Skills tab
    "3": false, // Milestones tab
  });
  
  const { mutate } = useCustomMutation();
  const apiUrl = useApiUrl();
  
  // Add category select hook
  const { selectProps: categorySelectProps } = useSelect({
    resource: "project-categories",
    optionLabel: "name",
    optionValue: "projectCategoryId",
  });
  
  // Fetch skills when the modal opens
  const fetchSkills = async () => {
    try {
      const response = await fetch(`${apiUrl}/skills?pageSize=100`);
      const data = await response.json();
      setSkills(data.content || []);
    } catch (error) {
      console.error("Failed to fetch skills", error);
    }
  };

  // Check tab validation status
  useEffect(() => {
    if (!visible) return;
    
    const validateTabs = async () => {
      try {
        const values = form.getFieldsValue();
        
        // Basic info tab validation
        const basicInfoValid = Boolean(
          values.title && 
          values.description && 
          values.projectCategoryId && 
          values.minBudget && 
          values.maxBudget && 
          new Date(values.startDate)
        );
        
        // Skills tab validation
        const skillsValid = values.requiredSkills && 
          values.requiredSkills.length > 0 && 
          values.requiredSkills.every((skill: any) => skill.skillId && skill.proficiency);
        
        // Milestones tab validation
        const milestonesValid = values.milestones && 
          values.milestones.length > 0 && 
          values.milestones.every((milestone: any) => 
            milestone.title && 
            milestone.description && 
            milestone.budgetRatio && 
           new Date( milestone.deadline)
          );
        
        setTabValidation({
          "1": basicInfoValid,
          "2": skillsValid,
          "3": milestonesValid,
        });
      } catch (error) {
        console.error("Validation check failed", error);
      }
    };
    
    validateTabs();
  }, [form, visible, form.getFieldsValue()]);
  
  const showModal = () => {
    // Only allow editing if project is OPEN
    if (project.status !== "OPEN") {
      notification.warning({
        message: "Cannot Edit Project",
        description: "Only projects with OPEN status can be edited.",
      });
      return;
    }
    
    fetchSkills();
    console.log(project)
    // Initialize form with project data
    form.setFieldsValue({
      projectCategoryId: project.projectCategory?.projectCategoryId,
      title: project.title,
      description: project.description,
      minBudget: project.minBudget,
      maxBudget: project.maxBudget,
      startDate: dayjs(project.startDate),
      requiredSkills: project.requiredSkills?.map(skill => ({
        skillId: skill.skill?.skillId,
        proficiency: skill.proficiency
      })) || [],
      milestones: project.milestones?.map(milestone => ({
        milestoneId: milestone.milestoneId,
        title: milestone.title,
        description: milestone.description,
        budgetRatio: milestone.budgetRatio,
        deadline: milestone.deadline ? dayjs(milestone.deadline) : null,
      })) || [],
    });
    
    setVisible(true);
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Confirm exit',
      content: 'Are you sure you want to exit? Any unsaved changes will be lost.',
      onOk() {
        setVisible(false);
        form.resetFields();
        setActiveTab("1");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Transform the data for API submission
      const formattedValues = {
        ...values,
        milestones: values.milestones.map((milestone: any) => ({
          ...milestone
        })),
      };
      
      setLoading(true);
      
      try {
        await api.updateProject({
          projectUpdateDto: formattedValues,
          projectId: project.projectId!,
        })  
        setLoading(false);
        setVisible(false);
        message.success("Project updated successfully");
        if (onSuccess) onSuccess();
      } catch(error) {
        message.error((error as Error).toString());
        setLoading(false);
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  const addMilestone = () => {
    const milestones = form.getFieldValue("milestones") || [];
    
    if (milestones.length >= 10) {
      notification.warning({
        message: "Maximum Milestones Reached",
        description: "You can only have up to 10 milestones per project.",
      });
      return;
    }
    
    form.setFieldsValue({
      milestones: [
        ...milestones,
        {
          title: "",
          description: "",
          budgetRatio: 0.1,
          deadline: null,
        },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    const milestones = form.getFieldValue("milestones") || [];
    
    if (milestones.length <= 1) {
      notification.warning({
        message: "Cannot Remove Milestone",
        description: "Projects must have at least one milestone.",
      });
      return;
    }
    
    form.setFieldsValue({
      milestones: milestones.filter((_: any, i: number) => i !== index),
    });
  };

  const addRequiredSkill = () => {
    const requiredSkills = form.getFieldValue("requiredSkills") || [];
    form.setFieldsValue({
      requiredSkills: [
        ...requiredSkills,
        {
          skillId: undefined,
          proficiency: ProficiencyEnum.Beginner,
        },
      ],
    });
  };

  const removeRequiredSkill = (index: number) => {
    const requiredSkills = form.getFieldValue("requiredSkills") || [];
    form.setFieldsValue({
      requiredSkills: requiredSkills.filter((_: any, i: number) => i !== index),
    });
  };

  // Calculate total budget ratio for all milestones
  const calculateTotalBudgetRatio = () => {
    const milestones = form.getFieldValue("milestones") || [];
    return milestones.reduce((total: number, milestone: any) => {
      return total + (milestone.budgetRatio || 0);
    }, 0);
  };

  // Only allow editing if the project is in OPEN status
  const canEdit = project.status === "OPEN";

  // Get tab validation icon
  const getTabIcon = (tabKey: string) => {
    if (!form.isFieldsTouched()) return null;
    
    return tabValidation[tabKey] ? 
      <CheckCircleOutlined className="text-green-500" /> : 
      <ExclamationCircleOutlined className="text-yellow-500" />;
  };

  // Move to next tab
  const goToNextTab = () => {
    if (activeTab === "1") setActiveTab("2");
    else if (activeTab === "2") setActiveTab("3");
  };

  // Move to previous tab
  const goToPrevTab = () => {
    if (activeTab === "3") setActiveTab("2");
    else if (activeTab === "2") setActiveTab("1");
  };
  
  return (
    <>
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={showModal}
        disabled={!canEdit}
        title={!canEdit ? "Only OPEN projects can be edited" : "Edit project"}
      >
        Edit Project
      </Button>

      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>Edit Project: {project.title}</span>
                          <div className="text-sm font-normal flex items-center">
              {Object.values(tabValidation).every(Boolean) ? (
                <Badge 
                  status="success" 
                  text={<span className="align-middle">All sections complete</span>}
                  className="ml-2" 
                />
              ) : (
                <Badge 
                  status="warning" 
                  text={<span className="align-middle">Some sections incomplete</span>}
                  className="ml-2" 
                />
              )}
            </div>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        maskClosable={false}
        closable={false}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          activeTab !== "1" && (
            <Button key="prev" onClick={goToPrevTab}>
              Previous
            </Button>
          ),
          activeTab !== "3" && (
            <Button key="next" type="primary" onClick={goToNextTab}>
              Next
            </Button>
          ),
          activeTab === "3" && (
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
              disabled={!Object.values(tabValidation).every(Boolean)}
            >
              Update Project
            </Button>
          ),
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            milestones: [{}], // At least one milestone
            requiredSkills: [],
          }}
          onValuesChange={() => {
            // Trigger validation on form changes
            const values = form.getFieldsValue();
            const basicInfoValid = Boolean(
              values.title && 
              values.description && 
              values.projectCategoryId && 
              values.minBudget && 
              values.maxBudget && 
              values.startDate
            );
            
            const skillsValid = values.requiredSkills && 
              values.requiredSkills.length > 0 && 
              values.requiredSkills.every((skill: any) => skill.skillId && skill.proficiency);
            
            const milestonesValid = values.milestones && 
              values.milestones.length > 0 && 
              values.milestones.every((milestone: any) => 
                milestone.title && 
                milestone.description && 
                milestone.budgetRatio && 
                milestone.deadline
              );
            
            setTabValidation({
              "1": basicInfoValid,
              "2": skillsValid,
              "3": milestonesValid,
            });
          }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined /> Basic Info {getTabIcon("1")}
                </span>
              } 
              key="1"
            >
              <Form.Item
                name="title"
                label="Project Title"
                rules={[{ required: true, message: "Please enter a project title" }]}
              >
                <Input placeholder="Enter project title" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Project Description"
                rules={[{ required: true, message: "Please enter a project description" }]}
              >
                <TextArea
                  placeholder="Enter project description"
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
              </Form.Item>
              
              <Form.Item
                name="projectCategoryId"
                label="Project Category"
                rules={[{ required: true, message: "Please select a category" }]}
              >
                <Select 
                  placeholder="Select project category"
                  {...categorySelectProps}
                  options={categorySelectProps.options?.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minBudget"
                    label="Minimum Budget"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Min"
                      min={1}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="maxBudget"
                    label="Maximum Budget"
                    rules={[
                      { required: true, message: "Required" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('minBudget') <= value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Max budget must be greater than min budget'));
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Max"
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: "Please select a start date" }]}
                extra="You can only extend the start date, not make it earlier."
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  disabledDate={(current) => {
                    // Can't select days before today + 3 days
                    return current && current < dayjs().add(3, 'days').startOf('day');
                  }}
                  defaultValue={dayjs(project.startDate)}
                />
              </Form.Item>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <ToolOutlined /> Required Skills {getTabIcon("2")}
                </span>
              } 
              key="2"
            >
              <div className="flex justify-between items-center mb-4">
                <Title level={5} style={{ margin: 0 }}>Skills Required for this Project</Title>
                <Button 
                  type="primary" 
                  ghost
                  onClick={addRequiredSkill} 
                  icon={<PlusOutlined />}
                >
                  Add Skill
                </Button>
              </div>
              
              <Form.List name="requiredSkills">
                {(fields) => (
                  <div style={{ width: "100%" }}>
                    {fields.length === 0 ? (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <Text type="secondary">No skills added yet. Click "Add Skill" to start.</Text>
                      </div>
                    ) : (
                      fields.map((field, index) => (
                        <Card 
                          key={field.key} 
                          style={{ marginBottom: 16 }}
                          size="small"
                          className="border border-gray-200 hover:shadow-sm transition-shadow"
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeRequiredSkill(index)}
                            />
                          }
                        >
                          <Row gutter={16}>
                            <Col span={14}>
                              <Form.Item
                                name={[field.name, "skillId"]}
                                label="Skill"
                                rules={[{ required: true, message: "Please select a skill" }]}
                              >
                                <Select
                                  placeholder="Select a skill"
                                  showSearch
                                  filterOption={(input, option) =>
                                    (option?.children as unknown as string)
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                >
                                  {skills.map((skill) => (
                                    <Option key={skill.skillId} value={skill.skillId}>
                                      {skill.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            
                            <Col span={10}>
                              <Form.Item
                                name={[field.name, "proficiency"]}
                                label="Proficiency Level"
                                rules={[{ required: true, message: "Please select a proficiency level" }]}
                              >
                                <Select placeholder="Select proficiency level">
                                  {Object.values(ProficiencyEnum).map((level) => (
                                    <Option key={level} value={level}>
                                      {level}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </Form.List>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <FlagOutlined /> Milestones {getTabIcon("3")}
                </span>
              } 
              key="3"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Project Milestones
                    <Text type="secondary" style={{ fontSize: 14, marginLeft: 8 }}>
                      (Min: 1, Max: 10)
                    </Text>
                  </Title>
                  
                  <div className="mt-2">
                    <Tooltip 
                      title={
                        calculateTotalBudgetRatio() === 1 
                          ? "Budget distribution is balanced (100%)" 
                          : `Budget distribution is ${(calculateTotalBudgetRatio() * 100).toFixed(0)}%, should total 100%`
                      }
                    >
                      <Progress 
                        percent={calculateTotalBudgetRatio() * 100}
                        status={calculateTotalBudgetRatio() === 1 ? "success" : "active"}
                        strokeColor={
                          calculateTotalBudgetRatio() === 1 
                            ? "#52c41a" 
                            : calculateTotalBudgetRatio() > 1 
                              ? "#f5222d" 
                              : "#1890ff"
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
                
                <Button 
                  type="primary" 
                  ghost
                  onClick={addMilestone} 
                  icon={<PlusOutlined />}
                  disabled={form.getFieldValue("milestones")?.length >= 10}
                >
                  Add Milestone
                </Button>
              </div>
              
              <Form.List name="milestones">
                {(fields) => (
                  <div style={{ width: "100%" }}>
                    {fields.map((field, index) => {
                      const milestones = form.getFieldValue("milestones") || [];
                      const canRemove = milestones.length > 1;
                      
                      return (
                        <Card 
                          key={field.key} 
                          title={
                            <div className="flex justify-between items-center">
                              <span>Milestone {index + 1}</span>
                              <Text type="secondary">
                                {form.getFieldValue(["milestones", index, "budgetRatio"]) 
                                  ? `${(form.getFieldValue(["milestones", index, "budgetRatio"]) * 100).toFixed(0)}% of budget`
                                  : ""}
                              </Text>
                            </div>
                          }
                          className="mb-4 border border-gray-200 hover:shadow-sm transition-shadow"
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeMilestone(index)}
                              disabled={!canRemove}
                            />
                          }
                        >
                          <Form.Item
                            name={[field.name, "milestoneId"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          
                          <Form.Item
                            name={[field.name, "title"]}
                            label="Title"
                            rules={[{ required: true, message: "Please enter milestone title" }]}
                          >
                            <Input placeholder="Enter milestone title" />
                          </Form.Item>
                          
                          <Form.Item
                            name={[field.name, "description"]}
                            label="Description"
                            rules={[{ required: true, message: "Please enter milestone description" }]}
                          >
                            <TextArea
                              placeholder="Enter milestone description"
                              autoSize={{ minRows: 2, maxRows: 6 }}
                            />
                          </Form.Item>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name={[field.name, "budgetRatio"]}
                                label={
                                  <span className="flex items-center">
                                    Budget Ratio
                                    <Tooltip title="Percentage of total budget allocated to this milestone (0.1 = 10%, 1 = 100%)">
                                      <InfoCircleOutlined className="ml-1 text-gray-400" />
                                    </Tooltip>
                                  </span>
                                }
                                rules={[
                                  { required: true, message: "Please enter budget ratio" },
                                  () => ({
                                    validator(_, value) {
                                      if (value >= 0.1 && value <= 1) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error("Budget ratio must be between 0.1 and 1")
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <InputNumber
                                  step={0.1}
                                  min={0.1}
                                  max={1}
                                  style={{ width: "100%" }}
                                  formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
                                  parser={(value) => Number(value?.replace('%', '')) / 100}
                                />
                              </Form.Item>
                            </Col>
                            
                            <Col span={12}>
                              <Form.Item
                                name={[field.name, "deadline"]}
                                label="Deadline"
                                rules={[{ required: true, message: "Please select a deadline" }]}
                              >
                                <DatePicker 
                                  style={{ width: "100%" }} 
                                  getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                                  inputReadOnly
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Form.List>
              
              {calculateTotalBudgetRatio() !== 1 && (
                <Alert
                  message="Budget allocation needs attention"
                  description={
                    calculateTotalBudgetRatio() < 1
                      ? `Your total budget allocation is ${(calculateTotalBudgetRatio() * 100).toFixed(0)}%. Please adjust milestone budgets to total 100%.`
                      : `Your total budget allocation is ${(calculateTotalBudgetRatio() * 100).toFixed(0)}%, which exceeds 100%. Please adjust milestone budgets.`
                  }
                  type={calculateTotalBudgetRatio() > 1 ? "error" : "warning"}
                  showIcon
                  className="mt-4"
                />
              )}
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </>
  );
};

export default ClientProjectEditButton;