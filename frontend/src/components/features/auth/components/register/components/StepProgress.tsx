import React from "react";
import { Steps } from "antd";
import {
  UserOutlined,
  SolutionOutlined,
  SafetyOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  isComplete?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps = 4,
  isComplete = false,
}) => {
  const baseSteps = [
    {
      title: "Account Type",
      icon: <UserOutlined />,
      description: "Select your role",
    },
    {
      title: "Personal Info",
      icon: <SolutionOutlined />,
      description: "Your basic information",
    },
    {
      title: "Credentials",
      icon: <SafetyOutlined />,
      description: "Create account credentials",
    },
  ];

  // If totalSteps is 5, add a profile step before completion
  const steps =
    totalSteps === 5
      ? [
          ...baseSteps,
          {
            title: "Profile",
            icon: <ProfileOutlined />,
            description: "Professional details",
          },
          {
            title: "Complete",
            icon: <CheckCircleOutlined />,
            description: "Review and finish",
          },
        ]
      : [
          ...baseSteps,
          {
            title: "Complete",
            icon: <CheckCircleOutlined />,
            description: "Review and finish",
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
