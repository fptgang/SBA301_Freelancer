import { useGo, useNotification, useParsed } from "@refinedev/core";
import { Button, Card, Form, Input, Typography, theme } from "antd";
import React, { useEffect } from "react";
import api from "../../config/openapi-config";

const { Title } = Typography;
const { useToken } = theme;

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
  const browser = useParsed();
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const { open } = useNotification();
  const { token } = useToken();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const go = useGo();

  const showNotification = (
    type: "success" | "error",
    message: string,
    description?: string
  ) => {
    open?.({
      type,
      message,
      description,
    });
  };
  useEffect(() => {
    if (!browser.params?.token) {
      go({
        to: "/forgot-password",
        type: "replace",
      });
    }
  }, [browser.params?.token, go]);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!browser.params?.token) {
      showNotification("error", "Invalid Request", "Reset token is missing");

      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({
        resetPasswordRequestDto: {
          token: browser.params.token,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        },
      });

      showNotification(
        "success",
        "Password Reset Successful",
        "You can now log in with your new password"
      );

      form.resetFields();
    } catch (error) {
      showNotification(
        "error",
        "Password Reset Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
      go({
        to: "/login",
        type: "replace",
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: token.screenSMMin,
        margin: `${token.marginLG * 2}px auto`,
        padding: token.padding,
      }}
    >
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <Title level={4} style={{ marginBottom: token.marginLG }}>
          Reset Password
        </Title>

        <Form<ResetPasswordFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isSubmitting}
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                message: "Password must contain both letters and numbers",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("The passwords do not match");
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
              size="large"
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
