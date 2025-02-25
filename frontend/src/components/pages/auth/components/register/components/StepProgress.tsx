import React from 'react';
import { Steps } from 'antd';
import { UserOutlined, SolutionOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface StepProgressProps {
  currentStep: number;
  isComplete?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({ 
  currentStep,
  isComplete = false
}) => {
  const steps = [
    {
      title: 'Account Type',
      icon: <UserOutlined />,
      description: 'Select your role',
    },
    {
      title: 'Personal Info',
      icon: <SolutionOutlined />,
      description: 'Your basic information',
    },
    {
      title: 'Credentials',
      icon: <SafetyOutlined />,
      description: 'Create account credentials',
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      description: 'Review and finish',
    },
  ];

  return (
    <Steps
      current={currentStep}
      items={steps.map((step, index) => ({
        title: step.title,
        description: step.description,
        icon: step.icon,
        disabled: isComplete && index < steps.length - 1,
      }))}
      className="mb-8"
    />
  );
};