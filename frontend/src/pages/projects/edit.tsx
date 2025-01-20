import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Card,
  Row,
  Col,
  Tooltip,
  Divider,
} from "antd";
import {
  ProjectOutlined,
  FolderOutlined,
  FileTextOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  TagOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ProjectDtoStatusEnum } from "../../../generated";

export const ProjectsEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const projectsData = queryResult?.data?.data;

  const { selectProps: projectCategorySelectProps } = useSelect({
    resource: "projectCategories",
    optionLabel: "name",
    optionValue: "projectCategoryId",
  });

  const titleValidationRules = [
    { required: true, message: "Title is required" },
    { min: 3, message: "Must be at least 3 characters" },
    { max: 100, message: "Cannot exceed 100 characters" },
  ];

  const descriptionValidationRules = [
    { required: true, message: "Description is required" },
    { min: 10, message: "Must be at least 10 characters" },
    { max: 1000, message: "Cannot exceed 1000 characters" },
  ];

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span className="text-lg font-semibold flex items-center gap-2">
            <ProjectOutlined /> Edit Project
          </span>
        }
        className="mb-4"
      >
        <Form
          {...formProps}
          layout="vertical"
          className="space-y-4"
          requiredMark="optional"
        >
          <Divider orientation="left">Basic Information</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Project Title
                    <Tooltip title="Enter a clear, descriptive name for your project">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="title"
                rules={titleValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter project title"
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <FolderOutlined />
                    Project Category
                    <Tooltip title="Select the category that best describes your project">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="projectCategoryId"
                rules={[{ required: true, message: "Category is required" }]}
              >
                <Select
                  {...projectCategorySelectProps}
                  placeholder="Select project category"
                  className="w-full"
                  showSearch
                />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <TagOutlined />
                    Project Status
                    <Tooltip title="Set the current status of your project">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="status"
                rules={[{ required: true, message: "Status is required" }]}
              >
                <Select
                  placeholder="Select project status"
                  className="w-full"
                  showSearch
                >
                  {Object.values(ProjectDtoStatusEnum).map((status) => (
                    <Select.Option key={status} value={status}>
                      {status
                        .toLowerCase()
                        .replace("_", " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Project Details</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <InfoCircleOutlined />
                    Description
                    <Tooltip title="Provide a detailed description of your project">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="description"
                rules={descriptionValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input.TextArea
                  placeholder="Enter project description"
                  rows={5}
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Project Settings</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <EyeOutlined />
                    Visibility
                    <Tooltip title="Control whether this project is visible to users">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="isVisible"
                valuePropName="checked"
              >
                <Checkbox>Make this project visible to users</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Edit>
  );
};

export default ProjectsEdit;
