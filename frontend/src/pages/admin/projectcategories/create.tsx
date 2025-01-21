import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Checkbox, Card, Row, Col, Tooltip, Divider } from "antd";
import {
  FolderOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

export const ProjectCategoriesCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  const nameValidationRules = [
    { required: true, message: "Name is required" },
    { min: 2, message: "Must be at least 2 characters" },
    { max: 50, message: "Cannot exceed 50 characters" },
    {
      pattern: /^[a-zA-Z0-9\s-_]+$/,
      message: "Only letters, numbers, spaces, hyphens and underscores allowed",
    },
  ];

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span className="text-lg font-semibold flex items-center gap-2">
            <FolderOutlined /> Create Project Category
          </span>
        }
        className="mb-4"
      >
        <Form
          {...formProps}
          layout="vertical"
          className="space-y-4"
          requiredMark="optional"
          initialValues={{
            isVisible: true,
          }}
        >
          <Divider orientation="left">Category Information</Divider>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <FolderOutlined />
                    Category Name
                  </span>
                }
                name="name"
                rules={nameValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter category name"
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
                    <EyeOutlined />
                    Visibility Status
                    <Tooltip title="Control whether this category is visible to users">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="isVisible"
                valuePropName="checked"
              >
                <Checkbox>Make this category visible to users</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Create>
  );
};

export default ProjectCategoriesCreate;
