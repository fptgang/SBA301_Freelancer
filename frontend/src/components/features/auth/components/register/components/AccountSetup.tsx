import React from 'react';
import { Form, Input, Typography, theme } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';

const { Title } = Typography;

interface AccountSetupProps {
  form: any; // Form instance from parent
}

export const AccountSetup: React.FC<AccountSetupProps> = ({ form }) => {
  const translate = useTranslate();
  const { token } = theme.useToken();
  
  return (
    <div className="w-full max-w-xl">
      <Title
        level={3}
        style={{
          color: "black",
          textAlign: "center",
          lineHeight: "1.4",
          fontWeight: "500",
          marginBottom: "30px",
        }}
      >
        Set up your account
      </Title>
      
      <Form.Item
        name="email"
        label={translate("pages.register.email", "Email")}
        rules={[
          {
            required: true,
            message: translate(
              "pages.register.errors.requiredEmail",
              "Email is required"
            ),
          },
          {
            type: "email",
            message: translate(
              "pages.register.errors.validEmail",
              "Invalid email address"
            ),
          },
        ]}
      >
        <Input 
          size="large" 
          placeholder={translate("pages.register.fields.email", "Email")} 
          prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        label={translate("pages.register.fields.password", "Password")}
        rules={[
          {
            required: true,
            message: translate(
              "pages.register.errors.requiredPassword",
              "Password is required"
            ),
          },
          {
            min: 8,
            message: translate(
              "pages.register.errors.passwordLength",
              "Password must be at least 8 characters"
            ),
          },
        ]}
        extra={translate("pages.register.passwordRequirements", "Use at least 8 characters with a mix of letters, numbers & symbols")}
      >
        <Input.Password 
          prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
          size="large" 
          placeholder="●●●●●●●●" 
        />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
        label={translate(
          "pages.register.fields.confirmPassword",
          "Confirm Password"
        )}
        dependencies={["password"]}
        rules={[
          {
            required: true,
            message: translate(
              "pages.register.errors.requiredConfirmPassword",
              "Please confirm your password"
            ),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  translate(
                    "pages.register.errors.passwordsDoNotMatch",
                    "The passwords do not match"
                  )
                )
              );
            },
          }),
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
          size="large" 
          placeholder="●●●●●●●●" 
        />
      </Form.Item>
    </div>
  );
};