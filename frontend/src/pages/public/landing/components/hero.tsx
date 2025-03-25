import React, { useEffect, useState } from "react";

import { Button, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import TrustedBy from "./trusted-by";
import { motion } from "framer-motion";
import { useGetIdentity, useIsAuthenticated } from "@refinedev/core";
import { useNavigate } from "react-router";
import { AccountDto } from "../../../../../generated";

const { Title, Paragraph } = Typography;

const clientHooks = [
  "Find Top Freelancers for Your Next Project",
  "Connect with skilled professionals worldwide.",
  "Hire the best talent for your business needs on Hireable.",
];

const freelancerHooks = [
  "Find Your Next Exciting Project",
  "Connect with potential clients worldwide.",
  "Showcase your skills and earn on Hireable.",
];

const Hero: React.FC = () => {
  const { data: user } = useGetIdentity<AccountDto>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [text, setText] = useState(isFreelancer ? freelancerHooks[0] : clientHooks[0]);

  useEffect(() => {
    const currentHooks = isFreelancer ? freelancerHooks : clientHooks;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentHooks.length);
      setText(currentHooks[currentIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isFreelancer]);

  useEffect(() => {
    if (user?.role === "FREELANCER") {
      setIsFreelancer(true);
    }
  }, [user]);

  const { data: auth } = useIsAuthenticated();
  const nav = useNavigate();
  const handleHireTalentButton = () => {
    if (!auth?.authenticated) {
      nav("/login", { replace: true });
    } else {
      nav(isFreelancer ? "/search?type=work" : "/search?type=talent", { replace: true });
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
              {isFreelancer 
                ? "Discover exciting projects and opportunities. Showcase your expertise and connect with clients looking for your skills."
                : "Connect with skilled professionals worldwide. Hire the best talent for your business needs on Hireable."}
            </Paragraph>
            <div className="flex gap-4">
              <Button
                type="primary"
                size="large"
                onClick={handleHireTalentButton}
              >
                {isFreelancer ? "Find Projects" : "Hire Talent"}
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/public/homepage-banner.jpg"
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
