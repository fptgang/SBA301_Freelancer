import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import api from "../../../services/api/openapi-config";

const { Title } = Typography;

const SecuritySettingsPage: React.FC = () => {
  const [passwordForm] = Form.useForm();

  const handlePasswordChange = (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // Validate passwords
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    if (values.newPassword.length < 6) {
      message.error("Password must be at least 6 characters long");
      return;
    }
    api
      .changePassword({
        changePasswordRequestDto: {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
      })
      .then(() => {
        message.success("Password changed successfully");
      })
      .catch((error) => {
        message.error(error.response.data.message);
      });
    passwordForm.resetFields();
  };

  return (
    <>
      <Card>
        <Title level={3}>Security Settings</Title>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please input your current password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm your new password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default SecuritySettingsPage;
