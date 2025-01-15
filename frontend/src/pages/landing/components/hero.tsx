import React, { useEffect, useState } from "react";

import { Button, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import TrustedBy from "./trusted-by";
import { motion } from "framer-motion";
import { useIsAuthenticated } from "@refinedev/core";
import { useNavigate } from "react-router";

const { Title, Paragraph } = Typography;

const text = "Find Top Freelancers for Your Next Project";

const hooks = [
  "Find Top Freelancers for Your Next Project",
  "Connect with skilled professionals worldwide.",
  "Hire the best talent for your business needs on Hireable.",
];
const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState(hooks[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hooks.length);
      setText(hooks[currentIndex]);
    }, 4000); // 4 seconds total (2s for animation + 2s delay)

    return () => clearInterval(interval);
  }, [currentIndex]);
  const { data: auth } = useIsAuthenticated();
  const nav = useNavigate();
  const handleHireTalentButton = () => {
    if (!auth?.authenticated) {
      console.log("Authenticated");
      nav("/login", { replace: true });
    }
  };

  const handleLearnMore = () => {
    if (!auth?.authenticated) {
      nav("/login", { replace: true });
    }
  };

  return (
    <div className="h-[70vh]  flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Title level={1} className="text-4xl md:text-6xl text-black">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {text.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.1,
                      delay: index * 0.05,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            </Title>
            <Paragraph className="text-lg text-gray-600">
              Connect with skilled professionals worldwide. Hire the best talent
              for your business needs on Hireable.
            </Paragraph>
            <div className="flex gap-4">
              <Button
                type="primary"
                size="large"
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
