import React from 'react';
import { Typography, Row, Col, Divider, Result } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ConfirmationProps {
  formData: any;
  roleSelected: string | null;
  isComplete: boolean;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ 
  formData, 
  roleSelected,
  isComplete
}) => {
  if (isComplete) {
    return (
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Registration Complete!"
        subTitle="Your account has been created successfully"
        className="text-center"
      />
    );
  }
  
  return (
    <div className="w-full max-w-xl text-center">
      <Title
        level={3}
        style={{
          color: "black",
          textAlign: "center",
          lineHeight: "1.4",
          fontWeight: "500",
          marginBottom: "16px",
        }}
      >
        Review Your Information
      </Title>
      
      <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
        Please review your information before completing your registration
      </Paragraph>
      
      <div className="text-left p-6 bg-gray-50 rounded-lg mb-6 border border-gray-200">
        <div className="mb-4">
          <Text strong className="block mb-2 text-lg">Account Type</Text>
          <div className="bg-white p-3 rounded border border-gray-200">
            {roleSelected === 'CLIENT' ? 'Client (Hiring)' : 'Freelancer (Working)'}
          </div>
        </div>
        
        <Divider className="my-4" />
        
        <div className="mb-4">
          <Text strong className="block mb-2 text-lg">Personal Information</Text>
          <Row gutter={[16, 16]} className="bg-white p-3 rounded border border-gray-200">
            <Col span={12}>
              <Text type="secondary">First Name</Text>
              <div>{formData.firstName}</div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Last Name</Text>
              <div>{formData.lastName}</div>
            </Col>
            {formData.phoneNumber && (
              <Col span={24}>
                <Text type="secondary">Phone Number</Text>
                <div>{formData.phoneNumber}</div>
              </Col>
            )}
          </Row>
        </div>
        
        <Divider className="my-4" />
        
        <div>
          <Text strong className="block mb-2 text-lg">Account Information</Text>
          <div className="bg-white p-3 rounded border border-gray-200">
            <Row>
              <Col span={24} className="mb-2">
                <Text type="secondary">Email</Text>
                <div>{formData.email}</div>
              </Col>
              <Col span={24}>
                <Text type="secondary">Password</Text>
                <div>••••••••</div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      
      <Paragraph className="text-gray-500 text-sm">
        By clicking "Complete Registration", you agree to our Terms of Service and Privacy Policy.
      </Paragraph>
    </div>
  );
};