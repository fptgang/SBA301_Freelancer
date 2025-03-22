import React from "react";
import { useForm } from "@refinedev/antd";
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
  Drawer,
  Button,
  Space,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
  SaveOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "react-router";
import { AccountDto } from "../../../../../generated";
import { ROLE_OPTIONS } from "../../../../utils/constants";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";

interface EditAccountsDrawerProps {
  account?: AccountDto;
  open: boolean;
  onClose: () => void;
}

export const EditAccountsDrawer: React.FC<EditAccountsDrawerProps> = ({
  account,
  open,
  onClose,
}) => {
  const [localSettings] = useLocalSettings()
  const { formProps, saveButtonProps, queryResult, onFinish } =
    useForm<AccountDto>({
      resource: "accounts",
      action: "edit",
      id: account?.accountId,
      redirect: false,
      queryOptions: {
        enabled: !!account,
      },
      onMutationSuccess: () => {
        onClose();
      },
    });

  const accountData = queryResult?.data?.data;
  const isLoading = queryResult?.isLoading;

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

  const footerContent = (
    <Space>
      <Button onClick={onClose} icon={<CloseOutlined />}>
        Cancel
      </Button>
      <Button
        {...saveButtonProps}
        type="primary"
        icon={<SaveOutlined />}
        onClick={() => onFinish()}
      >
        Save
      </Button>
    </Space>
  );

  return (
    <Drawer
      title={
        <Space>
          <UserOutlined />
          Edit Account
        </Space>
      }
      open={open}
      onClose={onClose}
      width={800}
      footer={footerContent}
      destroyOnClose
      forceRender
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Space direction="vertical" size="large" className="w-full">
          <Link
            to={`/admin/accounts/edit/${account?.accountId}`}
            style={{ textAlign: "right", display: "block", color: "#1890ff" }}
          >
            {" "}
            Edit account in full screen <ArrowsAltOutlined />
          </Link>
          <Card className="shadow-md">
            {accountData?.verifiedAt && (
              <Alert
                message="Verified Account"
                description={`This Account was verified on ${localSettings.formatDateTime(
                  accountData.verifiedAt
                )}`}
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
              initialValues={accountData}
            >
              <Row gutter={24}>
                <Col span={24} md={12}>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <IdcardOutlined />
                        Account ID
                        <Tooltip title="Unique identifier for this Account">
                          <QuestionCircleOutlined className="text-gray-400" />
                        </Tooltip>
                      </span>
                    }
                    name="accountId"
                    rules={[{ required: true }]}
                  >
                    <Input
                      placeholder="Enter Account ID"
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
                    rules={[
                      { required: true, message: "Please select a role" },
                    ]}
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
        </Space>
      )}
    </Drawer>
  );
};
