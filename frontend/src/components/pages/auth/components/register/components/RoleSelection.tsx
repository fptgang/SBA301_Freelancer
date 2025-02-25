import React from 'react';
import { Card, Typography } from 'antd';
import { UserOutlined, LaptopOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface RoleSelectionProps {
  selectedRole: string | null;
  onRoleSelect: (role: string) => void;
}

// Radio circle component for selection indication
const RadioCircle = ({ selected }: { selected: boolean }) => (
  <div
    className="w-6 h-6 border-2 rounded-full flex items-center justify-center"
    style={{ borderColor: "rgb(189,189,188)" }}
  >
    <div
      className={`w-3 h-3 border-2 rounded-full ${
        selected ? "border-green-700 bg-green-700" : "border-white"
      }`}
    />
  </div>
);

export const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  selectedRole, 
  onRoleSelect 
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
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
        Join as a client or freelancer
      </Title>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6 w-full max-w-2xl">
        <Card
          hoverable
          onClick={() => onRoleSelect("CLIENT")}
          className={`w-full md:w-72 p-2 border transition-all ${
            selectedRole === "CLIENT" ? "border-blue-500 shadow-md" : "border-black"
          } bg-white`}
        >
          <div className="flex justify-between items-center mb-4">
            <UserOutlined style={{ fontSize: "2rem", color: "black" }} />
            <RadioCircle selected={selectedRole === "CLIENT"} />
          </div>
          <Text className="block text-lg font-medium text-black">
            I'm a client, hiring for a project
          </Text>
          <Text className="text-gray-500 mt-2">
            Find talent and manage projects
          </Text>
        </Card>

        <Card
          hoverable
          onClick={() => onRoleSelect("FREELANCER")}
          className={`w-full md:w-72 p-2 border transition-all ${
            selectedRole === "FREELANCER" ? "border-blue-500 shadow-md" : "border-black"
          } bg-white`}
        >
          <div className="flex justify-between items-center mb-4">
            <LaptopOutlined style={{ fontSize: "2rem", color: "black" }} />
            <RadioCircle selected={selectedRole === "FREELANCER"} />
          </div>
          <Text className="block text-lg font-medium text-black">
            I'm a freelancer, looking for work
          </Text>
          <Text className="text-gray-500 mt-2">
            Find projects and grow your business
          </Text>
        </Card>
      </div>
    </div>
  );
};