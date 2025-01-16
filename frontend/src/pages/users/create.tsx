import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Radio,
  InputNumber,
  Card,
  Row,
  Col,
  Tooltip,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { ROLE_OPTIONS } from "../../utils/constants";
import { Account } from "../../../generated/models/Account";

export const UsersCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<Account>();

  const emailValidationRules = [
    { required: true, message: "Email is required" },
    { type: "email" as const, message: "Please enter a valid email address" },
    { max: 255, message: "Email cannot exceed 255 characters" },
  ];

  const nameValidationRules = [
    { required: true, message: "This field is required" },
    { min: 2, message: "Must be at least 2 characters" },
    { max: 50, message: "Cannot exceed 50 characters" },
    {
      pattern: /^[a-zA-Z\s-']+$/,
      message: "Only letters, spaces, hyphens and apostrophes allowed",
    },
  ];

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span className="text-lg font-semibold flex items-center gap-2">
            <UserOutlined /> Create New User
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
            balance: 0,
            isVerified: false,
            role: "CLIENT",
          }}
        >
          <Divider orientation="left">Basic Information</Divider>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <MailOutlined />
                    Email Address
                  </span>
                }
                name="email"
                rules={emailValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter email address"
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
                    <UserOutlined />
                    First Name
                  </span>
                }
                name="firstName"
                rules={nameValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter first name"
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    Last Name
                  </span>
                }
                name="lastName"
                rules={nameValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter last name"
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Account Settings</Divider>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <DollarOutlined />
                    Initial Balance
                    <Tooltip title="Starting balance for the user account">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="balance"
                rules={[
                  { required: true, message: "Balance is required" },
                  { type: "number", message: "Please enter a valid number" },
                ]}
              >
                <InputNumber
                  placeholder="Enter initial balance"
                  className="w-full"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <SafetyCertificateOutlined />
                    Role
                    <Tooltip title="Determines user permissions and access levels">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="role"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select
                  placeholder="Select role"
                  options={ROLE_OPTIONS}
                  className="w-full"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    Verification Status
                    <Tooltip title="Set initial verification status">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="isVerified"
              >
                <Radio.Group buttonStyle="solid" className="w-full">
                  <Radio.Button value={true} className="w-1/2 text-center">
                    Verified
                  </Radio.Button>
                  <Radio.Button value={false} className="w-1/2 text-center">
                    Unverified
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Create>
  );
};
