import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import api from "../../../services/api/openapi-config";
import {useNotification} from "@refinedev/core";

const { Title } = Typography;

const SecuritySettingsPage: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const { open } = useNotification();

  const handlePasswordChange = async (values: {
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
    try {
      await api
        .changePassword({
          changePasswordRequestDto: {
            oldPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
        })
      open?.({
        type: "success",
        message: "ChangePassword",
        description: "Password changed successfully",
      });
    } catch (e) {
      open?.({
        type: "error",
        message: "ChangePassword",
        description: e.toString(),
      });
    }
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
