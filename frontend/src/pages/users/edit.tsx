import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Alert,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ROLE_OPTIONS } from "../../utils/constants";
import { AccountDto } from "../../../generated";

export const AccountsEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<AccountDto>({
    redirect: false,
  });

  const accountsData = queryResult?.data?.data;

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
    <Edit saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span className="text-lg font-semibold flex items-center gap-2">
            <UserOutlined /> Edit Account
          </span>
        }
        className="mb-4"
      >
        {accountsData?.verifiedAt && (
          <Alert
            message="Verified Account"
            description={`This account was verified on ${dayjs(
              accountsData.verifiedAt
            ).format("MMMM D, YYYY")}`}
            type="success"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          {...formProps}
          layout="vertical"
          className="space-y-4"
          requiredMark="optional"
        >
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <span className="flex items-center gap-2">
                    <IdcardOutlined />
                    Account ID
                    <Tooltip title="Unique identifier for this account">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="accountId"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Enter account ID"
                  className="w-full"
                  disabled
                />
              </Form.Item>
            </Col>

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

          <Row gutter={24}>
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
        </Form>
      </Card>
    </Edit>
  );
};
