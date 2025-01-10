import React from "react";

import { Button, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import TrustedBy from "./trusted-by";

const { Title, Paragraph } = Typography;

const Hero: React.FC = () => {
  const handleHireTalentButton = () => {
    console.log("Hire Talent button clicked");
  };

  const handleLearnMore = () => {
    console.log("Learn More");
  };

  return (
    <div className="h-[70vh] bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Title
              level={1}
              className="text-4xl md:text-6xl font-bold text-gray-800"
            >
              Find Top Freelancers for Your Next Project
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Connect with skilled professionals worldwide. Hire the best talent
              for your business needs on Hireable.
            </Paragraph>
            <div className="flex gap-4">
              <Button
                type="primary"
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleHireTalentButton}
              >
                Hire Talent
              </Button>
              <Button
                size="large"
                className="flex items-center"
                onClick={handleLearnMore}
              >
                Learn More <ArrowRightOutlined className="ml-2" />
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/public/icon.svg"
              alt="Freelancing Platform"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
