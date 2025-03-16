import React from 'react';
import { Form, Input, Row, Col, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';

const { Title } = Typography;

interface PersonalInfoProps {
  form: any; // Form instance from parent
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ form }) => {
  const translate = useTranslate();
  
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
        Tell us about yourself
      </Title>
      
      <Row gutter={16}>
        <Col span={24} md={12}>
          <Form.Item
            name="firstName"
            label={translate("pages.register.firstName", "First Name")}
            rules={[
              {
                required: true,
                message: translate(
                  "pages.register.errors.requiredFirstName",
                  "First name is required"
                ),
              },
            ]}
          >
            <Input 
              size="large" 
              placeholder="John" 
              prefix={<UserOutlined className="text-gray-400" />} 
            />
          </Form.Item>
        </Col>
        <Col span={24} md={12}>
          <Form.Item
            name="lastName"
            label={translate("pages.register.lastName", "Last Name")}
            rules={[
              {
                required: true,
                message: translate(
                  "pages.register.errors.requiredLastName",
                  "Last name is required"
                ),
              },
            ]}
          >
            <Input 
              size="large" 
              placeholder="Doe" 
              prefix={<UserOutlined className="text-gray-400" />} 
            />
          </Form.Item>
        </Col>
      </Row>
      
      {/* Additional personal information fields can be added here if needed */}
      <Form.Item
        name="phoneNumber"
        label={translate("pages.register.phoneNumber", "Phone Number (Optional)")}
      >
        <Input 
          size="large" 
          placeholder="+1 (555) 123-4567" 
        />
      </Form.Item>
    </div>
  );
};